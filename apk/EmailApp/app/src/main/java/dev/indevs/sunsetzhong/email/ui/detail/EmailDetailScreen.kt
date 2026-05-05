package dev.indevs.sunsetzhong.email.ui.detail

import android.annotation.SuppressLint
import android.webkit.WebView
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.automirrored.filled.Reply
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.viewinterop.AndroidView
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewmodel.compose.viewModel
import dev.indevs.sunsetzhong.email.ui.components.AvatarCircle
import dev.indevs.sunsetzhong.email.ui.components.ErrorView
import dev.indevs.sunsetzhong.email.ui.components.LoadingView
import dev.indevs.sunsetzhong.email.util.DateUtils

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun EmailDetailScreen(
    emailId: String,
    onBack: () -> Unit,
    onReply: (String) -> Unit,
    vm: EmailDetailViewModel = viewModel(),
) {
    val state by vm.state.collectAsStateWithLifecycle()

    LaunchedEffect(emailId) { vm.loadEmail(emailId) }
    LaunchedEffect(state.deleted) { if (state.deleted) onBack() }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "返回")
                    }
                },
                actions = {
                    IconButton(onClick = { vm.deleteEmail(emailId) }) {
                        Icon(Icons.Filled.Delete, contentDescription = "删除")
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = MaterialTheme.colorScheme.background),
            )
        },
        bottomBar = {
            if (state.email != null) {
                Surface(tonalElevation = 1.dp, shadowElevation = 4.dp) {
                    Row(
                        modifier = Modifier.fillMaxWidth().padding(12.dp),
                        horizontalArrangement = Arrangement.End,
                    ) {
                        FilledTonalButton(onClick = { onReply(emailId) }) {
                            Icon(Icons.AutoMirrored.Filled.Reply, contentDescription = null, modifier = Modifier.size(18.dp))
                            Spacer(Modifier.width(6.dp))
                            Text("回复")
                        }
                    }
                }
            }
        },
    ) { padding ->
        when {
            state.isLoading -> LoadingView(Modifier.padding(padding))
            state.error != null -> ErrorView(
                message = state.error!!,
                onRetry = { vm.loadEmail(emailId) },
                modifier = Modifier.padding(padding),
            )
            state.email != null -> {
                val email = state.email!!
                Column(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(padding),
                ) {
                    // Fixed header: subject + sender
                    Column(
                        modifier = Modifier.padding(horizontal = 16.dp),
                    ) {
                        Spacer(Modifier.height(8.dp))
                        Text(
                            text = email.subject ?: "无主题",
                            style = MaterialTheme.typography.headlineMedium,
                            fontWeight = FontWeight.Bold,
                        )
                        Spacer(Modifier.height(16.dp))
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            AvatarCircle(name = email.displayName, size = 40.dp)
                            Spacer(Modifier.width(12.dp))
                            Column(modifier = Modifier.weight(1f)) {
                                Text(
                                    text = email.displayName,
                                    style = MaterialTheme.typography.titleMedium,
                                    fontWeight = FontWeight.SemiBold,
                                )
                                Text(
                                    text = "收件人: ${email.address ?: ""}",
                                    style = MaterialTheme.typography.bodySmall,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                                )
                            }
                            Text(
                                text = DateUtils.formatFull(email.createdAt),
                                style = MaterialTheme.typography.bodySmall,
                                color = MaterialTheme.colorScheme.onSurfaceVariant,
                            )
                        }
                        Spacer(Modifier.height(12.dp))
                    }
                    HorizontalDivider()

                    // Body fills remaining space
                    val html = email.bodyHtml
                    val text = email.bodyText
                    if (!html.isNullOrBlank()) {
                        EmailBodyWebView(html, Modifier.weight(1f))
                    } else if (!text.isNullOrBlank()) {
                        Column(
                            modifier = Modifier
                                .weight(1f)
                                .verticalScroll(rememberScrollState())
                                .padding(16.dp),
                        ) {
                            Text(text = text, style = MaterialTheme.typography.bodyLarge)
                        }
                    } else {
                        Spacer(Modifier.weight(1f))
                    }
                }
            }
        }
    }
}

@SuppressLint("SetJavaScriptEnabled")
@Composable
private fun EmailBodyWebView(html: String, modifier: Modifier = Modifier) {
    val wrapped = """
        <!DOCTYPE html><html><head>
        <meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1">
        <style>
            body { font-family: -apple-system, sans-serif; font-size: 16px; line-height: 1.6;
                   color: #0f172a; padding: 8px 16px; margin: 0; word-wrap: break-word; }
            img { max-width: 100%; height: auto; }
            a { color: #2563eb; }
            pre, blockquote { white-space: pre-wrap; overflow-x: auto; }
            @media (prefers-color-scheme: dark) { body { color: #e2e8f0; background: #0f172a; } }
        </style></head><body>$html</body></html>
    """.trimIndent()

    AndroidView(
        factory = { ctx ->
            WebView(ctx).apply {
                settings.javaScriptEnabled = false
                settings.loadWithOverviewMode = true
                settings.useWideViewPort = true
                setBackgroundColor(0)
                loadDataWithBaseURL(null, wrapped, "text/html", "UTF-8", null)
            }
        },
        modifier = modifier,
    )
}