package expo.modules.battery

import android.content.Context
import android.content.IntentFilter
import android.os.Build
import android.os.Bundle
import io.mockk.mockk
import io.mockk.verify
import org.junit.Assert.assertEquals
import org.junit.Before
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner
import org.unimodules.test.core.PromiseMock
import org.unimodules.test.core.assertResolved
import org.unimodules.test.core.moduleRegistryMock
import org.robolectric.annotation.Config
import org.unimodules.test.core.mockInternalModule

@RunWith(RobolectricTestRunner::class)
class BatteryModuleTest {
  private lateinit var module: BatteryModule
  private var moduleRegistry = moduleRegistryMock()
  private val context = mockContext()
  private val eventEmitter = mockEventEmitter()

  @Before
  fun initializeMock() {
    module = BatteryModule(context)
    moduleRegistry.mockInternalModule(eventEmitter)
    module.onCreate(moduleRegistry)
  }

  @Config(sdk = [Build.VERSION_CODES.LOLLIPOP])
  @Test
  fun batteryLevelReceiver() {
    val receiver = BatteryLevelReceiver(eventEmitter)
    receiver.onReceive(context, mockk())
    verify(exactly = 1) {
      context.applicationContext.registerReceiver(null, any() as IntentFilter)
    }
    verify(exactly = 1) {
      eventEmitter.emit(any() as String, any() as Bundle)
    }
  }

  @Config(sdk = [Build.VERSION_CODES.LOLLIPOP])
  @Test
  fun batteryStateReceiver() {
    val receiver = BatteryStateReceiver(eventEmitter)
    receiver.onReceive(context, MockBatteryIntent())
    verify(exactly = 1) {
      eventEmitter.emit(any() as String, any() as Bundle)
    }
  }

  @Config(sdk = [Build.VERSION_CODES.M])
  @Test
  fun powerSaverReceiver() {
    mockPowerManager(context)
    val receiver = PowerSaverReceiver(eventEmitter)
    receiver.onReceive(context, mockk())
    verify(exactly = 1) {
      context.applicationContext.getSystemService(Context.POWER_SERVICE)
    }
    verify(exactly = 1) {
      eventEmitter.emit(any() as String, any() as Bundle)
    }
  }

  @Config(sdk = [Build.VERSION_CODES.LOLLIPOP])
  @Test
  fun getBatteryLevel() {
    val promise = PromiseMock()
    val expectedBatteryLevel = 50.0f
    module.getBatteryLevelAsync(promise)
    assertEquals(expectedBatteryLevel, promise.resolveValue)
    verify(exactly = 1) {
      context.applicationContext.registerReceiver(null, any() as IntentFilter)
    }
  }

  @Config(sdk = [Build.VERSION_CODES.LOLLIPOP])
  @Test
  fun getBatteryState() {
    val promise = PromiseMock()
    val expectedBatteryState = BatteryModule.BatteryState.FULL.value
    module.getBatteryStateAsync(promise)
    assertEquals(expectedBatteryState, promise.resolveValue)
    verify(exactly = 1) {
      context.applicationContext.registerReceiver(null, any() as IntentFilter)
    }
  }

  @Config(sdk = [Build.VERSION_CODES.LOLLIPOP])
  @Test
  fun isBatteryOptimizationEnabledOlderSdk() {
    val promise = PromiseMock()
    module.isBatteryOptimizationEnabledAsync(promise)
    val expectedResult = false
    assertEquals(expectedResult, promise.resolveValue)
  }

  @Config(sdk = [Build.VERSION_CODES.M])
  @Test
  fun isBatteryOptimizationEnabled() {
    val promise = PromiseMock()
    mockPowerManager(context)
    module.isBatteryOptimizationEnabledAsync(promise)
    val expectedResult = true
    assertEquals(expectedResult, promise.resolveValue)
  }

  @Config(sdk = [Build.VERSION_CODES.M])
  @Test
  fun isLowPowerModeEnabled() {
    val promise = PromiseMock()
    mockPowerManager(context)
    module.isLowPowerModeEnabledAsync(promise)
    assertResolved(promise)
    assertEquals(true, promise.resolveValue)
    verify(exactly = 1) {
      context.applicationContext.getSystemService(Context.POWER_SERVICE)
    }
  }
}
