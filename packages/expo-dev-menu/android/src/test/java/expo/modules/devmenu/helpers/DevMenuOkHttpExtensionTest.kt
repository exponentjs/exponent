package expo.modules.devmenu.helpers

import com.google.common.truth.Truth
import kotlinx.coroutines.runBlocking
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.mockwebserver.MockResponse
import okhttp3.mockwebserver.MockWebServer
import org.junit.After
import org.junit.Before
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner

@RunWith(RobolectricTestRunner::class)
internal class DevMenuOkHttpExtensionTest {
  private var server = let {
    System.setProperty("javax.net.ssl.trustStore", "NONE")
    MockWebServer()
  }
  private val client = OkHttpClient()

  @Before
  fun setup() {
    server.start(9090)
  }

  @After
  fun cleanup() {
    server.shutdown()
  }

  @Test
  fun `checks if await resolves after server's successful response`() = runBlocking {
    val request = Request.Builder()
      .url(server.url("/"))
      .build()
    server.enqueue(MockResponse().setResponseCode(200))

    val response = request.await(client)

    Truth.assertThat(response.isSuccessful).isTrue()
  }

  @Test
  fun `checks if await resolves after server's unsuccessful response`() = runBlocking {
    val request = Request.Builder()
      .url(server.url("/"))
      .build()
    server.enqueue(MockResponse().setResponseCode(501))

    val response = request.await(client)

    Truth.assertThat(response.isSuccessful).isFalse()
  }
}
