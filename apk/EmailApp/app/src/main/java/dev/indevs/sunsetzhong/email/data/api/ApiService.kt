package dev.indevs.sunsetzhong.email.data.api

import dev.indevs.sunsetzhong.email.data.model.*
import retrofit2.Response
import retrofit2.http.*

interface ApiService {
    // ── Auth ──
    @POST("api/auth/login")
    suspend fun login(@Body body: LoginRequest): Response<UserResponse>

    @POST("api/auth/register")
    suspend fun register(@Body body: LoginRequest): Response<UserResponse>

    @POST("api/auth/logout")
    suspend fun logout(): Response<OkResponse>

    @GET("api/auth/me")
    suspend fun me(): Response<UserResponse>

    @POST("api/auth/password")
    suspend fun changePassword(@Body body: PasswordChangeRequest): Response<OkResponse>

    @POST("api/auth/device-key")
    suspend fun createDeviceKey(): Response<DeviceKeyResponse>

    @DELETE("api/auth/device-key")
    suspend fun deleteDeviceKey(): Response<OkResponse>

    // ── Emails ──
    @GET("api/inbox")
    suspend fun getInbox(): Response<EmailListResponse>

    @GET("api/sent")
    suspend fun getSent(): Response<EmailListResponse>

    @GET("api/mail/{id}")
    suspend fun getMail(@Path("id") id: String): Response<EmailDetailResponse>

    @DELETE("api/mail/{id}")
    suspend fun deleteMail(@Path("id") id: String): Response<OkResponse>

    @POST("api/send")
    suspend fun send(@Body body: SendRequest): Response<SendResponse>

    @POST("api/reply")
    suspend fun reply(@Body body: ReplyRequest): Response<SendResponse>

    // ── Addresses ──
    @GET("api/addresses")
    suspend fun getAddresses(): Response<AddressListResponse>

    @POST("api/addresses")
    suspend fun createAddress(@Body body: Map<String, String> = emptyMap()): Response<AddressCreateResponse>

    @DELETE("api/addresses/{id}")
    suspend fun deleteAddress(@Path("id") id: String): Response<OkResponse>

    // ── Contacts ──
    @GET("api/contacts")
    suspend fun getContacts(): Response<ContactsResponse>

    // ── Settings ──
    @GET("api/settings/public")
    suspend fun getPublicSettings(): Response<PublicSettingsResponse>

    @GET("api/admin/settings")
    suspend fun getAdminSettings(): Response<AdminSettingsResponse>

    @POST("api/admin/settings")
    suspend fun updateAdminSettings(@Body body: Map<String, String>): Response<OkResponse>

    // ── Version ──
    @GET("api/version")
    suspend fun getVersion(): Response<VersionInfo>
}
