// Copyright 2015-present 650 Industries. All rights reserved.
package expo.modules.font

import android.content.Context
import android.graphics.Typeface
import android.net.Uri
import com.facebook.react.views.text.ReactFontManager
import expo.modules.font.exceptions.FontAlreadyLoadedException
import expo.modules.font.exceptions.FontFileInvalidException
import expo.modules.font.exceptions.FontFileNotFoundException
import org.unimodules.core.ExportedModule
import org.unimodules.core.ModuleRegistry
import org.unimodules.core.Promise
import org.unimodules.core.errors.CodedRuntimeException
import org.unimodules.core.errors.InvalidArgumentException
import org.unimodules.core.interfaces.ExpoMethod
import java.io.File
import java.util.*

open class FontLoaderModule(context: Context?) : ExportedModule(context) {
  @JvmField
  protected var mModuleRegistry: ModuleRegistry? = null
  protected var mLoadedFontNames: MutableSet<String> = HashSet()

  override fun getName(): String {
    return EXPORTED_NAME
  }

  override fun onCreate(moduleRegistry: ModuleRegistry) {
    mModuleRegistry = moduleRegistry
  }

  @ExpoMethod
  open fun loadAsync(fontFamilyName: String?, localUri: String?, promise: Promise) {
    try {
      if (mLoadedFontNames.contains(fontFamilyName)) {
        throw FontAlreadyLoadedException(fontFamilyName)
      }

      // Validate arguments
      if (fontFamilyName == null) {
        throw InvalidArgumentException("Font family name cannot be empty (null received)")
      }
      if (localUri == null) {
        throw InvalidArgumentException("Local font URI cannot be empty (null received)")
      }

      val typeface = getTypeface(localUri) ?: throw FontFileInvalidException(localUri)

      ReactFontManager.getInstance().setTypeface(fontFamilyName, Typeface.NORMAL, typeface)
      mLoadedFontNames.add(fontFamilyName)
      promise.resolve(null)
    } catch (e: CodedRuntimeException) {
      // Most probably an InvalidArgumentException. Already coded!
      promise.reject(e)
    } catch (e: RuntimeException) {
      // Runtime exception is thrown if and only if there's no font file
      promise.reject(FontFileNotFoundException(fontFamilyName, localUri))
    }
  }

  @Throws(InvalidArgumentException::class)
  protected fun getTypeface(localUri: String): Typeface? {
    if (localUri.startsWith(ASSET_SCHEME)) {
      return Typeface.createFromAsset(
        context.assets,  // Also remove the leading slash.
        localUri.substring(ASSET_SCHEME.length + 1))
    }
    val localFontPath = Uri.parse(localUri).path
      ?: throw InvalidArgumentException("Could not parse provided local font URI as a URI with a path component.")
    return Typeface.createFromFile(File(localFontPath))
  }

  companion object {
    private const val ASSET_SCHEME = "asset://"
    private const val EXPORTED_NAME = "ExpoFontLoader"
  }
}
