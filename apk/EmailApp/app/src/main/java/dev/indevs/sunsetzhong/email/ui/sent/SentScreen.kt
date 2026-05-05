package dev.indevs.sunsetzhong.email.ui.sent

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.material3.*
import androidx.compose.material3.pulltorefresh.PullToRefreshBox
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewmodel.compose.viewModel
import dev.indevs.sunsetzhong.email.data.local.entity.toModel
import dev.indevs.sunsetzhong.email.ui.components.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SentScreen(
    onNavigateToDetail: (String) -> Unit,
    vm: SentViewModel = viewModel(),
) {
    val state by vm.state.collectAsStateWithLifecycle()
    val listState = rememberLazyListState()

    val shouldLoadMore by remember {
        derivedStateOf {
            val last = listState.layoutInfo.visibleItemsInfo.lastOrNull()?.index ?: 0
            last >= listState.layoutInfo.totalItemsCount - 5 && listState.layoutInfo.totalItemsCount > 0
        }
    }
    LaunchedEffect(shouldLoadMore) {
        if (shouldLoadMore) vm.loadMore()
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("已发送") },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = MaterialTheme.colorScheme.background),
            )
        },
    ) { padding ->
        Box(modifier = Modifier.padding(padding)) {
            when {
                state.isLoading && state.emails.isEmpty() -> LoadingView()
                state.error != null && state.emails.isEmpty() -> ErrorView(state.error!!, vm::loadEmails)
                state.emails.isEmpty() -> EmptyStateView("暂无已发送邮件")
                else -> {
                    PullToRefreshBox(isRefreshing = state.isRefreshing, onRefresh = vm::refresh) {
                        val displayed = state.emails.take(state.displayedCount)
                        LazyColumn(state = listState, contentPadding = PaddingValues(vertical = 8.dp)) {
                            items(displayed, key = { it.id }) { email ->
                                EmailListItem(
                                    email = email.toModel(),
                                    onClick = { onNavigateToDetail(email.id) },
                                    onDelete = {},
                                )
                                HorizontalDivider(
                                    modifier = Modifier.padding(start = 74.dp),
                                    thickness = 0.5.dp,
                                    color = MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.5f),
                                )
                            }
                            if (state.displayedCount < state.emails.size) {
                                item {
                                    Box(Modifier.fillMaxWidth().padding(16.dp), contentAlignment = Alignment.Center) {
                                        CircularProgressIndicator(Modifier.size(24.dp), strokeWidth = 2.dp)
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}