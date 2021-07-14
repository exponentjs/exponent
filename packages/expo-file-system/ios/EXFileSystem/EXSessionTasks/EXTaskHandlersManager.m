// Copyright 2015-present 650 Industries. All rights reserved.

#import <EXFileSystem/EXTaskHandlersManager.h>

@interface EXTaskHandlersManager ()

@property (nonatomic, strong) NSMutableDictionary<NSString *, NSURLSessionTask *> *resumableDownloads;

@end

@implementation EXTaskHandlersManager

- (instancetype)init
{
  if (self = [super init]) {
    _resumableDownloads = [NSMutableDictionary dictionary];
  }
  return self;
}

- (void)registerTask:(NSURLSessionTask *)task uuid:(NSString *)uuid
{
  _resumableDownloads[uuid] = task;
}

- (NSURLSessionTask * _Nullable)taskForId:(NSString *)uuid
{
  return _resumableDownloads[uuid];
}
- (NSURLSessionDownloadTask * _Nullable)downloadTaskForId:(NSString *)uuid
{
  NSURLSessionTask *task = [self taskForId:uuid];
  if ([task isKindOfClass:[NSURLSessionDownloadTask class]]) {
    return (NSURLSessionDownloadTask *)task;
  }
  
  return nil;
}

- (NSURLSessionUploadTask * _Nullable)uploadTaskForId:(NSString *)uuid
{
  NSURLSessionTask *task = [self taskForId:uuid];
  if ([task isKindOfClass:[NSURLSessionUploadTask class]]) {
    return (NSURLSessionDownloadTask *)task;
  }
  
  return nil;
}

- (void)unregisterTask:(NSString *)uuid
{
  [_resumableDownloads removeObjectForKey:uuid];
}

@end
