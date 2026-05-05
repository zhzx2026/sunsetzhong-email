package dev.indevs.sunsetzhong.email.util

import androidx.compose.ui.graphics.Color
import dev.indevs.sunsetzhong.email.ui.theme.AvatarColors

object ColorUtils {
    fun avatarColor(name: String): Color {
        val hash = name.hashCode()
        val index = (hash and Int.MAX_VALUE) % AvatarColors.size
        return AvatarColors[index]
    }

    fun initials(name: String): String {
        val parts = name.split("@")
        val local = parts.firstOrNull() ?: name
        return local.take(2).uppercase()
    }
}
