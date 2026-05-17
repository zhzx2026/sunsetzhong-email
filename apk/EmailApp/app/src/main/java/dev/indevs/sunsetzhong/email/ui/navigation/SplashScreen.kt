package dev.indevs.sunsetzhong.email.ui.navigation

import android.util.Log
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import dev.indevs.sunsetzhong.email.SdMailApp
import kotlinx.coroutines.flow.firstOrNull

@Composable
fun SplashScreen(
    deepLink: String? = null,
    onLoggedIn: () -> Unit,
    onNotLoggedIn: () -> Unit,
    onDeepLink: (emailId: String) -> Unit = {},
) {
    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background),
        contentAlignment = Alignment.Center,
    ) {
        Column(horizontalAlignment = Alignment.CenterHorizontally) {
            Surface(
                modifier = Modifier.size(80.dp),
                shape = RoundedCornerShape(22.dp),
                color = MaterialTheme.colorScheme.primary,
            ) {
                Box(contentAlignment = Alignment.Center) {
                    Text(
                        "S",
                        style = MaterialTheme.typography.headlineLarge.copy(
                            color = MaterialTheme.colorScheme.onPrimary,
                            fontWeight = FontWeight.Bold,
                            fontSize = 42.sp,
                        ),
                    )
                }
            }
            Spacer(Modifier.height(16.dp))
            Text(
                "S-MAIL",
                style = MaterialTheme.typography.headlineMedium.copy(fontWeight = FontWeight.Bold),
            )
        }
    }

    LaunchedEffect(Unit) {
        // Extract email ID from deep link if present
        val deepLinkEmailId = deepLink?.let { link ->
            val prefix = "smail://mail/"
            if (link.startsWith(prefix)) link.removePrefix(prefix) else null
        }
        val prefs = try {
            SdMailApp.instance.container.prefs
        } catch (e: Exception) {
            Log.e("Splash", "App not initialized", e)
            onNotLoggedIn()
            return@LaunchedEffect
        }
        val token = prefs.deviceToken.firstOrNull()
        if (token.isNullOrEmpty()) {
            onNotLoggedIn()
        } else {
            onLoggedIn()
            // Navigate to email detail if deep link was present
            if (deepLinkEmailId != null) {
                onDeepLink(deepLinkEmailId)
            }
        }
    }
}