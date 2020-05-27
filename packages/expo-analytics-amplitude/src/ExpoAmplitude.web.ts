import amplitude from 'amplitude-js'

export default {
  get name(): string {
    return 'ExpoAmplitude';
  },
  initialize(apiKey: string, options?: amplitude.Config) {
    amplitude.getInstance().init(apiKey, undefined, options)
  },
  setUserId(userId: string) {
    amplitude.getInstance().setUserId(userId)
  },
  setUserProperties(userProperties: Record<string, any>) {
    amplitude.getInstance().setUserProperties(userProperties)
  },
  clearUserProperties() {
    amplitude.getInstance().clearUserProperties()
  },
  logEvent(eventName: string) {
    amplitude.getInstance().logEvent(eventName)
  },
  logEventWithProperties(
    eventName: string,
    properties: Record<string, any>,
  ) {
    amplitude.getInstance().logEvent(eventName, properties)
  },
  setGroup(groupType: string, groupNames: string[]) {
    amplitude.getInstance().setGroup(groupType, groupNames)
  }
}
