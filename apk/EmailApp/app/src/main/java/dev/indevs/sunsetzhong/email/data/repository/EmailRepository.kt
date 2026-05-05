package dev.indevs.sunsetzhong.email.data.repository

import dev.indevs.sunsetzhong.email.data.api.ApiService
import dev.indevs.sunsetzhong.email.data.local.dao.EmailDao
import dev.indevs.sunsetzhong.email.data.local.entity.EmailEntity
import dev.indevs.sunsetzhong.email.data.model.*
import dev.indevs.sunsetzhong.email.data.preferences.PreferencesManager
import kotlinx.coroutines.flow.Flow

class EmailRepository(
    private val api: ApiService,
    private val emailDao: EmailDao,
    private val prefs: PreferencesManager,
) {
    fun getCachedInbox(): Flow<List<EmailEntity>> = emailDao.getAllByDirection("inbound")
    fun getCachedSent(): Flow<List<EmailEntity>> = emailDao.getAllByDirection("outbound")

    suspend fun refreshInbox(): Result<List<EmailEntity>> {
        val resp = api.getInbox()
        if (!resp.isSuccessful || resp.body() == null) {
            return Result.failure(Exception("网络错误"))
        }
        val body = resp.body()!!
        if (!body.ok) {
            return Result.failure(Exception(body.error ?: "加载失败"))
        }
        val items = body.items ?: emptyList()
        // Cache to Room
        emailDao.deleteAllByDirection("inbound")
        val entities = items.map { it.toEntity("inbound") }
        emailDao.upsertAll(entities)
        // Update known IDs for notification detection
        prefs.setKnownIds(items.map { it.id }.toSet())
        return Result.success(entities)
    }

    suspend fun refreshSent(): Result<List<EmailEntity>> {
        val resp = api.getSent()
        if (!resp.isSuccessful || resp.body() == null) {
            return Result.failure(Exception("网络错误"))
        }
        val body = resp.body()!!
        if (!body.ok) {
            return Result.failure(Exception(body.error ?: "加载失败"))
        }
        val items = body.items ?: emptyList()
        emailDao.deleteAllByDirection("outbound")
        val entities = items.map { it.toEntity("outbound") }
        emailDao.upsertAll(entities)
        return Result.success(entities)
    }

    suspend fun getMail(id: String): Result<Email> {
        val resp = api.getMail(id)
        if (!resp.isSuccessful || resp.body() == null) {
            return Result.failure(Exception("网络错误"))
        }
        val body = resp.body()!!
        if (!body.ok || body.data == null) {
            return Result.failure(Exception(body.error ?: "未找到"))
        }
        return Result.success(body.data)
    }

    suspend fun deleteMail(id: String): Result<Unit> {
        val resp = api.deleteMail(id)
        if (!resp.isSuccessful || resp.body() == null) {
            return Result.failure(Exception("网络错误"))
        }
        val body = resp.body()!!
        if (!body.ok) {
            return Result.failure(Exception(body.error ?: "删除失败"))
        }
        emailDao.deleteById(id)
        return Result.success(Unit)
    }

    suspend fun send(from: String, to: String, subject: String, html: String?, text: String?): Result<String> {
        val resp = api.send(SendRequest(from, to, subject, html, text))
        if (!resp.isSuccessful || resp.body() == null) {
            return Result.failure(Exception("网络错误"))
        }
        val body = resp.body()!!
        if (!body.ok) {
            return Result.failure(Exception(body.error ?: body.detail?.toString() ?: "发送失败"))
        }
        return Result.success(body.data?.id ?: "")
    }

    suspend fun reply(from: String, to: String, subject: String, html: String?, text: String?,
                      inReplyTo: String?, references: String?): Result<String> {
        val resp = api.reply(ReplyRequest(from, to, subject, html, text, inReplyTo, references))
        if (!resp.isSuccessful || resp.body() == null) {
            return Result.failure(Exception("网络错误"))
        }
        val body = resp.body()!!
        if (!body.ok) {
            return Result.failure(Exception(body.error ?: body.detail?.toString() ?: "发送失败"))
        }
        return Result.success(body.data?.id ?: "")
    }
}

private fun Email.toEntity(direction: String) = EmailEntity(
    id = id,
    source = source,
    subject = subject,
    bodyText = bodyText,
    bodyHtml = bodyHtml,
    address = address,
    messageId = messageId,
    createdAt = createdAt,
    direction = direction,
)
