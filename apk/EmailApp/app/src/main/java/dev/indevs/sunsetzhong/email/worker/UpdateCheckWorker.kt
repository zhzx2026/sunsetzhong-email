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
import dev.indevs.sunsetzhong.email.MainActivity
import dev.indevs.sunsetzhong.email.SdMailApp
import java.io.File
import java.io.FileOutputStream
import java.net.HttpURLConnection
import java.net.URL
import java.util.concurrent.TimeUnit

class UpdateCheckWorker(
    context: Context,
    params: WorkerParameters,
) : CoroutineWorker(context, params) {

    override suspend fun doWork(): Result {
        return try {
            val versionResp = URL("https://sunsetzhong.indevs.in/api/version")
                .openConnection().apply {
                    connectTimeout = 10000; readTimeout = 10000
                } as HttpURLConnection

            val body = versionResp.inputStream.bufferedReader().readText()
            versionResp.disconnect()

            val remoteVer = Regex("\"version\"\\s*:\\s*\"([^\"]+)\"").find(body)?.groupValues?.get(1) ?: ""
            if (remoteVer.isEmpty()) return Result.success()

            val localVer = try {
                applicationContext.packageManager.getPackageInfo(applicationContext.packageName, 0).versionName
            } catch (_: PackageManager.NameNotFoundException) { "" }

            if (remoteVer == localVer) return Result.success()

            // Download APK
            val file = File(applicationContext.getExternalFilesDir(Environment.DIRECTORY_DOWNLOADS), "update.apk")
            val dl = URL("https://sunsetzhong.indevs.in/app.apk").openConnection().apply {
                connectTimeout = 30000; readTimeout = 120000
            } as HttpURLConnection
            if (dl.responseCode != 200) return Result.success()

            dl.inputStream.use { input ->
                FileOutputStream(file).use { output -> input.copyTo(output) }
            }
            dl.disconnect()

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
                PendingIntent.FLAG_UPDATE_CURRENT or (if (Build.VERSION.SDK_INT >= 23) PendingIntent.FLAG_IMMUTABLE else 0)
            )

            val notif = NotificationCompat.Builder(applicationContext, SdMailApp.CHANNEL_UPDATE)
                .setSmallIcon(android.R.drawable.ic_dialog_info)
                .setContentTitle("新版本 $remoteVer 已下载")
                .setContentText("点击安装更新")
                .setAutoCancel(true)
                .setContentIntent(pi)
                .build()

            NotificationManagerCompat.from(applicationContext).notify(9001, notif)
            Result.success()
        } catch (e: Exception) {
            Log.e("UpdateCheckWorker", "Update check failed", e)
            Result.success() // Don't retry — try again next time
        }
    }
}
