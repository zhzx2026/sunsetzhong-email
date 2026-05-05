package dev.indevs.sunsetzhong.email.ui.auth

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import dev.indevs.sunsetzhong.email.SdMailApp
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

data class LoginUiState(
    val username: String = "",
    val password: String = "",
    val isLoading: Boolean = false,
    val error: String? = null,
    val success: Boolean = false,
)

class LoginViewModel : ViewModel() {
    private val authRepo = SdMailApp.instance.container.authRepository

    private val _state = MutableStateFlow(LoginUiState())
    val state: StateFlow<LoginUiState> = _state

    fun onUsernameChange(v: String) { _state.update { it.copy(username = v, error = null) } }
    fun onPasswordChange(v: String) { _state.update { it.copy(password = v, error = null) } }

    fun login() {
        val s = _state.value
        if (s.username.isBlank() || s.password.isBlank()) {
            _state.update { it.copy(error = "请输入用户名和密码") }
            return
        }
        viewModelScope.launch {
            _state.update { it.copy(isLoading = true, error = null) }
            val result = authRepo.login(s.username.trim(), s.password)
            result.fold(
                onSuccess = { _state.update { it.copy(isLoading = false, success = true) } },
                onFailure = { e -> _state.update { s -> s.copy(isLoading = false, error = e.message) } },
            )
        }
    }
}
