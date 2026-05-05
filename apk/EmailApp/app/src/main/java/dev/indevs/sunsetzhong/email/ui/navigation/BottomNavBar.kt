package dev.indevs.sunsetzhong.email.ui.navigation

import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.Send
import androidx.compose.material.icons.automirrored.outlined.Send
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.outlined.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.unit.dp

data class BottomNavItem(
    val label: String,
    val route: String,
    val selectedIcon: ImageVector,
    val unselectedIcon: ImageVector,
    val badgeCount: Int = 0,
)

@Composable
fun BottomNavBar(
    currentRoute: String?,
    onNavigate: (String) -> Unit,
    unreadCount: Int = 0,
) {
    NavigationBar {
        bottomNavItems.forEach { item ->
            val selected = currentRoute == item.route
            NavigationBarItem(
                selected = selected,
                onClick = { onNavigate(item.route) },
                icon = {
                    val badge = if (item.route == NavRoutes.INBOX && unreadCount > 0) unreadCount else 0
                    if (badge > 0) {
                        BadgedBox(badge = {
                            Badge(containerColor = MaterialTheme.colorScheme.error) {
                                Text(if (badge > 99) "99+" else badge.toString())
                            }
                        }) {
                            Icon(
                                if (selected) item.selectedIcon else item.unselectedIcon,
                                contentDescription = item.label,
                            )
                        }
                    } else {
                        Icon(
                            if (selected) item.selectedIcon else item.unselectedIcon,
                            contentDescription = item.label,
                        )
                    }
                },
                label = { Text(item.label) },
            )
        }
    }
}

val bottomNavItems = listOf(
    BottomNavItem("收件箱", NavRoutes.INBOX, Icons.Filled.Inbox, Icons.Outlined.Inbox),
    BottomNavItem("已发送", NavRoutes.SENT, Icons.AutoMirrored.Filled.Send, Icons.AutoMirrored.Outlined.Send),
    BottomNavItem("联系人", NavRoutes.CONTACTS, Icons.Filled.Contacts, Icons.Outlined.Contacts),
    BottomNavItem("设置", NavRoutes.SETTINGS, Icons.Filled.Settings, Icons.Outlined.Settings),
)