package dev.indevs.sunsetzhong.email.ui.navigation

import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Scaffold
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import dev.indevs.sunsetzhong.email.ui.inbox.InboxScreen
import dev.indevs.sunsetzhong.email.ui.sent.SentScreen
import dev.indevs.sunsetzhong.email.ui.contacts.ContactsScreen
import dev.indevs.sunsetzhong.email.ui.settings.SettingsScreen

@Composable
fun MainScreen(
    onNavigateToDetail: (String) -> Unit,
    onNavigateToCompose: (replyTo: String?, recipient: String?) -> Unit,
    onLogout: () -> Unit,
) {
    val navController = rememberNavController()
    val navBackStackEntry by navController.currentBackStackEntryAsState()
    val currentRoute = navBackStackEntry?.destination?.route

    Scaffold(
        bottomBar = {
            BottomNavBar(
                currentRoute = currentRoute,
                onNavigate = { route ->
                    navController.navigate(route) {
                        popUpTo(NavRoutes.INBOX) { saveState = true }
                        launchSingleTop = true
                        restoreState = true
                    }
                },
                unreadCount = 0,
            )
        }
    ) { innerPadding ->
        NavHost(
            navController = navController,
            startDestination = NavRoutes.INBOX,
            modifier = Modifier.padding(innerPadding)
        ) {
            composable(NavRoutes.INBOX) {
                InboxScreen(
                    onNavigateToDetail = onNavigateToDetail,
                    onNavigateToCompose = { onNavigateToCompose(null, null) },
                )
            }
            composable(NavRoutes.SENT) {
                SentScreen(onNavigateToDetail = onNavigateToDetail)
            }
            composable(NavRoutes.CONTACTS) {
                ContactsScreen(onNavigateToCompose = { email -> onNavigateToCompose(null, email) })
            }
            composable(NavRoutes.SETTINGS) {
                SettingsScreen(onLogout = onLogout)
            }
        }
    }
}
