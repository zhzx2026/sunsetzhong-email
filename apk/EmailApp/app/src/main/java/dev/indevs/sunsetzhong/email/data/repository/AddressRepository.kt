package dev.indevs.sunsetzhong.email.data.repository

import dev.indevs.sunsetzhong.email.data.api.ApiService
import dev.indevs.sunsetzhong.email.data.model.*

class AddressRepository(private val api: ApiService) {

    suspend fun getAddresses(): Result<List<TempAddress>> {
        val resp = api.getAddresses()
        if (!resp.isSuccessful || resp.body() == null) {
            return Result.failure(Exception("网络错误"))
        }
        val body = resp.body()!!
        if (!body.ok) {
            return Result.failure(Exception(body.error ?: "加载失败"))
        }
        return Result.success(body.items ?: emptyList())
    }

    suspend fun createAddress(): Result<TempAddress> {
        val resp = api.createAddress()
        if (!resp.isSuccessful || resp.body() == null) {
            return Result.failure(Exception("网络错误"))
        }
        val body = resp.body()!!
        if (!body.ok || body.data == null) {
            return Result.failure(Exception(body.error ?: "创建失败"))
        }
        return Result.success(body.data)
    }

    suspend fun deleteAddress(id: String): Result<Unit> {
        val resp = api.deleteAddress(id)
        if (!resp.isSuccessful || resp.body() == null) {
            return Result.failure(Exception("网络错误"))
        }
        val body = resp.body()!!
        if (!body.ok) {
            return Result.failure(Exception(body.error ?: "删除失败"))
        }
        return Result.success(Unit)
    }

    suspend fun getContacts(): Result<List<String>> {
        val resp = api.getContacts()
        if (!resp.isSuccessful || resp.body() == null) {
            return Result.failure(Exception("网络错误"))
        }
        val body = resp.body()!!
        if (!body.ok) {
            return Result.failure(Exception(body.error ?: "加载失败"))
        }
        return Result.success(body.contacts ?: emptyList())
    }
}
