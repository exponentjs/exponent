//  Copyright © 2019 650 Industries. All rights reserved.

#import <EXUpdates/EXUpdatesConfig.h>
#import <EXUpdates/EXUpdatesDatabase.h>
#import <EXUpdates/EXUpdatesUpdate.h>

NS_ASSUME_NONNULL_BEGIN

typedef BOOL (^EXUpdatesAppLoaderManifestBlock)(EXUpdatesUpdate *update);
typedef void (^EXUpdatesAppLoaderSuccessBlock)(EXUpdatesUpdate * _Nullable update);
typedef void (^EXUpdatesAppLoaderErrorBlock)(NSError *error);

@interface EXUpdatesAppLoader : NSObject

- (instancetype)initWithConfig:(EXUpdatesConfig *)config
                      database:(EXUpdatesDatabase *)database
                     directory:(NSURL *)directory
               completionQueue:(dispatch_queue_t)completionQueue;

/**
 * Load an update from the given URL, which should respond with a valid manifest.
 *
 * The `onManifest` block is called as soon as the manifest has been downloaded.
 * The block should determine whether or not the update described by this manifest
 * should be downloaded, based on (for example) whether or not it already has the
 * update downloaded locally, and return the corresponding BOOL value.
 */
- (void)loadUpdateFromUrl:(NSURL *)url
       withLaunchedUpdate:(nullable EXUpdatesUpdate *)launchedUpdate
               onManifest:(EXUpdatesAppLoaderManifestBlock)manifestBlock
                  success:(EXUpdatesAppLoaderSuccessBlock)success
                    error:(EXUpdatesAppLoaderErrorBlock)error;

@end

NS_ASSUME_NONNULL_END
