package dev.indevs.sunsetzhong.email.data.repository

import dev.indevs.sunsetzhong.email.data.api.ApiService
import dev.indevs.sunsetzhong.email.data.model.*
import dev.indevs.sunsetzhong.email.data.preferences.PreferencesManager

class AuthRepository(
    private val api: ApiService,
    private val prefs: PreferencesManager,
) {
    suspend fun login(username: String, password: String): Result<User> {
        val resp = api.login(LoginRequest(username, password))
        if (!resp.isSuccessful || resp.body() == null) {
            return Result.failure(Exception("网络错误"))
        }
        val body = resp.body()!!
        if (!body.ok || body.user == null) {
            return Result.failure(Exception(body.error ?: "登录失败"))
        }
        // Now create device token for persistent auth
        val tokenResp = api.createDeviceKey()
        if (tokenResp.isSuccessful && tokenResp.body()?.ok == true && tokenResp.body()?.token != null) {
            prefs.setDeviceToken(tokenResp.body()!!.token!!)
        }
        prefs.setUser(body.user.id, body.user.username, body.user.role)
        return Result.success(body.user)
    }

    suspend fun register(username: String, password: String): Result<User> {
        val resp = api.register(LoginRequest(username, password))
        if (!resp.isSuccessful || resp.body() == null) {
            return Result.failure(Exception("网络错误"))
        }
        val body = resp.body()!!
        if (!body.ok || body.user == null) {
            return Result.failure(Exception(body.error ?: "注册失败"))
        }
        // Create device token
        val tokenResp = api.createDeviceKey()
        if (tokenResp.isSuccessful && tokenResp.body()?.ok == true && tokenResp.body()?.token != null) {
            prefs.setDeviceToken(tokenResp.body()!!.token!!)
        }
        prefs.setUser(body.user.id, body.user.username, body.user.role)
        return Result.success(body.user)
    }

    suspend fun logout() {
        try { api.deleteDeviceKey() } catch (_: Exception) {}
        try { api.logout() } catch (_: Exception) {}
        prefs.clearAuth()
    }

    suspend fun changePassword(oldPassword: String, newPassword: String): Result<Unit> {
        val resp = api.changePassword(PasswordChangeRequest(oldPassword, newPassword))
        if (!resp.isSuccessful || resp.body() == null) {
            return Result.failure(Exception("网络错误"))
        }
        val body = resp.body()!!
        if (!body.ok) {
            return Result.failure(Exception(body.error ?: "修改失败"))
        }
        return Result.success(Unit)
    }

    suspend fun refreshDeviceKey(): Result<String> {
        val resp = api.createDeviceKey()
        if (!resp.isSuccessful || resp.body() == null) {
            return Result.failure(Exception("网络错误"))
        }
        val body = resp.body()!!
        if (!body.ok || body.token == null) {
            return Result.failure(Exception(body.error ?: "创建失败"))
        }
        prefs.setDeviceToken(body.token)
        return Result.success(body.token)
    }
}
