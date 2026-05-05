package dev.indevs.sunsetzhong.email.ui.compose

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import dev.indevs.sunsetzhong.email.SdMailApp
import dev.indevs.sunsetzhong.email.data.model.Email
import dev.indevs.sunsetzhong.email.data.model.TempAddress
import dev.indevs.sunsetzhong.email.data.preferences.PreferencesManager
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.firstOrNull
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

data class ComposeUiState(
    val fromAddresses: List<TempAddress> = emptyList(),
    val selectedFrom: String = "",
    val to: String = "",
    val subject: String = "",
    val body: String = "",
    val isLoading: Boolean = false,
    val isSending: Boolean = false,
    val error: String? = null,
    val sent: Boolean = false,
    val replyToEmail: Email? = null,
)

class ComposeViewModel : ViewModel() {
    private val emailRepo = SdMailApp.instance.container.emailRepository
    private val addressRepo = SdMailApp.instance.container.addressRepository
    private val prefs = SdMailApp.instance.container.prefs

    private val _state = MutableStateFlow(ComposeUiState())
    val state: StateFlow<ComposeUiState> = _state

    fun init(replyToId: String?, prefillRecipient: String?) {
        viewModelScope.launch {
            // Load addresses
            addressRepo.getAddresses().fold(
                onSuccess = { addrs -> _state.update { it.copy(fromAddresses = addrs) } },
                onFailure = {},
            )
            // Set default from
            val username = prefs.username.firstOrNull() ?: ""
            val domain = "sunsetzhong.indevs.in"
            _state.update { it.copy(selectedFrom = "$username@$domain") }

            if (prefillRecipient != null) {
                _state.update { it.copy(to = prefillRecipient) }
            }

            if (replyToId != null) {
                emailRepo.getMail(replyToId).fold(
                    onSuccess = { email ->
                        _state.update {
                            it.copy(
                                to = email.source ?: "",
                                subject = "Re: ${(email.subject ?: "").replace(Regex("^Re:\\s*", RegexOption.IGNORE_CASE), "")}",
                                replyToEmail = email,
                            )
                        }
                    },
                    onFailure = {},
                )
            }
        }
    }

    fun onFromChange(v: String) { _state.update { it.copy(selectedFrom = v) } }
    fun onToChange(v: String) { _state.update { it.copy(to = v, error = null) } }
    fun onSubjectChange(v: String) { _state.update { it.copy(subject = v, error = null) } }
    fun onBodyChange(v: String) { _state.update { it.copy(body = v, error = null) } }

    fun send() {
        val s = _state.value
        if (s.to.isBlank() || s.subject.isBlank() || s.body.isBlank()) {
            _state.update { it.copy(error = "请填写收件人、主题和内容") }
            return
        }
        viewModelScope.launch {
            _state.update { it.copy(isSending = true, error = null) }
            val result = if (s.replyToEmail != null) {
                emailRepo.reply(
                    from = s.selectedFrom, to = s.to.trim(), subject = s.subject.trim(),
                    html = s.body.trim(), text = null,
                    inReplyTo = s.replyToEmail.messageId, references = s.replyToEmail.messageId,
                )
            } else {
                emailRepo.send(
                    from = s.selectedFrom, to = s.to.trim(), subject = s.subject.trim(),
                    html = s.body.trim(), text = s.body.trim(),
                )
            }
            result.fold(
                onSuccess = { _state.update { it.copy(isSending = false, sent = true) } },
                onFailure = { e -> _state.update { s -> s.copy(isSending = false, error = e.message) } },
            )
        }
    }
}
