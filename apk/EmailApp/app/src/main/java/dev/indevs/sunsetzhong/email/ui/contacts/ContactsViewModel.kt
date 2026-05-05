package dev.indevs.sunsetzhong.email.ui.contacts

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import dev.indevs.sunsetzhong.email.SdMailApp
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

data class ContactsUiState(
    val contacts: List<String> = emptyList(),
    val isLoading: Boolean = true,
    val error: String? = null,
)

class ContactsViewModel : ViewModel() {
    private val addressRepo = SdMailApp.instance.container.addressRepository

    private val _state = MutableStateFlow(ContactsUiState())
    val state: StateFlow<ContactsUiState> = _state

    init { loadContacts() }

    fun loadContacts() {
        viewModelScope.launch {
            _state.update { it.copy(isLoading = true, error = null) }
            addressRepo.getContacts().fold(
                onSuccess = { contacts ->
                    _state.update { it.copy(isLoading = false, contacts = contacts) }
                },
                onFailure = { e ->
                    _state.update { it.copy(isLoading = false, error = e.message) }
                },
            )
        }
    }
}
