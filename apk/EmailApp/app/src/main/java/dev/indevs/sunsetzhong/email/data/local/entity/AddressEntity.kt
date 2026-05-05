package dev.indevs.sunsetzhong.email.data.local.entity

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "addresses")
data class AddressEntity(
    @PrimaryKey val id: String,
    val name: String,
    val fullAddress: String,
    val createdAt: String? = null,
)
