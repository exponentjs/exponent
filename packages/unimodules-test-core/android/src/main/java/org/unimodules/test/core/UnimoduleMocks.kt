package org.unimodules.test.core

import io.mockk.MockKGateway
import io.mockk.every
import io.mockk.mockk
import io.mockk.spyk
import org.unimodules.core.ExportedModule
import org.unimodules.core.ModuleRegistry
import org.unimodules.core.interfaces.InternalModule
import java.util.*

@JvmOverloads
fun moduleRegistryMock(
  internalModules: List<InternalModule> = Collections.emptyList(),
  exportedModules: List<ExportedModule> = Collections.emptyList()
): ModuleRegistry {
  return mockk<ModuleRegistry>().also {
    mockInternalModules(it, internalModules)
    mockExternalModules(it, exportedModules)
  }
}

inline fun <reified T : InternalModule> mockkInternalModule(relaxed: Boolean = false, asInterface: Class<*> = T::class.java): T {
  val mock: T = mockk(relaxed = relaxed)
  every { mock.exportedInterfaces } returns listOf(asInterface)
  return mock
}

private fun mockInternalModules(mock: ModuleRegistry, internalModules: List<InternalModule>) {
  internalModules.forEach {
    mock.mockInternalModule(it)
  }
  every { mock.getModule<Any>(any()) } returns null
}

private fun mockExternalModules(mock: ModuleRegistry, exportedModules: List<ExportedModule>) {
  exportedModules.forEach {
    every { mock.getExportedModule(it.name) } returns it
  }
  every { mock.getExportedModule(any()) } returns null
}

fun ModuleRegistry.mockInternalModule(module: InternalModule) =
  if (!this.isMock) {
    throw IllegalStateException("Mocking modules available only for mocked module registry!")
  } else {
    module.exportedInterfaces.forEach {
      every { this@mockInternalModule.getModule(it) } returns module
    }
  }

fun ModuleRegistry.mockExportedModule(module: ExportedModule) =
  if (!this.isMock) {
    throw IllegalStateException("Mocking modules available only for mocked module registry!")
  } else {
    every { this@mockExportedModule.getExportedModule(module.name) } returns module
  }

fun mockPromise(): PromiseMock {
  return spyk()
}

private val <T : Any> T.isMock: Boolean
  get() {
    return try {
      MockKGateway.implementation().mockFactory.isMock(this)
    } catch (e: UninitializedPropertyAccessException) {
      false
    }
  }
