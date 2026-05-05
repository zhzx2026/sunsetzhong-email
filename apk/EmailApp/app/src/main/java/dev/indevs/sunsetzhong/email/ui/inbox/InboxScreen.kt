package dev.indevs.sunsetzhong.email.ui.inbox

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.slideInVertically
import androidx.compose.animation.slideOutVertically
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Create
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
import kotlinx.coroutines.flow.collectLatest
import kotlinx.coroutines.flow.distinctUntilChanged
import kotlinx.coroutines.flow.filter

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun InboxScreen(
    onNavigateToDetail: (String) -> Unit,
    onNavigateToCompose: () -> Unit,
    vm: InboxViewModel = viewModel(),
) {
    val state by vm.state.collectAsStateWithLifecycle()
    val listState = rememberLazyListState()

    // Hide FAB when scrolling down (like Gmail)
    val fabVisible by remember {
        derivedStateOf {
            listState.firstVisibleItemIndex == 0 ||
            listState.firstVisibleItemScrollOffset == 0 ||
            listState.isScrollInProgress
        }
    }

    // Infinite scroll
    val shouldLoadMore by remember {
        derivedStateOf {
            val lastVisibleItem = listState.layoutInfo.visibleItemsInfo.lastOrNull()?.index ?: 0
            lastVisibleItem >= listState.layoutInfo.totalItemsCount - 5 && listState.layoutInfo.totalItemsCount > 0
        }
    }
    LaunchedEffect(shouldLoadMore) {
        if (shouldLoadMore) vm.loadMore()
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("收件箱") },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.background,
                ),
            )
        },
        floatingActionButton = {
            AnimatedVisibility(
                visible = fabVisible,
                enter = slideInVertically(initialOffsetY = { it }),
                exit = slideOutVertically(targetOffsetY = { it }),
            ) {
                FloatingActionButton(
                    onClick = onNavigateToCompose,
                    containerColor = MaterialTheme.colorScheme.primary,
                    contentColor = MaterialTheme.colorScheme.onPrimary,
                ) {
                    Icon(Icons.Filled.Create, contentDescription = "写邮件")
                }
            }
        },
    ) { padding ->
        Box(modifier = Modifier.padding(padding)) {
            when {
                state.isLoading && state.emails.isEmpty() -> LoadingView()
                state.error != null && state.emails.isEmpty() -> ErrorView(
                    message = state.error!!,
                    onRetry = vm::loadEmails,
                )
                state.emails.isEmpty() -> EmptyStateView("收件箱为空")
                else -> {
                    PullToRefreshBox(
                        isRefreshing = state.isRefreshing,
                        onRefresh = vm::refresh,
                    ) {
                        val displayed = state.emails.take(state.displayedCount)
                        LazyColumn(
                            state = listState,
                            contentPadding = PaddingValues(vertical = 8.dp),
                        ) {
                            items(displayed, key = { it.id }) { email ->
                                EmailListItem(
                                    email = email.toModel(),
                                    onClick = { onNavigateToDetail(email.id) },
                                    onDelete = { vm.deleteEmail(email.id) },
                                )
                                HorizontalDivider(
                                    modifier = Modifier.padding(start = 74.dp),
                                    thickness = 0.5.dp,
                                    color = MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.5f),
                                )
                            }
                            if (state.displayedCount < state.emails.size) {
                                item {
                                    Box(
                                        modifier = Modifier.fillMaxWidth().padding(16.dp),
                                        contentAlignment = Alignment.Center,
                                    ) {
                                        CircularProgressIndicator(modifier = Modifier.size(24.dp), strokeWidth = 2.dp)
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