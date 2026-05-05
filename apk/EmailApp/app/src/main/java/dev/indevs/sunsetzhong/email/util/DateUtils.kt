package dev.indevs.sunsetzhong.email.util

import java.time.*
import java.time.format.DateTimeFormatter
import java.time.format.DateTimeParseException

object DateUtils {
    private val isoFormat = DateTimeFormatter.ISO_LOCAL_DATE_TIME.withZone(ZoneOffset.UTC)
    private val fullFormat = DateTimeFormatter.ofPattern("yyyy/MM/dd HH:mm")

    fun formatRelative(iso: String?): String {
        if (iso.isNullOrEmpty()) return ""
        return try {
            val dt = parseIso(iso) ?: return iso
            val now = Instant.now()
            val diff = Duration.between(dt, now)
            when {
                diff.toMinutes() < 1 -> "刚刚"
                diff.toHours() < 1 -> "${diff.toMinutes()} 分钟前"
                diff.toDays() < 1 -> "${diff.toHours()} 小时前"
                diff.toDays() < 2 -> "昨天"
                diff.toDays() < 7 -> "${diff.toDays()} 天前"
                else -> {
                    val zdt = dt.atZone(ZoneId.systemDefault())
                    val nowZdt = now.atZone(ZoneId.systemDefault())
                    if (zdt.year == nowZdt.year) "${zdt.monthValue}月${zdt.dayOfMonth}日"
                    else "${zdt.year}年${zdt.monthValue}月${zdt.dayOfMonth}日"
                }
            }
        } catch (_: Exception) {
            iso
        }
    }

    fun formatFull(iso: String?): String {
        if (iso.isNullOrEmpty()) return ""
        return try {
            val dt = parseIso(iso) ?: return iso
            fullFormat.format(dt.atZone(ZoneId.systemDefault()))
        } catch (_: Exception) {
            iso
        }
    }

    private fun parseIso(iso: String): Instant? {
        return try {
            val cleaned = iso.substringBefore(".").trimEnd('Z')
            LocalDateTime.parse(cleaned, DateTimeFormatter.ISO_LOCAL_DATE_TIME)
                .toInstant(ZoneOffset.UTC)
        } catch (_: DateTimeParseException) {
            try {
                Instant.parse(iso)
            } catch (_: DateTimeParseException) {
                null
            }
        }
    }
}