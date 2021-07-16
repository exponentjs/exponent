package expo.modules.errorrecovery

import android.app.Application
import androidx.test.core.app.ApplicationProvider
import org.junit.Assert.assertEquals
import org.junit.Before
import org.junit.Test
import org.junit.runner.RunWith
import org.junit.Assert.assertNull
import org.robolectric.RobolectricTestRunner
import org.unimodules.test.core.PromiseMock
import org.unimodules.test.core.assertResolved

private const val RECOVERY_STORE_KEY = "recoveredProps"

@RunWith(RobolectricTestRunner::class)
internal class ErrorRecoveryModuleTest {
  @Test
  fun `saveRecoveryProps resolves provided promise when props=null`() {
    val module = ErrorRecoveryModule(ApplicationProvider.getApplicationContext())
    val promise = PromiseMock()
    module.saveRecoveryProps(null, promise)
    assertResolved(promise)
  }

  @Test
  fun `saveRecoveryProps resolves provided promise with null when props=null`() {
    val module = ErrorRecoveryModule(ApplicationProvider.getApplicationContext())
    val promise = PromiseMock()
    module.saveRecoveryProps(null, promise)
    assertResolved(promise)
    assertNull(promise.resolveValue)
  }

  @Test
  fun `saveRecoveryProps resolves provided promise when props!=null`() {
    val module = ErrorRecoveryModule(ApplicationProvider.getApplicationContext())
    val promise = PromiseMock()
    module.saveRecoveryProps("coding is fun they said", promise)
    assertResolved(promise)
  }

  @Test
  fun `saveRecoveryProps resolves provided promise with null when props!=null`() {
    val module = ErrorRecoveryModule(ApplicationProvider.getApplicationContext())
    val promise = PromiseMock()
    module.saveRecoveryProps("coding is fun they said", promise)
    assertResolved(promise)
    assertNull(promise.resolveValue)
  }

  @Test
  fun `props are saved when props!=null`() {
    val promise = PromiseMock()
    val mockProps = "test props"
    val module = ErrorRecoveryModule(ApplicationProvider.getApplicationContext())
    module.saveRecoveryProps(mockProps,  promise)
    val constants = module.constants
    assertEquals(constants[RECOVERY_STORE_KEY], mockProps)
  }

  @Test
  fun `props are saved when props=null`() {
    val promise = PromiseMock()
    val module = ErrorRecoveryModule(ApplicationProvider.getApplicationContext())
    module.saveRecoveryProps(null,  promise)
    val constants = module.constants
    assertNull(constants[RECOVERY_STORE_KEY])
  }
}
