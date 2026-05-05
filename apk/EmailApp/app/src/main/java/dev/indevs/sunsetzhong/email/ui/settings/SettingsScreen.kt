package dev.indevs.sunsetzhong.email.ui.settings

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.Logout
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewmodel.compose.viewModel
import dev.indevs.sunsetzhong.email.ui.components.AvatarCircle

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SettingsScreen(
    onLogout: () -> Unit,
    vm: SettingsViewModel = viewModel(),
) {
    val state by vm.state.collectAsStateWithLifecycle()

    if (state.showLogoutConfirm) {
        AlertDialog(
            onDismissRequest = vm::dismissLogout,
            title = { Text("退出登录") },
            text = { Text("确定要退出登录吗？") },
            confirmButton = {
                TextButton(onClick = {
                    vm.logout()
                    onLogout()
                }) { Text("确定", color = MaterialTheme.colorScheme.error) }
            },
            dismissButton = {
                TextButton(onClick = vm::dismissLogout) { Text("取消") }
            },
        )
    }

    val snackbarHostState = remember { SnackbarHostState() }
    LaunchedEffect(state.error) {
        state.error?.let {
            snackbarHostState.showSnackbar(it)
            vm.clearError()
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("设置") },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = MaterialTheme.colorScheme.background),
            )
        },
        snackbarHost = { SnackbarHost(snackbarHostState) },
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .verticalScroll(rememberScrollState()),
        ) {
            // Account card
            Surface(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp, vertical = 8.dp),
                shape = MaterialTheme.shapes.large,
                color = MaterialTheme.colorScheme.primaryContainer,
            ) {
                Row(
                    modifier = Modifier.padding(16.dp),
                    verticalAlignment = Alignment.CenterVertically,
                ) {
                    AvatarCircle(name = state.username, size = 52.dp)
                    Spacer(Modifier.width(16.dp))
                    Column {
                        Text(
                            state.username,
                            style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.SemiBold),
                        )
                        Spacer(Modifier.height(2.dp))
                        Text(
                            "${state.username}@sunsetzhong.indevs.in",
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                        )
                        Spacer(Modifier.height(4.dp))
                        Surface(
                            shape = MaterialTheme.shapes.small,
                            color = if (state.role == "admin")
                                MaterialTheme.colorScheme.primary
                            else
                                MaterialTheme.colorScheme.secondary,
                        ) {
                            Text(
                                if (state.role == "admin") "管理员" else "用户",
                                style = MaterialTheme.typography.labelSmall,
                                color = MaterialTheme.colorScheme.onPrimary,
                                modifier = Modifier.padding(horizontal = 8.dp, vertical = 2.dp),
                            )
                        }
                    }
                }
            }

            Spacer(Modifier.height(8.dp))

            // Appearance
            SettingsSection(title = "外观") {
                val options = listOf(
                    "system" to "跟随系统" to Icons.Filled.BrightnessAuto,
                    "light" to "浅色" to Icons.Filled.LightMode,
                    "dark" to "深色" to Icons.Filled.DarkMode,
                )
                options.forEach { (pair, icon) ->
                    val (value, label) = pair
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clickable { vm.setThemeMode(value) }
                            .padding(horizontal = 16.dp, vertical = 12.dp),
                        verticalAlignment = Alignment.CenterVertically,
                    ) {
                        Icon(icon, contentDescription = null, modifier = Modifier.size(22.dp),
                            tint = if (state.themeMode == value) MaterialTheme.colorScheme.primary
                            else MaterialTheme.colorScheme.onSurfaceVariant)
                        Spacer(Modifier.width(16.dp))
                        Text(label, style = MaterialTheme.typography.bodyLarge,
                            modifier = Modifier.weight(1f))
                        RadioButton(
                            selected = state.themeMode == value,
                            onClick = { vm.setThemeMode(value) },
                        )
                    }
                }
            }

            // Temp addresses
            SettingsSection(title = "临时邮箱地址") {
                if (state.addressesLoading) {
                    Box(Modifier.fillMaxWidth().padding(16.dp), contentAlignment = Alignment.Center) {
                        CircularProgressIndicator(Modifier.size(20.dp), strokeWidth = 2.dp)
                    }
                } else if (state.addresses.isEmpty()) {
                    Box(Modifier.fillMaxWidth().padding(16.dp), contentAlignment = Alignment.Center) {
                        Text("暂无临时地址", color = MaterialTheme.colorScheme.onSurfaceVariant, style = MaterialTheme.typography.bodySmall)
                    }
                } else {
                    state.addresses.forEach { addr ->
                        ListItem(
                            headlineContent = { Text(addr.fullAddress, style = MaterialTheme.typography.bodyMedium) },
                            trailingContent = {
                                IconButton(onClick = { vm.deleteAddress(addr.id) }) {
                                    Icon(Icons.Filled.Close, contentDescription = "删除", modifier = Modifier.size(18.dp))
                                }
                            },
                        )
                        HorizontalDivider(Modifier.padding(start = 72.dp))
                    }
                }
                TextButton(
                    onClick = vm::createAddress,
                    modifier = Modifier.padding(start = 8.dp),
                ) {
                    Icon(Icons.Filled.Add, contentDescription = null, modifier = Modifier.size(18.dp))
                    Spacer(Modifier.width(4.dp))
                    Text("创建新地址")
                }
            }

            // About
            SettingsSection(title = "关于") {
                ListItem(
                    headlineContent = { Text("版本") },
                    supportingContent = { Text(state.version) },
                    leadingContent = { Icon(Icons.Filled.Info, contentDescription = null, modifier = Modifier.size(28.dp)) },
                )
            }

            Spacer(Modifier.height(24.dp))

            // Logout
            OutlinedButton(
                onClick = vm::showLogout,
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp),
                shape = RoundedCornerShape(12.dp),
                colors = ButtonDefaults.outlinedButtonColors(
                    contentColor = MaterialTheme.colorScheme.error,
                ),
            ) {
                Icon(Icons.AutoMirrored.Filled.Logout, contentDescription = null)
                Spacer(Modifier.width(8.dp))
                Text("退出登录")
            }

            Spacer(Modifier.height(32.dp))
        }
    }
}

@Composable
private fun SettingsSection(
    title: String,
    content: @Composable ColumnScope.() -> Unit,
) {
    Column {
        Text(
            title,
            style = MaterialTheme.typography.labelLarge,
            color = MaterialTheme.colorScheme.primary,
            modifier = Modifier.padding(horizontal = 16.dp, vertical = 14.dp),
        )
        Surface(color = MaterialTheme.colorScheme.surface) {
            Column(content = content)
        }
    }
}