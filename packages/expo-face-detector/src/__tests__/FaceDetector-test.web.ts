import * as FaceDetector from '../FaceDetector';

describe('isAvailableAsync', () => {
  it('resolves to false on web platform', async () => {
    await expect(FaceDetector.isAvailableAsync()).resolves.toBeFalsy();
  });
});
