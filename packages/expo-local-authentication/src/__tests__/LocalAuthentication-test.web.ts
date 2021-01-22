import * as LocalAuthentication from '../LocalAuthentication';

describe(`isAvailableAsync`, () => {
  it('resolves to true on web platform', async () => {
    await expect(LocalAuthentication.isAvailableAsync()).resolves.toBeTruthy();
  });
});
