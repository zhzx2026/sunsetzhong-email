package dev.indevs.sunsetzhong.email.data.local.dao

import androidx.room.*
import dev.indevs.sunsetzhong.email.data.local.entity.EmailEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface EmailDao {
    @Query("SELECT * FROM emails WHERE direction = :direction ORDER BY createdAt DESC")
    fun getAllByDirection(direction: String): Flow<List<EmailEntity>>

    @Query("SELECT * FROM emails WHERE id = :id")
    suspend fun getById(id: String): EmailEntity?

    @Upsert
    suspend fun upsertAll(emails: List<EmailEntity>)

    @Query("DELETE FROM emails WHERE id = :id")
    suspend fun deleteById(id: String)

    @Query("DELETE FROM emails WHERE direction = :direction")
    suspend fun deleteAllByDirection(direction: String)
}
