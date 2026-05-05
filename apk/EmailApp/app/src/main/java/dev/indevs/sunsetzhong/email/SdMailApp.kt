package dev.indevs.sunsetzhong.email

import android.app.Application
import android.app.NotificationChannel
import android.app.NotificationManager
import android.os.Build
import androidx.work.*
import dev.indevs.sunsetzhong.email.worker.EmailPollWorker
import dev.indevs.sunsetzhong.email.worker.UpdateCheckWorker
import java.util.concurrent.TimeUnit

class SdMailApp : Application() {

    lateinit var container: AppContainer
        private set

    override fun onCreate() {
        super.onCreate()
        instance = this
        container = AppContainer(this)
        createNotificationChannels()
        scheduleWorkers()
    }

    private fun createNotificationChannels() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channels = listOf(
                NotificationChannel(
                    CHANNEL_NEW_MAIL,
                    "新邮件",
                    NotificationManager.IMPORTANCE_HIGH
                ).apply { description = "新邮件通知"; enableVibration(true) },
                NotificationChannel(
                    CHANNEL_BG_SERVICE,
                    "后台服务",
                    NotificationManager.IMPORTANCE_LOW
                ).apply { description = "后台邮件检查" },
                NotificationChannel(
                    CHANNEL_UPDATE,
                    "应用更新",
                    NotificationManager.IMPORTANCE_DEFAULT
                ).apply { description = "版本更新通知" },
            )
            val nm = getSystemService(NotificationManager::class.java)
            channels.forEach { nm.createNotificationChannel(it) }
        }
    }

    private fun scheduleWorkers() {
        WorkManager.getInstance(this).apply {
            enqueueUniquePeriodicWork(
                "email_poll",
                ExistingPeriodicWorkPolicy.KEEP,
                PeriodicWorkRequestBuilder<EmailPollWorker>(15, TimeUnit.MINUTES)
                    .setConstraints(Constraints.Builder().setRequiredNetworkType(NetworkType.CONNECTED).build())
                    .build()
            )
            enqueueUniquePeriodicWork(
                "update_check",
                ExistingPeriodicWorkPolicy.KEEP,
                PeriodicWorkRequestBuilder<UpdateCheckWorker>(24, TimeUnit.HOURS)
                    .setConstraints(Constraints.Builder().setRequiredNetworkType(NetworkType.CONNECTED).build())
                    .build()
            )
        }
    }

    companion object {
        const val CHANNEL_NEW_MAIL = "new_mail"
        const val CHANNEL_BG_SERVICE = "bg_service"
        const val CHANNEL_UPDATE = "app_update"

        lateinit var instance: SdMailApp
            private set
    }
}
