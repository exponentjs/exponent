//  Copyright © 2021 650 Industries. All rights reserved.

#import <EXUpdates/NSDictionary+EXUpdatesRawManifest.h>

NS_ASSUME_NONNULL_BEGIN

@interface EXUpdatesBaseRawManifest : NSObject

@property (nonatomic, readonly, strong) NSDictionary* rawManifestJSON;

- (instancetype)init NS_UNAVAILABLE;
- (instancetype)initWithRawManifestJSON:(NSDictionary *)rawManifestJSON NS_DESIGNATED_INITIALIZER;

# pragma mark - Common EXUpdatesRawManifestBehavior

- (NSString *)legacyId;
- (nullable NSString *)revisionId;
- (nullable NSString *)slug;
- (nullable NSString *)appKey;
- (nullable NSString *)name;
- (nullable NSDictionary *)notificationPreferences;
- (nullable NSDictionary *)updatesInfo;
- (nullable NSDictionary *)iosConfig;
- (nullable NSString *)hostUri;
- (nullable NSString *)orientation;
- (nullable NSDictionary *)experiments;
- (nullable NSDictionary *)developer;
- (nullable NSString *)facebookAppId;
- (nullable NSString *)facebookApplicationName;
- (BOOL)facebookAutoInitEnabled;

- (BOOL)isDevelopmentMode;
- (BOOL)isDevelopmentSilentLaunch;
- (BOOL)isUsingDeveloperTool;
- (nullable NSString *)userInterfaceStyle;
- (nullable NSString *)iosOrRootBackroundColor;
- (nullable NSString *)iosSplashBackgroundColor;
- (nullable NSString *)iosSplashImageUrl;
- (nullable NSString *)iosSplashImageResizeMode;
- (nullable NSString *)iosGoogleServicesFile;

- (nullable NSDictionary *)expoGoConfigRootObject;
- (nullable NSDictionary *)expoClientConfigRootObject;

@end

NS_ASSUME_NONNULL_END
