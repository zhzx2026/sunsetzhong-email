package dev.indevs.sunsetzhong.email.ui.auth

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import dev.indevs.sunsetzhong.email.SdMailApp
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

data class RegisterUiState(
    val username: String = "",
    val password: String = "",
    val confirmPassword: String = "",
    val isLoading: Boolean = false,
    val error: String? = null,
    val success: Boolean = false,
)

class RegisterViewModel : ViewModel() {
    private val authRepo = SdMailApp.instance.container.authRepository

    private val _state = MutableStateFlow(RegisterUiState())
    val state: StateFlow<RegisterUiState> = _state

    fun onUsernameChange(v: String) { _state.update { it.copy(username = v, error = null) } }
    fun onPasswordChange(v: String) { _state.update { it.copy(password = v, error = null) } }
    fun onConfirmPasswordChange(v: String) { _state.update { it.copy(confirmPassword = v, error = null) } }

    fun register() {
        val s = _state.value
        if (s.username.isBlank() || s.password.isBlank()) {
            _state.update { it.copy(error = "请输入用户名和密码") }
            return
        }
        if (s.username.length < 3 || s.username.length > 32) {
            _state.update { it.copy(error = "用户名需 3-32 位") }
            return
        }
        if (s.password.length < 4) {
            _state.update { it.copy(error = "密码至少4位") }
            return
        }
        if (s.password != s.confirmPassword) {
            _state.update { it.copy(error = "两次密码不一致") }
            return
        }
        viewModelScope.launch {
            _state.update { it.copy(isLoading = true, error = null) }
            val result = authRepo.register(s.username.trim(), s.password)
            result.fold(
                onSuccess = { _state.update { it.copy(isLoading = false, success = true) } },
                onFailure = { e -> _state.update { s -> s.copy(isLoading = false, error = e.message) } },
            )
        }
    }
}