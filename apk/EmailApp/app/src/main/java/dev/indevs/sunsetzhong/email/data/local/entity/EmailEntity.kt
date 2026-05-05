package dev.indevs.sunsetzhong.email.data.local.entity

import androidx.room.Entity
import androidx.room.PrimaryKey
import dev.indevs.sunsetzhong.email.data.model.Email

@Entity(tableName = "emails")
data class EmailEntity(
    @PrimaryKey val id: String,
    val source: String? = null,
    val subject: String? = null,
    val bodyText: String? = null,
    val bodyHtml: String? = null,
    val address: String? = null,
    val messageId: String? = null,
    val createdAt: String? = null,
    val direction: String? = null,
)

fun EmailEntity.toModel() = Email(
    id = id, source = source, subject = subject,
    bodyText = bodyText, bodyHtml = bodyHtml,
    address = address, messageId = messageId,
    createdAt = createdAt,
)
