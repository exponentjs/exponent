# https://bumptech.github.io/glide/doc/download-setup.html#proguard

-keep public class * implements com.bumptech.glide.module.GlideModule
-keep public class * extends com.bumptech.glide.module.AppGlideModule
-keep public enum com.bumptech.glide.load.ImageHeaderParser$** {
  **[] $VALUES;
  public *;
}

-dontwarn com.bumptech.glide.load.resource.bitmap.VideoDecoder

# https://bumptech.github.io/glide/doc/configuration.html#applications

-keep public class * extends com.bumptech.glide.module.AppGlideModule
-keep public class expo.modules.image.svg.SVGModule
-keep class com.bumptech.glide.GeneratedAppGlideModuleImpl

-keep public class com.bumptech.glide.integration.webp.WebpImage { *; }
-keep public class com.bumptech.glide.integration.webp.WebpFrame { *; }
-keep public class com.bumptech.glide.integration.webp.WebpBitmapFactory { *; }