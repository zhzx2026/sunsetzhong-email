package dev.indevs.sunsetzhong.email.data.local.dao

import androidx.room.*
import dev.indevs.sunsetzhong.email.data.local.entity.AddressEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface AddressDao {
    @Query("SELECT * FROM addresses ORDER BY createdAt DESC")
    fun getAll(): Flow<List<AddressEntity>>

    @Upsert
    suspend fun upsertAll(addresses: List<AddressEntity>)

    @Query("DELETE FROM addresses WHERE id = :id")
    suspend fun deleteById(id: String)

    @Query("DELETE FROM addresses")
    suspend fun deleteAll()
}
