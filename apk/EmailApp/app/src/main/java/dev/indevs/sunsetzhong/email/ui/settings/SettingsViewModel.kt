package dev.indevs.sunsetzhong.email.ui.settings

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import dev.indevs.sunsetzhong.email.SdMailApp
import dev.indevs.sunsetzhong.email.data.model.TempAddress
import dev.indevs.sunsetzhong.email.data.preferences.PreferencesManager
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch

data class SettingsUiState(
    val username: String = "",
    val role: String = "",
    val themeMode: String = "system",
    val addresses: List<TempAddress> = emptyList(),
    val addressesLoading: Boolean = false,
    val maxTempAddresses: Int = 5,
    val version: String = "",
    val showLogoutConfirm: Boolean = false,
    val error: String? = null,
)

class SettingsViewModel : ViewModel() {
    private val authRepo = SdMailApp.instance.container.authRepository
    private val addressRepo = SdMailApp.instance.container.addressRepository
    private val settingsRepo = SdMailApp.instance.container.settingsRepository
    private val prefs = SdMailApp.instance.container.prefs

    private val _state = MutableStateFlow(SettingsUiState())
    val state: StateFlow<SettingsUiState> = _state

    init {
        viewModelScope.launch {
            val username = prefs.username.firstOrNull() ?: ""
            val role = prefs.userRole.firstOrNull() ?: ""
            val theme = prefs.themeMode.firstOrNull() ?: "system"
            _state.update { it.copy(username = username, role = role, themeMode = theme) }
        }
        loadAddresses()
        loadVersion()
    }

    fun loadAddresses() {
        viewModelScope.launch {
            _state.update { it.copy(addressesLoading = true) }
            addressRepo.getAddresses().fold(
                onSuccess = { addrs -> _state.update { it.copy(addressesLoading = false, addresses = addrs) } },
                onFailure = {},
            )
        }
    }

    fun loadVersion() {
        viewModelScope.launch {
            settingsRepo.getVersion().fold(
                onSuccess = { info -> _state.update { it.copy(version = info.version ?: "") } },
                onFailure = {},
            )
        }
    }

    fun setThemeMode(mode: String) {
        viewModelScope.launch {
            prefs.setThemeMode(mode)
            _state.update { it.copy(themeMode = mode) }
        }
    }

    fun createAddress() {
        viewModelScope.launch {
            addressRepo.createAddress().fold(
                onSuccess = { loadAddresses() },
                onFailure = { e -> _state.update { it.copy(error = e.message) } },
            )
        }
    }

    fun deleteAddress(id: String) {
        viewModelScope.launch {
            addressRepo.deleteAddress(id).fold(
                onSuccess = { loadAddresses() },
                onFailure = { e -> _state.update { it.copy(error = e.message) } },
            )
        }
    }

    fun showLogout() { _state.update { it.copy(showLogoutConfirm = true) } }
    fun dismissLogout() { _state.update { it.copy(showLogoutConfirm = false) } }

    fun logout() {
        viewModelScope.launch {
            authRepo.logout()
            _state.update { it.copy(showLogoutConfirm = false) }
        }
    }

    fun clearError() { _state.update { it.copy(error = null) } }
}
