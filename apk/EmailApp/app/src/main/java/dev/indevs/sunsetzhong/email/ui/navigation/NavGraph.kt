package dev.indevs.sunsetzhong.email.ui.navigation

import androidx.compose.runtime.Composable
import androidx.navigation.NavHostController
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.navArgument
import dev.indevs.sunsetzhong.email.ui.auth.LoginScreen
import dev.indevs.sunsetzhong.email.ui.auth.RegisterScreen
import dev.indevs.sunsetzhong.email.ui.detail.EmailDetailScreen
import dev.indevs.sunsetzhong.email.ui.compose.ComposeScreen

@Composable
fun NavGraph(
    navController: NavHostController,
    startDestination: String = NavRoutes.SPLASH,
    deepLink: String? = null,
) {
    NavHost(
        navController = navController,
        startDestination = startDestination
    ) {
        composable(NavRoutes.SPLASH) {
            SplashScreen(
                deepLink = deepLink,
                onLoggedIn = {
                    navController.navigate(NavRoutes.MAIN) {
                        popUpTo(NavRoutes.SPLASH) { inclusive = true }
                    }
                },
                onNotLoggedIn = {
                    navController.navigate(NavRoutes.LOGIN) {
                        popUpTo(NavRoutes.SPLASH) { inclusive = true }
                    }
                },
                onDeepLink = { emailId ->
                    navController.navigate(NavRoutes.MAIN) {
                        popUpTo(NavRoutes.SPLASH) { inclusive = true }
                    }
                    navController.navigate(NavRoutes.detail(emailId))
                },
            )
        }

        composable(NavRoutes.LOGIN) {
            LoginScreen(
                onLoginSuccess = {
                    navController.navigate(NavRoutes.MAIN) {
                        popUpTo(NavRoutes.LOGIN) { inclusive = true }
                    }
                },
                onNavigateToRegister = {
                    navController.navigate(NavRoutes.REGISTER)
                }
            )
        }

        composable(NavRoutes.REGISTER) {
            RegisterScreen(
                onRegisterSuccess = {
                    navController.navigate(NavRoutes.MAIN) {
                        popUpTo(NavRoutes.REGISTER) { inclusive = true }
                    }
                },
                onNavigateToLogin = {
                    navController.popBackStack()
                }
            )
        }

        composable(NavRoutes.MAIN) {
            MainScreen(
                onNavigateToDetail = { emailId -> navController.navigate(NavRoutes.detail(emailId)) },
                onNavigateToCompose = { replyTo, recipient ->
                    navController.navigate(NavRoutes.compose(replyTo, recipient))
                },
                onLogout = {
                    navController.navigate(NavRoutes.LOGIN) {
                        popUpTo(NavRoutes.MAIN) { inclusive = true }
                    }
                }
            )
        }

        composable(
            route = NavRoutes.DETAIL,
            arguments = listOf(navArgument("emailId") { type = NavType.StringType })
        ) { backStackEntry ->
            val emailId = backStackEntry.arguments?.getString("emailId") ?: return@composable
            EmailDetailScreen(
                emailId = emailId,
                onBack = { navController.popBackStack() },
                onReply = { replyToId ->
                    navController.navigate(NavRoutes.compose(replyToId = replyToId))
                }
            )
        }

        composable(
            route = NavRoutes.COMPOSE,
            arguments = listOf(
                navArgument("replyToId") { type = NavType.StringType; nullable = true; defaultValue = null },
                navArgument("recipient") { type = NavType.StringType; nullable = true; defaultValue = null },
            )
        ) { backStackEntry ->
            val replyToId = backStackEntry.arguments?.getString("replyToId")
            val recipient = backStackEntry.arguments?.getString("recipient")
            ComposeScreen(
                replyToId = replyToId,
                prefillRecipient = recipient,
                onBack = { navController.popBackStack() },
                onSent = { navController.popBackStack() },
            )
        }
    }
}
