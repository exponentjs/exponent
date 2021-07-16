// Copyright 2015-present 650 Industries. All rights reserved.

/**
 * This file is compiled without ARC - the memory needs to be managed by hand.
 */

#import "RCTPackagerConnection+EXDevLauncherPackagerConnectionInterceptor.h"

#import <React/RCTReconnectingWebSocket.h>

#import <objc/runtime.h>
#import <mutex>

#if RCT_DEV

static RCTReconnectingWebSocket *createSocketForURL(NSURL * url)
{
  NSURLComponents *const components = [NSURLComponents new];
  components.host = [url host];
  components.scheme = @"http";
  components.port =  [url port];
  components.path = @"/message";
  components.queryItems = @[[NSURLQueryItem queryItemWithName:@"role" value:@"ios"]];
  static dispatch_queue_t queue;
  static dispatch_once_t onceToken;
  dispatch_once(&onceToken, ^{
    queue = dispatch_queue_create("com.facebook.RCTPackagerConnectionQueue", DISPATCH_QUEUE_SERIAL);
  });

  RCTReconnectingWebSocket *webSocket = [[RCTReconnectingWebSocket alloc] initWithURL:components.URL queue:queue];
  [components release];
  return [webSocket autorelease]; // adds to ARC
}

@implementation RCTPackagerConnection (EXDevLauncherPackagerConnectionInterceptor)

/**
 * Sets the WebSocket URL.
 */
- (void)setSocketConnectionURL:(NSURL *)url
{
  // Mutex isn't an objective-c object - [self valueForKey:@"_mutex"] will fail.
  // The other solution requires `object_getInstanceVariable` which doesn't work with ARC.
  // That's the only solution to get private variables that comes from cpp.
  Ivar mutexVar = object_getInstanceVariable(self, "_mutex", NULL);
  ptrdiff_t mutexOffset = ivar_getOffset(mutexVar);
  unsigned char* selfPtr = (unsigned char *)(__bridge void*)self;
  std::mutex *mutex = (std::mutex *)(selfPtr + mutexOffset);
  
  RCTReconnectingWebSocket *oldSocket = (RCTReconnectingWebSocket *)[self valueForKey:@"_socket"];

  std::lock_guard<std::mutex> l(*mutex);
  if (oldSocket == nil) {
    return; // already stopped
  }

  oldSocket.delegate = nil;
  [oldSocket stop];
  
  RCTReconnectingWebSocket *newSocket = createSocketForURL(url);
  newSocket.delegate = (id<RCTReconnectingWebSocketDelegate>)self;
  [newSocket start];
  
  @try {
    // _serverHostForSocket was removed in RN 0.64
    [self setValue:url.absoluteString forKey:@"_serverHostForSocket"];
  } @catch(id exception) {}
  [self setValue:newSocket forKey:@"_socket"];
}

@end

#endif
