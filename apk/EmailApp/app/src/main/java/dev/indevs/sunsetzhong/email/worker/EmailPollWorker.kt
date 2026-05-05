package dev.indevs.sunsetzhong.email.worker

import android.content.Context
import android.util.Log
import androidx.work.*
import dev.indevs.sunsetzhong.email.SdMailApp
import dev.indevs.sunsetzhong.email.notification.NotificationHelper
import kotlinx.coroutines.flow.firstOrNull
import java.util.concurrent.TimeUnit

class EmailPollWorker(
    context: Context,
    params: WorkerParameters,
) : CoroutineWorker(context, params) {

    override suspend fun doWork(): Result {
        val prefs = SdMailApp.instance.container.prefs
        val token = prefs.deviceToken.firstOrNull()
        if (token.isNullOrEmpty()) return Result.success()

        val emailRepo = SdMailApp.instance.container.emailRepository

        return try {
            val resp = emailRepo.refreshInbox()
            resp.fold(
                onSuccess = { emails ->
                    val knownIds = prefs.knownIds.firstOrNull()
                    val currentIds = emails.map { it.id }.toSet()

                    if (knownIds != null && knownIds.isNotEmpty()) {
                        val newEmails = emails.filter { it.id !in knownIds }
                        if (newEmails.isNotEmpty()) {
                            NotificationHelper.showNewMailNotification(
                                applicationContext,
                                newEmails.size,
                                newEmails.map { it.subject ?: "无主题" },
                            )
                        }
                    }
                    prefs.setKnownIds(currentIds)
                    Result.success()
                },
                onFailure = {
                    if (runAttemptCount < 3) Result.retry() else Result.failure()
                },
            )
        } catch (e: Exception) {
            Log.e("EmailPollWorker", "Poll failed", e)
            if (runAttemptCount < 3) Result.retry() else Result.failure()
        }
    }
}
