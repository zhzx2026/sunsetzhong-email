package dev.indevs.sunsetzhong.email.ui.inbox

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import dev.indevs.sunsetzhong.email.SdMailApp
import dev.indevs.sunsetzhong.email.data.local.entity.EmailEntity
import dev.indevs.sunsetzhong.email.data.model.Email
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch

data class EmailListUiState(
    val emails: List<EmailEntity> = emptyList(),
    val isLoading: Boolean = false,
    val isRefreshing: Boolean = false,
    val error: String? = null,
    val displayedCount: Int = 20,
)

class InboxViewModel : ViewModel() {
    private val emailRepo = SdMailApp.instance.container.emailRepository

    private val _state = MutableStateFlow(EmailListUiState())
    val state: StateFlow<EmailListUiState> = _state

    init {
        viewModelScope.launch {
            emailRepo.getCachedInbox().collect { cached ->
                val current = _state.value
                if (!current.isLoading && !current.isRefreshing) {
                    _state.update {
                        it.copy(emails = cached, displayedCount = minOf(current.displayedCount, cached.size).coerceAtLeast(20))
                    }
                }
            }
        }
        loadEmails()
    }

    fun loadEmails() {
        viewModelScope.launch {
            _state.update { it.copy(isLoading = true, error = null) }
            emailRepo.refreshInbox().fold(
                onSuccess = { emails ->
                    _state.update {
                        it.copy(isLoading = false, emails = emails, displayedCount = 20)
                    }
                },
                onFailure = { e ->
                    _state.update {
                        it.copy(isLoading = false, error = e.message)
                    }
                },
            )
        }
    }

    fun refresh() {
        viewModelScope.launch {
            _state.update { it.copy(isRefreshing = true) }
            emailRepo.refreshInbox().fold(
                onSuccess = { emails ->
                    _state.update {
                        it.copy(isRefreshing = false, emails = emails, displayedCount = 20)
                    }
                },
                onFailure = { _state.update { it.copy(isRefreshing = false) } },
            )
        }
    }

    fun loadMore() {
        val current = _state.value
        if (current.displayedCount >= current.emails.size) return
        _state.update { it.copy(displayedCount = (it.displayedCount + 20).coerceAtMost(it.emails.size)) }
    }

    fun deleteEmail(id: String) {
        viewModelScope.launch {
            // Optimistic removal
            _state.update { it.copy(emails = it.emails.filter { e -> e.id != id }) }
            emailRepo.deleteMail(id)
        }
    }
}
