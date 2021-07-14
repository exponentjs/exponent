// Copyright 2015-present 650 Industries. All rights reserved.

#import <EXFileSystem/EXSessionUploadTaskDelegate.h>
#import <EXFileSystem/EXTaskHandlersManager.h>

typedef void (^EXUploadDelegateOnSendCallback)(NSURLSessionUploadTask *task, int64_t bytesSent, int64_t totalBytesSent, int64_t totalBytesExpectedToSend);

@interface EXSessionCancelableUploadTaskDelegate : EXSessionUploadTaskDelegate

- (instancetype)initWithResolve:(UMPromiseResolveBlock)resolve
                         reject:(UMPromiseRejectBlock)reject
                 onSendCallback:(EXUploadDelegateOnSendCallback)onSendCallback
               resumableManager:(EXTaskHandlersManager *)manager
                           uuid:(NSString *)uuid;

@end
