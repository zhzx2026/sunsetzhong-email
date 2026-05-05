package dev.indevs.sunsetzhong.email.data.local

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase
import dev.indevs.sunsetzhong.email.data.local.dao.AddressDao
import dev.indevs.sunsetzhong.email.data.local.dao.EmailDao
import dev.indevs.sunsetzhong.email.data.local.entity.AddressEntity
import dev.indevs.sunsetzhong.email.data.local.entity.EmailEntity

@Database(
    entities = [EmailEntity::class, AddressEntity::class],
    version = 1,
    exportSchema = false,
)
abstract class AppDatabase : RoomDatabase() {
    abstract fun emailDao(): EmailDao
    abstract fun addressDao(): AddressDao

    companion object {
        @Volatile
        private var INSTANCE: AppDatabase? = null

        fun getInstance(context: Context): AppDatabase {
            return INSTANCE ?: synchronized(this) {
                INSTANCE ?: Room.databaseBuilder(
                    context.applicationContext,
                    AppDatabase::class.java,
                    "smail_cache.db"
                )
                    .fallbackToDestructiveMigration()
                    .build()
                    .also { INSTANCE = it }
            }
        }
    }
}
