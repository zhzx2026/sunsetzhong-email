package dev.indevs.sunsetzhong.email.worker

import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Build
import android.os.Environment
import android.util.Log
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat
import androidx.core.content.FileProvider
import androidx.work.*
import dev.indevs.sunsetzhong.email.BuildConfig
import dev.indevs.sunsetzhong.email.MainActivity
import dev.indevs.sunsetzhong.email.SdMailApp
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.OkHttpClient
import okhttp3.Request
import java.io.File
import java.io.FileOutputStream
import java.util.concurrent.TimeUnit

class UpdateCheckWorker(
    context: Context,
    params: WorkerParameters,
) : CoroutineWorker(context, params) {

    override suspend fun doWork(): Result = withContext(Dispatchers.IO) {
        try {
            val client = OkHttpClient.Builder()
                .connectTimeout(10, TimeUnit.SECONDS)
                .readTimeout(10, TimeUnit.SECONDS)
                .build()

            // Fetch version info
            val versionRequest = Request.Builder()
                .url("${BuildConfig.BASE_URL}api/version")
                .build()
            val versionBody = client.newCall(versionRequest).execute().use { response ->
                if (!response.isSuccessful) return@withContext Result.success()
                response.body?.string() ?: return@withContext Result.success()
            }

            val remoteVer = Regex("\"version\"\\s*:\\s*\"([^\"]+)\"")
                .find(versionBody)?.groupValues?.get(1) ?: ""
            if (remoteVer.isEmpty()) return@withContext Result.success()

            val localVer = try {
                applicationContext.packageManager
                    .getPackageInfo(applicationContext.packageName, 0).versionName
            } catch (_: PackageManager.NameNotFoundException) { "" }

            if (remoteVer == localVer) return@withContext Result.success()

            // Use apk_url from API response if present, otherwise fall back to default
            val apkUrl = Regex("\"apk_url\"\\s*:\\s*\"([^\"]+)\"")
                .find(versionBody)?.groupValues?.get(1)
                ?: "${BuildConfig.BASE_URL}app.apk"

            // Download APK
            val file = File(
                applicationContext.getExternalFilesDir(Environment.DIRECTORY_DOWNLOADS),
                "update.apk"
            )
            val downloadClient = OkHttpClient.Builder()
                .connectTimeout(30, TimeUnit.SECONDS)
                .readTimeout(120, TimeUnit.SECONDS)
                .build()
            val dlRequest = Request.Builder().url(apkUrl).build()
            downloadClient.newCall(dlRequest).execute().use { response ->
                if (!response.isSuccessful) return@withContext Result.success()
                response.body?.byteStream()?.use { input ->
                    FileOutputStream(file).use { output -> input.copyTo(output) }
                }
            }

            // Show install notification
            val uri = FileProvider.getUriForFile(
                applicationContext,
                "${applicationContext.packageName}.fileprovider",
                file
            )
            val installIntent = Intent(Intent.ACTION_VIEW).apply {
                setDataAndType(uri, "application/vnd.android.package-archive")
                addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION or Intent.FLAG_ACTIVITY_NEW_TASK)
            }
            val pi = PendingIntent.getActivity(
                applicationContext, 0, installIntent,
                PendingIntent.FLAG_UPDATE_CURRENT or
                    (if (Build.VERSION.SDK_INT >= 23) PendingIntent.FLAG_IMMUTABLE else 0)
            )

            val notif = NotificationCompat.Builder(applicationContext, SdMailApp.CHANNEL_UPDATE)
                .setSmallIcon(R.drawable.ic_notification)
                .setContentTitle("新版本 $remoteVer 已下载")
                .setContentText("点击安装更新")
                .setAutoCancel(true)
                .setContentIntent(pi)
                .build()

            NotificationManagerCompat.from(applicationContext).notify(9001, notif)
            Result.success()
        } catch (e: Exception) {
            Log.e("UpdateCheckWorker", "Update check failed", e)
            Result.success()
        }
    }
}
