package dev.indevs.sunsetzhong.email.data.preferences

import android.content.Context
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.*
import androidx.datastore.preferences.preferencesDataStore
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map

private val Context.dataStore: DataStore<Preferences> by preferencesDataStore(name = "smail_prefs")

class PreferencesManager(private val context: Context) {
    companion object {
        private val KEY_DEVICE_TOKEN = stringPreferencesKey("device_token")
        private val KEY_USER_ID = stringPreferencesKey("user_id")
        private val KEY_USERNAME = stringPreferencesKey("username")
        private val KEY_USER_ROLE = stringPreferencesKey("user_role")
        private val KEY_THEME_MODE = stringPreferencesKey("theme_mode")
        private val KEY_KNOWN_IDS = stringPreferencesKey("known_ids")
    }

    val deviceToken: Flow<String?> = context.dataStore.data.map { it[KEY_DEVICE_TOKEN] }
    val userId: Flow<String?> = context.dataStore.data.map { it[KEY_USER_ID] }
    val username: Flow<String?> = context.dataStore.data.map { it[KEY_USERNAME] }
    val userRole: Flow<String?> = context.dataStore.data.map { it[KEY_USER_ROLE] }
    val themeMode: Flow<String> = context.dataStore.data.map { it[KEY_THEME_MODE] ?: "system" }
    val knownIds: Flow<Set<String>> = context.dataStore.data.map {
        (it[KEY_KNOWN_IDS] ?: "").split(",").filter { id -> id.isNotEmpty() }.toSet()
    }

    suspend fun setDeviceToken(token: String) {
        context.dataStore.edit { it[KEY_DEVICE_TOKEN] = token }
    }

    suspend fun setUser(id: String, username: String, role: String) {
        context.dataStore.edit {
            it[KEY_USER_ID] = id
            it[KEY_USERNAME] = username
            it[KEY_USER_ROLE] = role
        }
    }

    suspend fun setThemeMode(mode: String) {
        context.dataStore.edit { it[KEY_THEME_MODE] = mode }
    }

    suspend fun setKnownIds(ids: Set<String>) {
        context.dataStore.edit { it[KEY_KNOWN_IDS] = ids.joinToString(",") }
    }

    suspend fun clearAuth() {
        context.dataStore.edit {
            it.remove(KEY_DEVICE_TOKEN)
            it.remove(KEY_USER_ID)
            it.remove(KEY_USERNAME)
            it.remove(KEY_USER_ROLE)
            it.remove(KEY_KNOWN_IDS)
        }
    }
}
