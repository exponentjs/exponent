package expo.modules.battery

import android.content.Context
import android.content.Intent
import android.os.BatteryManager
import android.os.PowerManager
import io.mockk.every
import io.mockk.mockk
import org.unimodules.core.interfaces.services.EventEmitter
import org.unimodules.test.core.mockkInternalModule

fun mockContext(): Context {
  return mockk<Context>().also {
    every {
      it.registerReceiver(any(), any())
    } returns Intent()
    every {
      it.applicationContext.registerReceiver(null, any())
    } returns MockBatteryIntent()
    every {
      it.applicationContext.packageName
    } returns "packageName"
  }
}

fun mockEventEmitter(): MockedEventEmitter {
  return mockkInternalModule<MockedEventEmitter>(asInterface = EventEmitter::class.java).also {
    every {
      it.emit(any() as String, any())
    } returns Unit
  }
}

fun mockPowerManager(context: Context) {
  every {
    context.applicationContext.getSystemService(Context.POWER_SERVICE)
  } returns mockk<PowerManager>().also {
    every {
      it.isPowerSaveMode
    } returns true
    every {
      it.isIgnoringBatteryOptimizations(any() as String)
    } returns false
  }
}

class MockBatteryIntent : Intent() {
  override fun getIntExtra(name: String, defaultValue: Int): Int {
    return when (name) {
      BatteryManager.EXTRA_LEVEL -> 50
      BatteryManager.EXTRA_SCALE -> 1
      BatteryManager.EXTRA_STATUS -> BatteryManager.BATTERY_STATUS_FULL
      else -> -1
    }
  }
}
