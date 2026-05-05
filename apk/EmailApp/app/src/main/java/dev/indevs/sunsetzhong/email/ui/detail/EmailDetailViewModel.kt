package dev.indevs.sunsetzhong.email.ui.detail

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import dev.indevs.sunsetzhong.email.SdMailApp
import dev.indevs.sunsetzhong.email.data.model.Email
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

data class EmailDetailUiState(
    val email: Email? = null,
    val isLoading: Boolean = true,
    val error: String? = null,
    val deleted: Boolean = false,
)

class EmailDetailViewModel : ViewModel() {
    private val emailRepo = SdMailApp.instance.container.emailRepository

    private val _state = MutableStateFlow(EmailDetailUiState())
    val state: StateFlow<EmailDetailUiState> = _state

    fun loadEmail(id: String) {
        viewModelScope.launch {
            _state.update { it.copy(isLoading = true, error = null) }
            emailRepo.getMail(id).fold(
                onSuccess = { email -> _state.update { it.copy(isLoading = false, email = email) } },
                onFailure = { e -> _state.update { it.copy(isLoading = false, error = e.message) } },
            )
        }
    }

    fun deleteEmail(id: String) {
        viewModelScope.launch {
            emailRepo.deleteMail(id).fold(
                onSuccess = { _state.update { it.copy(deleted = true) } },
                onFailure = { e -> _state.update { it.copy(error = e.message) } },
            )
        }
    }
}
