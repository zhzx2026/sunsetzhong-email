package dev.indevs.sunsetzhong.email

import android.content.Context
import dev.indevs.sunsetzhong.email.data.api.RetrofitClient
import dev.indevs.sunsetzhong.email.data.local.AppDatabase
import dev.indevs.sunsetzhong.email.data.preferences.PreferencesManager
import dev.indevs.sunsetzhong.email.data.repository.*

class AppContainer(context: Context) {
    val prefs = PreferencesManager(context)
    val api = RetrofitClient.create(prefs)
    val db = AppDatabase.getInstance(context)

    val authRepository = AuthRepository(api, prefs)
    val emailRepository = EmailRepository(api, db.emailDao(), prefs)
    val addressRepository = AddressRepository(api)
    val settingsRepository = SettingsRepository(api)
}
