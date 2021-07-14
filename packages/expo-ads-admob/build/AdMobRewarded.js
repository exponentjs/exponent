import { EventEmitter, UnavailabilityError } from '@unimodules/core';
import { setTestDeviceIDAsync } from './AdMob';
import AdMobNativeModule from './ExpoAdsAdMobRewardedVideoAdManager';
const moduleName = 'AdMobRewarded';
const eventNames = [
    'rewardedVideoUserDidEarnReward',
    'rewardedVideoDidLoad',
    'rewardedVideoDidFailToLoad',
    'rewardedVideoDidPresent',
    'rewardedVideoDidFailToPresent',
    'rewardedVideoDidDismiss',
];
const eventEmitter = new EventEmitter(AdMobNativeModule);
const eventHandlers = {};
for (const eventName of eventNames) {
    eventHandlers[eventName] = new Map();
}
export default {
    async setAdUnitID(id) {
        if (!AdMobNativeModule.setAdUnitID) {
            throw new UnavailabilityError(moduleName, 'setAdUnitID');
        }
        await AdMobNativeModule.setAdUnitID(id);
    },
    /** @deprecated Test device IDs are now set globally. Use `AdMob.setTestDeviceIDAsync` instead. */
    async setTestDeviceID(id) {
        console.warn('AdMobRewarded.setTestDeviceID is deprecated. Test device IDs are now set globally. Use AdMob.setTestDeviceIDAsync instead.');
        await setTestDeviceIDAsync(id);
    },
    async requestAdAsync(options = {}) {
        if (!AdMobNativeModule.requestAd) {
            throw new UnavailabilityError(moduleName, 'requestAdAsync');
        }
        const params = {
            ...options.additionalRequestParams,
        };
        if (!options.servePersonalizedAds) {
            params.npa = '1';
        }
        await AdMobNativeModule.requestAd(params, options.serverSideVerificationOptions);
    },
    async showAdAsync() {
        if (!AdMobNativeModule.showAd) {
            throw new UnavailabilityError(moduleName, 'showAdAsync');
        }
        await AdMobNativeModule.showAd();
    },
    async dismissAdAsync() {
        if (!AdMobNativeModule.dismissAd) {
            throw new UnavailabilityError(moduleName, 'dismissAdAsync');
        }
        await AdMobNativeModule.dismissAd();
    },
    async getIsReadyAsync() {
        if (!AdMobNativeModule.getIsReady) {
            throw new UnavailabilityError(moduleName, 'getIsReadyAsync');
        }
        return await AdMobNativeModule.getIsReady();
    },
    addEventListener(type, handler) {
        if (eventNames.includes(type)) {
            eventHandlers[type].set(handler, eventEmitter.addListener(type, handler));
        }
        else {
            console.log(`Event with type ${type} does not exist.`);
        }
    },
    removeEventListener(type, handler) {
        const eventSubscription = eventHandlers[type].get(handler);
        if (!eventHandlers[type].has(handler) || !eventSubscription) {
            return;
        }
        eventSubscription.remove();
        eventHandlers[type].delete(handler);
    },
    removeAllListeners() {
        for (const eventName of eventNames) {
            eventEmitter.removeAllListeners(eventName);
        }
    },
};
//# sourceMappingURL=AdMobRewarded.js.map