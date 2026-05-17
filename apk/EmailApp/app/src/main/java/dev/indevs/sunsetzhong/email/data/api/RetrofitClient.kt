package dev.indevs.sunsetzhong.email.data.api

import dev.indevs.sunsetzhong.email.data.preferences.PreferencesManager
import kotlinx.coroutines.flow.firstOrNull
import okhttp3.*
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import java.net.CookieManager
import java.net.CookiePolicy
import java.util.concurrent.TimeUnit

object RetrofitClient {
    private val BASE_URL: String get() = dev.indevs.sunsetzhong.email.BuildConfig.BASE_URL

    fun create(prefs: PreferencesManager): ApiService {
        val cookieManager = CookieManager()
        cookieManager.setCookiePolicy(CookiePolicy.ACCEPT_ALL)

        val okHttpClient = OkHttpClient.Builder()
            .connectTimeout(15, TimeUnit.SECONDS)
            .readTimeout(30, TimeUnit.SECONDS)
            .writeTimeout(30, TimeUnit.SECONDS)
            .cookieJar(okhttp3.JavaNetCookieJar(cookieManager))
            .addInterceptor(AuthInterceptor { prefs.deviceToken.firstOrNull() })
            .addInterceptor { chain ->
                val request = chain.request().newBuilder()
                    .addHeader("Accept", "application/json")
                    .build()
                chain.proceed(request)
            }
            .build()

        return Retrofit.Builder()
            .baseUrl(BASE_URL)
            .client(okHttpClient)
            .addConverterFactory(GsonConverterFactory.create())
            .build()
            .create(ApiService::class.java)
    }
}
