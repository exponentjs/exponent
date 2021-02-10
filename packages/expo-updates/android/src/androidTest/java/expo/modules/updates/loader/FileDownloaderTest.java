package expo.modules.updates.loader;

import android.content.Context;
import android.net.Uri;

import org.junit.Assert;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;

import java.util.Date;
import java.util.HashMap;
import java.util.UUID;

import androidx.test.internal.runner.junit4.AndroidJUnit4ClassRunner;
import androidx.test.platform.app.InstrumentationRegistry;
import expo.modules.updates.UpdatesConfiguration;
import expo.modules.updates.db.entity.UpdateEntity;
import okhttp3.Request;

@RunWith(AndroidJUnit4ClassRunner.class)
public class FileDownloaderTest {

  private Context context;

  @Before
  public void createContext() {
    context = InstrumentationRegistry.getInstrumentation().getTargetContext();
  }

  @Test
  public void testSetHeadersForManifestUrl_LaunchedUpdate() {
    UUID id = UUID.randomUUID();
    UpdateEntity launchedUpdate = new UpdateEntity(id, new Date(), "1.0", "scopeKey");

    Request request = FileDownloader.setHeadersForManifestUrl(createBasicConfig(), launchedUpdate, context);
    Assert.assertEquals(id.toString(), request.header("expo-current-update-id"));
  }

  @Test
  public void testSetHeadersForManifestUrl_NoLaunchedUpdate() {
    Request request = FileDownloader.setHeadersForManifestUrl(createBasicConfig(), null, context);
    Assert.assertNull(request.header("expo-current-update-id"));
  }

  private UpdatesConfiguration createBasicConfig() {
    HashMap<String, Object> configMap = new HashMap<>();
    configMap.put("updateUrl", Uri.parse("https://exp.host/@test/test"));
    configMap.put("runtimeVersion", "1.0");
    return new UpdatesConfiguration().loadValuesFromMap(configMap);
  }
}
