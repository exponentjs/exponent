package expo.modules.sms

import androidx.test.core.app.ApplicationProvider

import org.junit.Before
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner
import org.unimodules.core.ModuleRegistry
import org.unimodules.core.interfaces.ActivityProvider
import org.unimodules.test.core.PromiseMock
import org.unimodules.test.core.assertResolved
import org.unimodules.test.core.mockInternalModule
import org.unimodules.test.core.moduleRegistryMock
import org.unimodules.test.core.mockkInternalModule

@RunWith(RobolectricTestRunner::class)
internal class SMSModuleTest {
  private lateinit var smsModule: SMSModule
  private lateinit var moduleRegistry: ModuleRegistry
  private val optionsAttachmentsKey = "attachments";

  @Before
  fun initializeMock() {
    smsModule = SMSModule(ApplicationProvider.getApplicationContext(), "test")
    val mockActivityProvider = mockkInternalModule<MockActivityProvider>(
      relaxed = true,
      asInterface = ActivityProvider::class.java)
    moduleRegistry = moduleRegistryMock()
    moduleRegistry.mockInternalModule(mockActivityProvider)
    smsModule.onCreate(moduleRegistry)
  }

  @Test
  fun `isAvailableAsync should resolve`() {
    val promise = PromiseMock()
    smsModule.isAvailableAsync(promise)
    assertResolved(promise)
  }

  @Test
  fun `sendSMSAsync's promise is resolved in onHostResume when options=null`() {
    val promise   = PromiseMock()
    val addresses = arrayListOf("123456789", "234567891")
    val message   = "test text message"
    smsModule.sendSMSAsync(addresses, message, null, promise)
    smsModule.onHostResume()
    assertResolved(promise)
  }

  @Test
  fun `sendSMSAsync's promise is resolved in onHostResume when options!=null`() {
    val promise   = PromiseMock()
    val addresses = arrayListOf("123456789", "234567891")
    val message   = "test text message"
    val options = mapOf(optionsAttachmentsKey to listOf(mapOf(
      "someattachment" to "someattachment",
      "mimeType" to "intent type",
      "uri" to "some resource identifier")))
    smsModule.sendSMSAsync(addresses, message, options, promise)
    smsModule.onHostResume()
    assertResolved(promise)
  }
}
