// Copyright 2015-present 650 Industries. All rights reserved.

#import <EXFileSystem/EXSessionCancelableUploadTaskDelegate.h>

@interface EXSessionCancelableUploadTaskDelegate ()

@property (strong, nonatomic, readonly) EXUploadDelegateOnSendCallback onSendCallback;
@property (weak, nonatomic) EXTaskHandlersManager *manager;
@property (strong, nonatomic) NSString *uuid;

@end

@implementation EXSessionCancelableUploadTaskDelegate

- (instancetype)initWithResolve:(UMPromiseResolveBlock)resolve
                         reject:(UMPromiseRejectBlock)reject
                 onSendCallback:(EXUploadDelegateOnSendCallback)onSendCallback
                resumableManager:(EXTaskHandlersManager *)manager
                           uuid:(NSString *)uuid;
{
  if (self = [super initWithResolve:resolve
                             reject:reject]) {
    _onSendCallback = onSendCallback;
    _manager = manager;
    _uuid = uuid;
  }
  return self;
}

- (void)URLSession:(NSURLSession *)session task:(NSURLSessionTask *)task didCompleteWithError:(NSError *)error
{
  if (error) {
    // The task was paused by us. So, we shouldn't throw.
    if (error.code == NSURLErrorCancelled) {
      self.resolve([NSNull null]);
      [_manager unregisterTask:_uuid];
      return;
    }
  }

  [super URLSession:session task:task didCompleteWithError:error];
  [_manager unregisterTask:_uuid];
}

- (void)URLSession:(NSURLSession *)session task:(NSURLSessionTask *)task
                                didSendBodyData:(int64_t)bytesSent
                                 totalBytesSent:(int64_t)totalBytesSent
                       totalBytesExpectedToSend:(int64_t)totalBytesExpectedToSend
{
  if (_onSendCallback && bytesSent > 0) {
    _onSendCallback(task, bytesSent, totalBytesSent, totalBytesExpectedToSend);
  }
}

@end
