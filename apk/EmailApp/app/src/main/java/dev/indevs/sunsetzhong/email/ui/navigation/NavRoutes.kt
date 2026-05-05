package dev.indevs.sunsetzhong.email.ui.navigation

object NavRoutes {
    const val SPLASH = "splash"
    const val LOGIN = "login"
    const val REGISTER = "register"
    const val MAIN = "main"
    const val INBOX = "inbox"
    const val SENT = "sent"
    const val CONTACTS = "contacts"
    const val SETTINGS = "settings"
    const val DETAIL = "detail/{emailId}"
    const val COMPOSE = "compose?replyTo={replyToId}&to={recipient}"

    fun detail(emailId: String) = "detail/$emailId"
    fun compose(replyToId: String? = null, recipient: String? = null): String {
        val params = mutableListOf<String>()
        replyToId?.let { params.add("replyTo=$it") }
        recipient?.let { params.add("to=$it") }
        return if (params.isEmpty()) "compose" else "compose?${params.joinToString("&")}"
    }
}
