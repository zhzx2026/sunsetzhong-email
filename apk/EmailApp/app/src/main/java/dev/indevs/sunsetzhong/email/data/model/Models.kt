package dev.indevs.sunsetzhong.email.data.model

import com.google.gson.annotations.SerializedName

// ── Generic API wrapper ──

data class ApiResponse<T>(
    val ok: Boolean,
    val error: String? = null,
)

data class OkResponse(val ok: Boolean, val error: String? = null)

// ── Auth ──

data class LoginRequest(val username: String, val password: String)

data class User(
    val id: String,
    val username: String,
    val role: String,
)

data class UserResponse(
    val ok: Boolean,
    val user: User? = null,
    val error: String? = null,
)

data class DeviceKeyResponse(
    val ok: Boolean,
    val token: String? = null,
    val error: String? = null,
)

data class PasswordChangeRequest(
    @SerializedName("old_password") val oldPassword: String,
    @SerializedName("new_password") val newPassword: String,
)

// ── Email ──

data class Email(
    val id: String,
    val source: String? = null,
    val subject: String? = null,
    @SerializedName("body_text") val bodyText: String? = null,
    @SerializedName("body_html") val bodyHtml: String? = null,
    val address: String? = null,
    @SerializedName("message_id") val messageId: String? = null,
    @SerializedName("created_at") val createdAt: String? = null,
    @SerializedName("raw_json") val rawJson: String? = null,
) {
    val displayName: String
        get() {
            val raw = source ?: address ?: "未知"
            return raw.replace(Regex("<.*?>|\\\""), "").trim()
        }

    val shortName: String
        get() = displayName.split("@").firstOrNull() ?: displayName
}

data class EmailListResponse(
    val ok: Boolean,
    val items: List<Email>? = null,
    val error: String? = null,
)

data class EmailDetailResponse(
    val ok: Boolean,
    val data: Email? = null,
    val error: String? = null,
)

data class SendRequest(
    val from: String,
    val to: String,
    val subject: String,
    val html: String? = null,
    val text: String? = null,
)

data class ReplyRequest(
    val from: String,
    val to: String,
    val subject: String,
    val html: String? = null,
    val text: String? = null,
    @SerializedName("in_reply_to") val inReplyTo: String? = null,
    val references: String? = null,
)

data class SendResponse(
    val ok: Boolean,
    val data: SendResult? = null,
    val error: String? = null,
    val detail: Any? = null,
)

data class SendResult(val id: String)

// ── Addresses ──

data class TempAddress(
    val id: String,
    val name: String,
    @SerializedName("full_address") val fullAddress: String,
    @SerializedName("created_at") val createdAt: String? = null,
)

data class AddressListResponse(
    val ok: Boolean,
    val items: List<TempAddress>? = null,
    val error: String? = null,
)

data class AddressCreateResponse(
    val ok: Boolean,
    val data: TempAddress? = null,
    val error: String? = null,
)

// ── Contacts ──

data class ContactsResponse(
    val ok: Boolean,
    val contacts: List<String>? = null,
    val error: String? = null,
)

// ── Settings ──

data class PublicSettings(
    @SerializedName("poll_ms") val pollMs: String? = null,
    @SerializedName("max_temp_addresses") val maxTempAddresses: String? = null,
)

data class PublicSettingsResponse(
    val ok: Boolean,
    val settings: PublicSettings? = null,
    val error: String? = null,
)

data class AdminSettingsResponse(
    val ok: Boolean,
    val settings: Map<String, String>? = null,
    val userCount: Int? = null,
    val error: String? = null,
)

// ── Version ──

data class VersionInfo(
    val ok: Boolean,
    val version: String? = null,
    @SerializedName("apk_url") val apkUrl: String? = null,
    val error: String? = null,
)
