package dev.indevs.sunsetzhong.email.ui.compose

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.automirrored.filled.Send
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.unit.dp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewmodel.compose.viewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ComposeScreen(
    replyToId: String?,
    prefillRecipient: String?,
    onBack: () -> Unit,
    onSent: () -> Unit,
    vm: ComposeViewModel = viewModel(),
) {
    val state by vm.state.collectAsStateWithLifecycle()
    LaunchedEffect(replyToId, prefillRecipient) { vm.init(replyToId, prefillRecipient) }
    LaunchedEffect(state.sent) { if (state.sent) onSent() }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text(if (state.replyToEmail != null) "回复" else "写邮件") },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "取消")
                    }
                },
                actions = {
                    TextButton(
                        onClick = vm::send,
                        enabled = !state.isSending,
                    ) {
                        if (state.isSending) {
                            CircularProgressIndicator(Modifier.size(16.dp), strokeWidth = 2.dp)
                        } else {
                            Icon(Icons.AutoMirrored.Filled.Send, contentDescription = null, modifier = Modifier.size(18.dp))
                            Spacer(Modifier.width(4.dp))
                            Text("发送")
                        }
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = MaterialTheme.colorScheme.background),
            )
        },
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .padding(horizontal = 16.dp),
        ) {
            // From address dropdown
            if (state.fromAddresses.isNotEmpty()) {
                var expanded by remember { mutableStateOf(false) }
                ExposedDropdownMenuBox(expanded = expanded, onExpandedChange = { expanded = it }) {
                    OutlinedTextField(
                        value = state.selectedFrom,
                        onValueChange = {},
                        readOnly = true,
                        label = { Text("发件人") },
                        trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded) },
                        modifier = Modifier
                            .fillMaxWidth()
                            .menuAnchor(MenuAnchorType.PrimaryNotEditable),
                        shape = RoundedCornerShape(12.dp),
                        singleLine = true,
                    )
                    ExposedDropdownMenu(expanded = expanded, onDismissRequest = { expanded = false }) {
                        state.fromAddresses.forEach { addr ->
                            DropdownMenuItem(
                                text = { Text(addr.fullAddress) },
                                onClick = {
                                    vm.onFromChange(addr.fullAddress)
                                    expanded = false
                                },
                            )
                        }
                    }
                }
            } else {
                OutlinedTextField(
                    value = state.selectedFrom,
                    onValueChange = {},
                    readOnly = true,
                    label = { Text("发件人") },
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(12.dp),
                    singleLine = true,
                )
            }
            Spacer(Modifier.height(8.dp))

            // To
            OutlinedTextField(
                value = state.to,
                onValueChange = vm::onToChange,
                label = { Text("收件人") },
                singleLine = true,
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(12.dp),
                enabled = !state.isSending,
                keyboardOptions = KeyboardOptions(imeAction = ImeAction.Next),
            )
            Spacer(Modifier.height(8.dp))

            // Subject
            OutlinedTextField(
                value = state.subject,
                onValueChange = vm::onSubjectChange,
                label = { Text("主题") },
                singleLine = true,
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(12.dp),
                enabled = !state.isSending,
                keyboardOptions = KeyboardOptions(imeAction = ImeAction.Next),
            )
            Spacer(Modifier.height(6.dp))

            // Error
            AnimatedVisibility(visible = state.error != null, enter = fadeIn(), exit = fadeOut()) {
                Text(
                    state.error ?: "",
                    color = MaterialTheme.colorScheme.error,
                    style = MaterialTheme.typography.bodySmall,
                    modifier = Modifier.padding(bottom = 4.dp),
                )
            }

            // Body
            OutlinedTextField(
                value = state.body,
                onValueChange = vm::onBodyChange,
                label = { Text("内容") },
                modifier = Modifier
                    .fillMaxWidth()
                    .weight(1f),
                shape = RoundedCornerShape(12.dp),
                enabled = !state.isSending,
            )
            Spacer(Modifier.height(16.dp))
        }
    }
}