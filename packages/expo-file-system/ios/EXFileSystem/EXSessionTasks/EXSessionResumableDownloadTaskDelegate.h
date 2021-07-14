// Copyright 2015-present 650 Industries. All rights reserved.

#import <EXFileSystem/EXSessionDownloadTaskDelegate.h>
#import <EXFileSystem/EXTaskHandlersManager.h>

typedef void (^EXDownloadDelegateOnWriteCallback)(NSURLSessionDownloadTask *task, int64_t bytesWritten, int64_t totalBytesWritten, int64_t totalBytesExpectedToWrite);

@interface EXSessionResumableDownloadTaskDelegate : EXSessionDownloadTaskDelegate

- (instancetype)initWithResolve:(UMPromiseResolveBlock)resolve
                         reject:(UMPromiseRejectBlock)reject
                       localUrl:(NSURL *)localUrl
             shouldCalculateMd5:(BOOL)shouldCalculateMd5
                onWriteCallback:(EXDownloadDelegateOnWriteCallback)onWriteCallback
               resumableManager:(EXTaskHandlersManager *)manager
                           uuid:(NSString *)uuid;

@end
