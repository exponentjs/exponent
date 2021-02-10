//  Copyright © 2019 650 Industries. All rights reserved.

#import <EXUpdates/EXUpdatesConfig.h>
#import <EXUpdates/EXUpdatesUpdate.h>

NS_ASSUME_NONNULL_BEGIN

typedef void (^EXUpdatesFileDownloaderSuccessBlock)(NSData *data, NSURLResponse *response);
typedef void (^EXUpdatesFileDownloaderManifestSuccessBlock)(EXUpdatesUpdate *update);
typedef void (^EXUpdatesFileDownloaderErrorBlock)(NSError *error, NSURLResponse *response);

@interface EXUpdatesFileDownloader : NSObject

- (instancetype)initWithUpdatesConfig:(EXUpdatesConfig *)updatesConfig;
- (instancetype)initWithUpdatesConfig:(EXUpdatesConfig *)updatesConfig
              URLSessionConfiguration:(NSURLSessionConfiguration *)sessionConfiguration;

- (void)downloadDataFromURL:(NSURL *)url
               successBlock:(EXUpdatesFileDownloaderSuccessBlock)successBlock
                 errorBlock:(EXUpdatesFileDownloaderErrorBlock)errorBlock;

- (void)downloadFileFromURL:(NSURL *)url
                     toPath:(NSString *)destinationPath
               successBlock:(EXUpdatesFileDownloaderSuccessBlock)successBlock
                 errorBlock:(EXUpdatesFileDownloaderErrorBlock)errorBlock;

- (void)downloadManifestFromURL:(NSURL *)url
                   withDatabase:(EXUpdatesDatabase *)database
             withLaunchedUpdate:(nullable EXUpdatesUpdate *)launchedUpdate
                   successBlock:(EXUpdatesFileDownloaderManifestSuccessBlock)successBlock
                     errorBlock:(EXUpdatesFileDownloaderErrorBlock)errorBlock;

- (void)setManifestHTTPHeaderFields:(NSMutableURLRequest *)request
                 withLaunchedUpdate:(nullable EXUpdatesUpdate *)launchedUpdate;

+ (dispatch_queue_t)assetFilesQueue;

@end

NS_ASSUME_NONNULL_END
