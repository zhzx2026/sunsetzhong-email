package dev.indevs.sunsetzhong.email.data.repository

import dev.indevs.sunsetzhong.email.data.api.ApiService
import dev.indevs.sunsetzhong.email.data.model.*

class SettingsRepository(private val api: ApiService) {

    suspend fun getPublicSettings(): Result<PublicSettings> {
        val resp = api.getPublicSettings()
        if (!resp.isSuccessful || resp.body() == null) {
            return Result.failure(Exception("网络错误"))
        }
        val body = resp.body()!!
        if (!body.ok) {
            return Result.failure(Exception(body.error ?: "加载失败"))
        }
        return Result.success(body.settings ?: PublicSettings())
    }

    suspend fun getAdminSettings(): Result<AdminSettingsResponse> {
        val resp = api.getAdminSettings()
        if (!resp.isSuccessful || resp.body() == null) {
            return Result.failure(Exception("网络错误"))
        }
        val body = resp.body()!!
        if (!body.ok) {
            return Result.failure(Exception(body.error ?: "需要管理员权限"))
        }
        return Result.success(body)
    }

    suspend fun updateAdminSettings(settings: Map<String, String>): Result<Unit> {
        val resp = api.updateAdminSettings(settings)
        if (!resp.isSuccessful || resp.body() == null) {
            return Result.failure(Exception("网络错误"))
        }
        val body = resp.body()!!
        if (!body.ok) {
            return Result.failure(Exception(body.error ?: "更新失败"))
        }
        return Result.success(Unit)
    }

    suspend fun getVersion(): Result<VersionInfo> {
        val resp = api.getVersion()
        if (!resp.isSuccessful || resp.body() == null) {
            return Result.failure(Exception("网络错误"))
        }
        val body = resp.body()!!
        if (!body.ok) {
            return Result.failure(Exception(body.error ?: "获取版本失败"))
        }
        return Result.success(body)
    }
}
