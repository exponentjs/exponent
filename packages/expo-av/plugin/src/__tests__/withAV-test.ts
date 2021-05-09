import withAV from '../withAV';

describe(withAV, () => {
  it(`adds microphone permission by default`, () => {
    const config = withAV({ name: 'foobar', slug: 'foobar' });
    expect(config.ios.infoPlist.NSMicrophoneUsageDescription).toBeDefined();
    expect(config.android.permissions).toStrictEqual(['android.permission.RECORD_AUDIO']);
  });
  it(`adds a custom microphone permission message`, () => {
    const config = withAV(
      { name: 'foobar', slug: 'foobar' },
      { microphonePermission: 'hello world' }
    );
    expect(config.ios.infoPlist.NSMicrophoneUsageDescription).toBe('hello world');
  });
  it(`disables microphone permission`, () => {
    const config = withAV({ name: 'foobar', slug: 'foobar' }, { microphonePermission: false });
    expect(config.ios).not.toBeDefined();
    expect(config.android).not.toBeDefined();
  });
});
