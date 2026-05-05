package dev.indevs.sunsetzhong.email.notification

import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.os.Build
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat
import dev.indevs.sunsetzhong.email.MainActivity
import dev.indevs.sunsetzhong.email.SdMailApp
import dev.indevs.sunsetzhong.email.R

object NotificationHelper {

    fun showNewMailNotification(context: Context, count: Int, titles: List<String>) {
        val title = if (count == 1) "新邮件" else "$count 封新邮件"
        val body = if (count == 1) titles.firstOrNull() ?: "您有新邮件"
            else titles.take(3).joinToString("、") + if (count > 3) "等" else ""

        val intent = Intent(context, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
        }
        val pi = PendingIntent.getActivity(
            context, 0, intent,
            PendingIntent.FLAG_UPDATE_CURRENT or (if (Build.VERSION.SDK_INT >= 23) PendingIntent.FLAG_IMMUTABLE else 0)
        )

        val notif = NotificationCompat.Builder(context, SdMailApp.CHANNEL_NEW_MAIL)
            .setSmallIcon(android.R.drawable.ic_dialog_email)
            .setContentTitle(title)
            .setContentText(body)
            .setContentIntent(pi)
            .setAutoCancel(true)
            .setVibrate(longArrayOf(200, 100, 200))
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .build()

        try {
            NotificationManagerCompat.from(context).notify((System.currentTimeMillis() % Int.MAX_VALUE).toInt(), notif)
        } catch (_: SecurityException) {}
    }
}
