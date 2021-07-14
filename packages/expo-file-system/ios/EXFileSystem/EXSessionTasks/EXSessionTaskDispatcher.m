// Copyright 2015-present 650 Industries. All rights reserved.

#import <EXFileSystem/EXSessionTaskDispatcher.h>
#import <EXFileSystem/EXSessionResumableDownloadTaskDelegate.h>

@interface EXSessionTaskDispatcher ()

@property (nonatomic, strong) NSMutableDictionary<NSURLSessionTask *, EXSessionTaskDelegate *> *tasks;
@property (nonatomic) BOOL isActive;
@property (nonatomic, weak) id<EXSessionHandler> sessionHandler;

@end

@implementation EXSessionTaskDispatcher

- (instancetype)initWithSessionHandler:(id<EXSessionHandler>)sessionHandler;
{
  if (self = [super init]) {
    _tasks = [NSMutableDictionary dictionary];
    _isActive = true;
    _sessionHandler = sessionHandler;
  }
  return self;
}

#pragma mark - public methods

- (void)registerTaskDelegate:(EXSessionTaskDelegate *)delegate forTask:(NSURLSessionTask *)task
{
  _tasks[task] = delegate;
}

- (void)deactivate
{
  _isActive = false;
}

#pragma mark - dispatcher

- (void)URLSession:(NSURLSession *)session downloadTask:(NSURLSessionDownloadTask *)downloadTask didFinishDownloadingToURL:(NSURL *)location
{
  if (_isActive) {
    EXSessionTaskDelegate *exTask = _tasks[downloadTask];
    if (exTask) {
      [exTask URLSession:session downloadTask:downloadTask didFinishDownloadingToURL:location];
      [_tasks removeObjectForKey:downloadTask];
    }
  }
}

- (void)URLSession:(NSURLSession *)session task:(NSURLSessionTask *)task didCompleteWithError:(NSError *)error
{
  if (_isActive) {
    EXSessionTaskDelegate *exTask = _tasks[task];
    if (exTask) {
      [exTask URLSession:session task:task didCompleteWithError:error];
      [_tasks removeObjectForKey:task];
    }
  }
}

- (void)URLSession:(NSURLSession *)session downloadTask:(NSURLSessionDownloadTask *)downloadTask
                                           didWriteData:(int64_t)bytesWritten
                                      totalBytesWritten:(int64_t)totalBytesWritten
                              totalBytesExpectedToWrite:(int64_t)totalBytesExpectedToWrite
{
  if (_isActive) {
    EXSessionTaskDelegate *exTask = _tasks[downloadTask];
    [exTask URLSession:session downloadTask:downloadTask didWriteData:bytesWritten totalBytesWritten:totalBytesWritten totalBytesExpectedToWrite:totalBytesExpectedToWrite];
  }
}

- (void)URLSession:(NSURLSession *)session dataTask:(NSURLSessionDataTask *)dataTask didReceiveData:(NSData *)data
{
  if (_isActive) {
    EXSessionTaskDelegate *exTask = _tasks[dataTask];
    [exTask URLSession:session dataTask:dataTask didReceiveData:data];
  }
}

- (void)URLSessionDidFinishEventsForBackgroundURLSession:(NSURLSession *)session {
  [_sessionHandler invokeCompletionHandlerForSessionIdentifier:session.configuration.identifier];
}

- (void)URLSession:(NSURLSession *)session task:(NSURLSessionTask *)task
                                didSendBodyData:(int64_t)bytesSent
                                 totalBytesSent:(int64_t)totalBytesSent
                       totalBytesExpectedToSend:(int64_t)totalBytesExpectedToSend
{
  if (_isActive) {
    EXSessionTaskDelegate *exTask = _tasks[task];
    [exTask URLSession:session task:task didSendBodyData:bytesSent totalBytesSent:totalBytesSent totalBytesExpectedToSend:totalBytesExpectedToSend];
  }
}

@end
