import * as Haptics from '../Haptics';

const { default: ExpoHaptics } = require('../ExpoHaptics');

describe('isAvailableAsync', () => {
  it('returns true on native platforms', async () => {
    await expect(Haptics.isAvailableAsync()).resolves.toBeTruthy();
  });
});

describe('notificationAsync', () => {
  it('calls native method with notification feedback type', async () => {
    await Haptics.notificationAsync();
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

    expect(ExpoHaptics.notificationAsync).toBeCalledWith(Haptics.NotificationFeedbackType.Success);
    expect(ExpoHaptics.notificationAsync).toBeCalledWith(Haptics.NotificationFeedbackType.Error);
  });
});

describe('impactAsync', () => {
  it('calls native method with impact feedback style', async () => {
    await Haptics.impactAsync();
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    expect(ExpoHaptics.impactAsync).toBeCalledWith(Haptics.ImpactFeedbackStyle.Medium);
    expect(ExpoHaptics.impactAsync).toBeCalledWith(Haptics.ImpactFeedbackStyle.Light);
  });
});

describe('selectionAsync', () => {
  it('calls native method', async () => {
    await Haptics.selectionAsync();
    expect(ExpoHaptics.selectionAsync).toBeCalled();
  });
});

describe('deprecated methods', () => {
  let warnSpy: jest.SpyInstance;

  beforeEach(() => {
    warnSpy = jest.spyOn(console, 'warn').mockImplementation();
  });

  afterEach(() => {
    warnSpy.mockRestore();
  });

  it('warns and relays call to newer method for notification', async () => {
    await Haptics.notification();
    await Haptics.notification(Haptics.NotificationFeedbackType.Warning);

    expect(ExpoHaptics.notificationAsync).toBeCalledWith(Haptics.NotificationFeedbackType.Success);
    expect(ExpoHaptics.notificationAsync).toBeCalledWith(Haptics.NotificationFeedbackType.Warning);
    expect(warnSpy).toBeCalledWith(
      '`Haptics.notification` is deprecated. Use `Haptics.notificationAsync` instead.'
    );
  });

  it('warns and relays call to newer method for impact', async () => {
    await Haptics.impact();
    await Haptics.impact(Haptics.ImpactFeedbackStyle.Heavy);

    expect(ExpoHaptics.impactAsync).toBeCalledWith(Haptics.ImpactFeedbackStyle.Medium);
    expect(ExpoHaptics.impactAsync).toBeCalledWith(Haptics.ImpactFeedbackStyle.Heavy);
    expect(warnSpy).toBeCalledWith(
      '`Haptics.impact` is deprecated. Use `Haptics.impactAsync` instead.'
    );
  });

  it('warns and relays call to newer method for selection', async () => {
    await Haptics.selection();

    expect(ExpoHaptics.selectionAsync).toBeCalled();
    expect(warnSpy).toBeCalledWith(
      '`Haptics.selection` is deprecated. Use `Haptics.selectionAsync` instead.'
    );
  });
});
