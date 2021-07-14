// Copyright 2015-present 650 Industries. All rights reserved.

#import <Foundation/Foundation.h>

NS_ASSUME_NONNULL_BEGIN

@interface EXTaskHandlersManager : NSObject

- (NSURLSessionTask * _Nullable)taskForId:(NSString *)uuid;

- (NSURLSessionDownloadTask * _Nullable)downloadTaskForId:(NSString *)uuid;

- (NSURLSessionUploadTask * _Nullable)uploadTaskForId:(NSString *)uuid;

- (void)registerTask:(NSURLSessionTask *)task uuid:(NSString *)uuid;

- (void)unregisterTask:(NSString *)uuid;

@end

NS_ASSUME_NONNULL_END
