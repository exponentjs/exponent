//  Copyright © 2019 650 Industries. All rights reserved.

#import <EXUpdates/EXUpdatesRemoteAppLoader.h>
#import <EXUpdates/EXUpdatesCrypto.h>
#import <EXUpdates/EXUpdatesFileDownloader.h>

NS_ASSUME_NONNULL_BEGIN

@interface EXUpdatesRemoteAppLoader ()

@property (nonatomic, strong) EXUpdatesFileDownloader *downloader;

@end
static NSString * const EXUpdatesRemoteAppLoaderErrorDomain = @"EXUpdatesRemoteAppLoader";

@implementation EXUpdatesRemoteAppLoader

- (instancetype)initWithConfig:(EXUpdatesConfig *)config
                      database:(EXUpdatesDatabase *)database
                     directory:(NSURL *)directory
               completionQueue:(dispatch_queue_t)completionQueue
{
  if (self = [super initWithConfig:config database:database directory:directory completionQueue:completionQueue]) {
    _downloader = [[EXUpdatesFileDownloader alloc] initWithUpdatesConfig:self.config];
  }
  return self;
}

- (void)loadUpdateFromUrl:(NSURL *)url
       withLaunchedUpdate:(nullable EXUpdatesUpdate *)launchedUpdate
               onManifest:(EXUpdatesAppLoaderManifestBlock)manifestBlock
                  success:(EXUpdatesAppLoaderSuccessBlock)success
                    error:(EXUpdatesAppLoaderErrorBlock)error
{
  self.manifestBlock = manifestBlock;
  self.successBlock = success;
  self.errorBlock = error;
  [_downloader downloadManifestFromURL:url withDatabase:self.database withLaunchedUpdate:launchedUpdate successBlock:^(EXUpdatesUpdate *update) {
    [self startLoadingFromManifest:update];
  } errorBlock:^(NSError *error, NSURLResponse *response) {
    if (self.errorBlock) {
      self.errorBlock(error);
    }
  }];
}

- (void)downloadAsset:(EXUpdatesAsset *)asset
{
  NSURL *urlOnDisk = [self.directory URLByAppendingPathComponent:asset.filename];

  dispatch_async([EXUpdatesFileDownloader assetFilesQueue], ^{
    if ([[NSFileManager defaultManager] fileExistsAtPath:[urlOnDisk path]]) {
      // file already exists, we don't need to download it again
      dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^{
        [self handleAssetDownloadAlreadyExists:asset];
      });
    } else {
      if (!asset.url) {
        [self handleAssetDownloadWithError:[NSError errorWithDomain:EXUpdatesRemoteAppLoaderErrorDomain code:1006 userInfo:@{NSLocalizedDescriptionKey: @"Failed to download asset with no URL provided"}] asset:asset];
        return;
      }

      [self->_downloader downloadFileFromURL:asset.url toPath:[urlOnDisk path] successBlock:^(NSData *data, NSURLResponse *response) {
        dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^{
          [self handleAssetDownloadWithData:data response:response asset:asset];
        });
      } errorBlock:^(NSError *error, NSURLResponse *response) {
        dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^{
          [self handleAssetDownloadWithError:error asset:asset];
        });
      }];
    }
  });
}

@end

NS_ASSUME_NONNULL_END
