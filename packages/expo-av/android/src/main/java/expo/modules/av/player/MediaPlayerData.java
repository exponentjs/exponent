package expo.modules.av.player;

import android.content.Context;
import android.media.audiofx.Visualizer;
import android.media.MediaPlayer;
import android.media.PlaybackParams;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import androidx.annotation.RequiresApi;
import android.util.Log;
import android.util.Pair;
import android.view.Surface;

import org.unimodules.core.ModuleRegistry;

import java.io.IOException;
import java.net.CookieHandler;
import java.net.HttpCookie;
import java.net.URI;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import expo.modules.av.AVManagerInterface;
import expo.modules.av.AudioFocusNotAcquiredException;


class MediaPlayerData extends PlayerData implements
    MediaPlayer.OnBufferingUpdateListener,
    MediaPlayer.OnCompletionListener,
    MediaPlayer.OnErrorListener,
    MediaPlayer.OnInfoListener,
    MediaPlayer.OnSeekCompleteListener,
    MediaPlayer.OnVideoSizeChangedListener {

  static final String IMPLEMENTATION_NAME = "MediaPlayer";

  private MediaPlayer mMediaPlayer = null;
  private ModuleRegistry mModuleRegistry = null;
  private boolean mMediaPlayerHasStartedEver = false;

  private Visualizer mVisualizer = null;

  private Integer mPlayableDurationMillis = null;
  private boolean mIsBuffering = false;

  MediaPlayerData(final AVManagerInterface avModule, final Context context, final Uri uri, final Map<String, Object> requestHeaders) {
    super(avModule, uri, requestHeaders);
    mModuleRegistry = avModule.getModuleRegistry();
  }

  @Override
  String getImplementationName() {
    return IMPLEMENTATION_NAME;
  }

  // --------- PlayerData implementation ---------

  // Lifecycle

  @Override
  public void load(final Bundle status,
                   final LoadCompletionListener loadCompletionListener) {
    if (mMediaPlayer != null) {
      loadCompletionListener.onLoadError("Load encountered an error: MediaPlayerData cannot be loaded twice.");
      return;
    }

    final MediaPlayer unpreparedPlayer = new MediaPlayer();

    try {
      Uri uri = mUri;
      if (uri.getScheme() == null) {
        int resourceId = mAVModule.getContext().getResources().getIdentifier(uri.toString(), "raw", mAVModule.getContext().getPackageName());
        uri = Uri.parse("android.resource://" + mAVModule.getContext().getPackageName() + "/" + resourceId);
      }
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
        unpreparedPlayer.setDataSource(mAVModule.getContext(), uri, null, getHttpCookiesList());
      } else {
        Map<String, String> headers = new HashMap<>(1);
        StringBuilder cookieBuilder = new StringBuilder();
        for (HttpCookie httpCookie : getHttpCookiesList()) {
          cookieBuilder.append(httpCookie.getName());
          cookieBuilder.append("=");
          cookieBuilder.append(httpCookie.getValue());
          cookieBuilder.append("; ");
        }
        cookieBuilder.append("\r\n");
        headers.put("Cookie", cookieBuilder.toString());
        if (mRequestHeaders != null) {
          for (Map.Entry<String, Object> headerEntry : mRequestHeaders.entrySet()) {
            if (headerEntry.getValue() instanceof String) {
              headers.put(headerEntry.getKey(), (String) headerEntry.getValue());
            }
          }
        }
        unpreparedPlayer.setDataSource(mAVModule.getContext(), uri, headers);
      }
    } catch (final Throwable throwable) {
      loadCompletionListener.onLoadError("Load encountered an error: setDataSource() threw an exception was thrown with message: " + throwable.toString());
      return;
    }

    unpreparedPlayer.setOnErrorListener(new MediaPlayer.OnErrorListener() {
      @Override
      public boolean onError(final MediaPlayer mp, final int what, final int extra) {
        loadCompletionListener.onLoadError("Load encountered an error: the OnErrorListener was called with 'what' code " + what + " and 'extra' code " + extra + ".");
        return true;
      }
    });

    unpreparedPlayer.setOnPreparedListener(new MediaPlayer.OnPreparedListener() {
      @Override
      public void onPrepared(final MediaPlayer mp) {
        mMediaPlayer = mp;
        mMediaPlayer.setOnBufferingUpdateListener(MediaPlayerData.this);
        mMediaPlayer.setOnCompletionListener(MediaPlayerData.this);
        mMediaPlayer.setOnErrorListener(MediaPlayerData.this);
        mMediaPlayer.setOnInfoListener(MediaPlayerData.this);


        mVisualizer = new Visualizer(mMediaPlayer.getAudioSessionId());
        // TODO: Check config?
        // mVisualizer.setEnabled(false);
        // mVisualizer.setCaptureSize(Visualizer.getCaptureSizeRange()[1]);

        // the rate at which the Visualizer calls back with new bytes - will be clamped to max 100ms.
        int callbackRate = Math.min(Visualizer.getMaxCaptureRate(), 100);
        mVisualizer.setDataCaptureListener(new Visualizer.OnDataCaptureListener() {
          @Override
          public void onWaveFormDataCapture(Visualizer visualizer, byte[] bytes, int samplingRate) {
            // TODO: Send bytes to JSI
          }

          @Override
          public void onFftDataCapture(Visualizer visualizer, byte[] bytes, int samplingRate) {
            // TODO: use frequency?
          }
        }, callbackRate, true, false);

        // mVisualizer.setEnabled(true);


        setStatusWithListener(status, new SetStatusCompletionListener() {
          @Override
          public void onSetStatusComplete() {
            loadCompletionListener.onLoadSuccess(getStatus());
          }

          @Override
          public void onSetStatusError(final String error) {
            loadCompletionListener.onLoadSuccess(getStatus());
          }
        });
      }
    });

    try {
      unpreparedPlayer.prepareAsync();
    } catch (final Throwable throwable) {
      loadCompletionListener.onLoadError("Load encountered an error: an exception was thrown from prepareAsync() with message: " + throwable.toString());
    }
  }

  @Override
  public synchronized void release() {
    stopUpdatingProgressIfNecessary();
    if (mMediaPlayer != null) {
      mMediaPlayer.setOnBufferingUpdateListener(null);
      mMediaPlayer.setOnCompletionListener(null);
      mMediaPlayer.setOnErrorListener(null);
      mMediaPlayer.setOnInfoListener(null);
      mMediaPlayer.stop();
      mMediaPlayer.release();
      mMediaPlayer = null;
    }
  }

  @Override
  boolean shouldContinueUpdatingProgress() {
    return mMediaPlayer != null && !mIsBuffering;
  }

  // Set status

  @RequiresApi(api = Build.VERSION_CODES.M)
  private void playMediaPlayerWithRateMAndHigher(final float rate) {
    final PlaybackParams params = mMediaPlayer.getPlaybackParams();
    params.setPitch(mShouldCorrectPitch ? 1.0f : rate);
    params.setSpeed(rate);
    params.setAudioFallbackMode(PlaybackParams.AUDIO_FALLBACK_MODE_DEFAULT);
    mMediaPlayer.setPlaybackParams(params);
    mMediaPlayer.start();
  }

  @Override
  void playPlayerWithRateAndMuteIfNecessary() throws AudioFocusNotAcquiredException {
    if (mMediaPlayer == null || !shouldPlayerPlay()) {
      return;
    }

    if (!mIsMuted) {
      mAVModule.acquireAudioFocus();
    }

    updateVolumeMuteAndDuck();

    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.M) {
      if (!mMediaPlayer.isPlaying()) {
        mMediaPlayer.start();
        mMediaPlayerHasStartedEver = true;
      }
    } else {
      boolean rateAndPitchAreSetCorrectly;
      try {
        final PlaybackParams params = mMediaPlayer.getPlaybackParams();
        final float setRate = params.getSpeed();
        final boolean setShouldCorrectPitch = params.getPitch() == 1.0f;
        rateAndPitchAreSetCorrectly = setRate == mRate && setShouldCorrectPitch == mShouldCorrectPitch;
      } catch (final Throwable throwable) {
        rateAndPitchAreSetCorrectly = false;
      }
      if (mRate != 0 && (!mMediaPlayer.isPlaying() || !rateAndPitchAreSetCorrectly)) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
          playMediaPlayerWithRateMAndHigher(mRate);
        } else if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
          // Bizarrely, I wasn't able to change rate while a sound was playing unless I had
          // changed the rate to something other than 1f before the sound started.
          // This workaround seems to fix this issue (which is said to only be fixed in N):
          // https://code.google.com/p/android/issues/detail?id=192135
          playMediaPlayerWithRateMAndHigher(2f);
          mMediaPlayer.pause();
          playMediaPlayerWithRateMAndHigher(mRate);
        }
        mMediaPlayerHasStartedEver = true;
      }
    }
    beginUpdatingProgressIfNecessary();
  }

  @Override
  void applyNewStatus(final Integer newPositionMillis, final Boolean newIsLooping)
      throws AudioFocusNotAcquiredException, IllegalStateException {
    if (mMediaPlayer == null) {
      throw new IllegalStateException("mMediaPlayer is null!");
    }

    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.M && mRate != 1.0f) {
      Log.w("Expo MediaPlayerData", "Cannot set audio/video playback rate for Android SDK < 23.");
      mRate = 1.0f;
    }

    // Set looping idempotently
    if (newIsLooping != null) {
      mMediaPlayer.setLooping(newIsLooping);
    }

    // Pause first if necessary.
    if (!shouldPlayerPlay()) {
      if (mMediaPlayerHasStartedEver) {
        mMediaPlayer.pause();
      }
      stopUpdatingProgressIfNecessary();
    }

    // Mute / update volume if it doesn't require a request of the audio focus.
    updateVolumeMuteAndDuck();

    // Seek
    if (newPositionMillis != null && newPositionMillis != mMediaPlayer.getCurrentPosition()) {
      mMediaPlayer.seekTo(newPositionMillis);
    }

    // Play / unmute
    playPlayerWithRateAndMuteIfNecessary();
  }

  // Get status

  @Override
  boolean isLoaded() {
    return mMediaPlayer != null;
  }

  @Override
  void getExtraStatusFields(final Bundle map) {
    Integer duration = mMediaPlayer.getDuration();
    duration = duration < 0 ? null : duration;
    if (duration != null) {
      map.putInt(STATUS_DURATION_MILLIS_KEY_PATH, duration);
    }
    map.putInt(STATUS_POSITION_MILLIS_KEY_PATH, getClippedIntegerForValue(mMediaPlayer.getCurrentPosition(), 0, duration));
    if (mPlayableDurationMillis != null) {
      map.putInt(STATUS_PLAYABLE_DURATION_MILLIS_KEY_PATH, getClippedIntegerForValue(mPlayableDurationMillis, 0, duration));
    }

    map.putBoolean(STATUS_IS_PLAYING_KEY_PATH, mMediaPlayer.isPlaying());
    map.putBoolean(STATUS_IS_BUFFERING_KEY_PATH, mIsBuffering);

    map.putBoolean(STATUS_IS_LOOPING_KEY_PATH, mMediaPlayer.isLooping());
  }

  // Video specific stuff

  @Override
  public Pair<Integer, Integer> getVideoWidthHeight() {
    return mMediaPlayer == null ? new Pair<>(0, 0) : new Pair<>(mMediaPlayer.getVideoWidth(), mMediaPlayer.getVideoHeight());
  }

  @Override
  public void tryUpdateVideoSurface(final Surface surface) {
    if (mMediaPlayer == null) {
      return;
    }
    mMediaPlayer.setSurface(surface);
    if (!mMediaPlayerHasStartedEver && !mShouldPlay) {
      // For some reason, the media player does not render to the screen until start() has been
      // called in some cases.
      mMediaPlayer.start();
      mMediaPlayer.pause();
      mMediaPlayerHasStartedEver = true;
    }
  }

  @Override
  public int getAudioSessionId() {
    return mMediaPlayer != null ? mMediaPlayer.getAudioSessionId() : 0;
  }

  // --------- Interface implementation ---------

  // AudioEventHandler

  @Override
  public void pauseImmediately() {
    if (mMediaPlayer != null && mMediaPlayerHasStartedEver) {
      mMediaPlayer.pause();
    }
    stopUpdatingProgressIfNecessary();
  }

  @Override
  public boolean requiresAudioFocus() {
    return mMediaPlayer != null && (mMediaPlayer.isPlaying() || shouldPlayerPlay()) && !mIsMuted;
  }

  @Override
  public void updateVolumeMuteAndDuck() {
    if (mMediaPlayer != null) {
      final float value = mAVModule.getVolumeForDuckAndFocus(mIsMuted, mVolume);
      mMediaPlayer.setVolume(value, value);
    }
  }

  // MediaPlayer.*Listener

  @Override
  public void onBufferingUpdate(final MediaPlayer mp, final int percent) {
    if (mp.getDuration() >= 0) {
      mPlayableDurationMillis = (int) (mp.getDuration() * (((double) percent) / 100.0));
    } else {
      mPlayableDurationMillis = null;
    }
    callStatusUpdateListener();
  }

  @Override
  public void onCompletion(final MediaPlayer mp) {
    callStatusUpdateListenerWithDidJustFinish();

    if (!mp.isLooping()) {
      mAVModule.abandonAudioFocusIfUnused();
      stopUpdatingProgressIfNecessary();
    }
  }

  @Override
  public boolean onError(final MediaPlayer mp, final int what, final int extra) {
    release();
    if (mErrorListener != null) {
      mErrorListener.onError("MediaPlayer failed with 'what' code " + what + " and 'extra' code " + extra + ".");
    }
    return true;
  }

  @Override
  public boolean onInfo(final MediaPlayer mp, final int what, final int extra) {
    // Writing out all of the possible values here for clarity
    // @jesseruder @nikki93 I think we should hold off on handling some of the more obscure values
    // until the ExoPlayer refactor.
    switch (what) {
      case MediaPlayer.MEDIA_INFO_UNKNOWN:
        break;
      case MediaPlayer.MEDIA_INFO_BUFFERING_START:
        mIsBuffering = true;
        break;
      case MediaPlayer.MEDIA_INFO_BUFFERING_END:
        mIsBuffering = false;
        beginUpdatingProgressIfNecessary();
        break;
      case MediaPlayer.MEDIA_INFO_BAD_INTERLEAVING:
        break;
      case MediaPlayer.MEDIA_INFO_NOT_SEEKABLE:
        break;
      case MediaPlayer.MEDIA_INFO_METADATA_UPDATE:
        break;
      case MediaPlayer.MEDIA_INFO_UNSUPPORTED_SUBTITLE:
        break;
      case MediaPlayer.MEDIA_INFO_SUBTITLE_TIMED_OUT:
        break;
      case MediaPlayer.MEDIA_INFO_VIDEO_RENDERING_START:
        if (mVideoSizeUpdateListener != null) {
          mVideoSizeUpdateListener.onVideoSizeUpdate(new Pair<>(mp.getVideoWidth(), mp.getVideoHeight()));
        }
        break;
      case MediaPlayer.MEDIA_INFO_VIDEO_TRACK_LAGGING:
        break;
    }
    callStatusUpdateListener();
    return true;
  }

  @Override
  public void onSeekComplete(final MediaPlayer mp) {
    callStatusUpdateListener();
  }

  @Override
  public void onVideoSizeChanged(final MediaPlayer mp, final int width, final int height) {
    if (mVideoSizeUpdateListener != null) {
      mVideoSizeUpdateListener.onVideoSizeUpdate(new Pair<>(width, height));
    }
  }

  // Utilities

  private List<HttpCookie> getHttpCookiesList() {
    if (mModuleRegistry != null) {
      CookieHandler cookieHandler = mModuleRegistry.getModule(CookieHandler.class);
      if (cookieHandler != null) {
        try {
          Map<String, List<String>> headersMap = cookieHandler.get(URI.create(mUri.toString()), null);
          List<String> cookies = headersMap.get("Cookie");
          if (cookies != null) {
            List<HttpCookie> httpCookies = new ArrayList<>();
            for (String cookieValue : cookies) {
              httpCookies.addAll(HttpCookie.parse(cookieValue));
            }
            return httpCookies;
          } else {
            return Collections.emptyList();
          }
        } catch (IOException e) {
          // do nothing, we'll return an empty list
        }
      }
    }
    return Collections.emptyList();
  }
}
