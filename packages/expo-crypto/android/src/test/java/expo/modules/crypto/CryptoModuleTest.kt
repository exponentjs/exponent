package expo.modules.crypto

import androidx.test.core.app.ApplicationProvider

import org.junit.Assert.assertEquals
import org.junit.Before
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner
import org.unimodules.test.core.PromiseMock
import org.unimodules.test.core.assertRejected

@RunWith(RobolectricTestRunner::class)
class CryptoModuleTest {
  private val testValue = "Expo";
  private val algorithms = listOf("SHA-1", "SHA-256", "SHA-384", "SHA-512", "MD2", "MD4", "MD5")
  private lateinit var module: CryptoModule

  @Before
  fun initializeMock() {
    module = CryptoModule(ApplicationProvider.getApplicationContext())
  }

  @Test
  fun digestStringForBase64() {
    val encoding = "base64"
    for (algorithm in algorithms) {
      val promise = PromiseMock()
      module.digestStringAsync(algorithm, testValue, hashMapOf("encoding" to "base64") as Map<String, Any>?, promise)
      assertEquals(expectedEncodingResults[encoding]!![algorithm], promise.resolveValue)
    }
  }

  @Test
  fun digestStringForHex() {
    val encoding = "hex"
    for (algorithm in algorithms) {
      val promise = PromiseMock()
      module.digestStringAsync(algorithm, testValue, hashMapOf("encoding" to encoding) as Map<String, Any>?, promise)
      assertEquals(expectedEncodingResults[encoding]!![algorithm], promise.resolveValue)
    }
  }

  @Test
  fun digestStringForInvalidEncoding() {
    val promise = PromiseMock()
    val encoding = "h333x"
    val algorithm = "SHA-1"
    module.digestStringAsync(algorithm, testValue, hashMapOf("encoding" to encoding) as Map<String, Any>?, promise)
    assertRejected(promise)
  }

  @Test
  fun digestStringForInvalidAlgorithm() {
    val promise = PromiseMock()
    val encoding = "hex"
    val algorithm = "MDWer4"
    module.digestStringAsync(algorithm, testValue, hashMapOf("encoding" to encoding) as Map<String, Any>?, promise)
    assertRejected(promise)
  }
}
