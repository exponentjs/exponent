package expo.modules.crypto;

import android.content.Context;
import android.util.Base64;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Map;
import expo.core.ExportedModule;
import expo.core.ModuleRegistry;
import expo.core.interfaces.ExpoMethod;
import expo.core.interfaces.ModuleRegistryConsumer;
import expo.core.Promise;

public class CryptoModule extends ExportedModule implements ModuleRegistryConsumer {

  @Override
  public void setModuleRegistry(ModuleRegistry moduleRegistry) {
  }

  @Override
  public String getName() {
    return "ExpoCrypto";
  }

  @ExpoMethod
  public void digestStringAsync(String algorithm, String data, final Map<String, Object> options, final Promise promise) {
    String encoding = (String)options.get("encoding");

    MessageDigest md;
    try { 
      md = MessageDigest.getInstance(algorithm);
      md.update(data.getBytes());
    } catch (NoSuchAlgorithmException e) {
      promise.reject("ERR_CRYPTO_DIGEST", e);
      return;
    }

    byte[] digest = md.digest();
    if (encoding.equals("base64")) {
      String output = Base64.encodeToString(digest, Base64.DEFAULT);
      promise.resolve(output);
    } else if (encoding.equals("hex")) {
      StringBuilder stringBuilder = new StringBuilder(digest.length * 2);
      for (int i = 0; i < digest.length; i++) {
        stringBuilder.append(Integer.toString((digest[i] & 0xff) +
            0x100, 16).substring(1));
      }
      String output = stringBuilder.toString();
      promise.resolve(output);
    } else {
      promise.reject("ERR_CRYPTO_DIGEST", "Invalid encoding type provided.");
    }
  }
}
