/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

#import <ABI36_0_0React/ABI36_0_0RCTWebSocketModule.h>

#import <objc/runtime.h>

#import <ABI36_0_0React/ABI36_0_0RCTConvert.h>
#import <ABI36_0_0React/ABI36_0_0RCTUtils.h>

#import <ABI36_0_0React/ABI36_0_0RCTSRWebSocket.h>

@implementation ABI36_0_0RCTSRWebSocket (ABI36_0_0React)

- (NSNumber *)ABI36_0_0ReactTag
{
  return objc_getAssociatedObject(self, _cmd);
}

- (void)setABI36_0_0ReactTag:(NSNumber *)ABI36_0_0ReactTag
{
  objc_setAssociatedObject(self, @selector(ABI36_0_0ReactTag), ABI36_0_0ReactTag, OBJC_ASSOCIATION_COPY_NONATOMIC);
}

@end

@interface ABI36_0_0RCTWebSocketModule () <ABI36_0_0RCTSRWebSocketDelegate>

@end

@implementation ABI36_0_0RCTWebSocketModule
{
  NSMutableDictionary<NSNumber *, ABI36_0_0RCTSRWebSocket *> *_sockets;
  NSMutableDictionary<NSNumber *, id<ABI36_0_0RCTWebSocketContentHandler>> *_contentHandlers;
}

ABI36_0_0RCT_EXPORT_MODULE()

// Used by ABI36_0_0RCTBlobModule
@synthesize methodQueue = _methodQueue;

- (NSArray *)supportedEvents
{
  return @[@"websocketMessage",
           @"websocketOpen",
           @"websocketFailed",
           @"websocketClosed"];
}

- (void)invalidate
{
  _contentHandlers = nil;
  for (ABI36_0_0RCTSRWebSocket *socket in _sockets.allValues) {
    socket.delegate = nil;
    [socket close];
  }
}

ABI36_0_0RCT_EXPORT_METHOD(connect:(NSURL *)URL protocols:(NSArray *)protocols options:(NSDictionary *)options socketID:(nonnull NSNumber *)socketID)
{
  NSMutableURLRequest *request = [NSMutableURLRequest requestWithURL:URL];

  // We load cookies from sharedHTTPCookieStorage (shared with XHR and
  // fetch). To get secure cookies for wss URLs, replace wss with https
  // in the URL.
  NSURLComponents *components = [NSURLComponents componentsWithURL:URL resolvingAgainstBaseURL:true];
  if ([components.scheme.lowercaseString isEqualToString:@"wss"]) {
    components.scheme = @"https";
  }

  // Load and set the cookie header.
  NSArray<NSHTTPCookie *> *cookies = [[NSHTTPCookieStorage sharedHTTPCookieStorage] cookiesForURL:components.URL];
  request.allHTTPHeaderFields = [NSHTTPCookie requestHeaderFieldsWithCookies:cookies];

  // Load supplied headers
  [options[@"headers"] enumerateKeysAndObjectsUsingBlock:^(NSString *key, id value, BOOL *stop) {
    [request addValue:[ABI36_0_0RCTConvert NSString:value] forHTTPHeaderField:key];
  }];

  ABI36_0_0RCTSRWebSocket *webSocket = [[ABI36_0_0RCTSRWebSocket alloc] initWithURLRequest:request protocols:protocols];
  [webSocket setDelegateDispatchQueue:_methodQueue];
  webSocket.delegate = self;
  webSocket.ABI36_0_0ReactTag = socketID;
  if (!_sockets) {
    _sockets = [NSMutableDictionary new];
  }
  _sockets[socketID] = webSocket;
  [webSocket open];
}

ABI36_0_0RCT_EXPORT_METHOD(send:(NSString *)message forSocketID:(nonnull NSNumber *)socketID)
{
  [_sockets[socketID] send:message];
}

ABI36_0_0RCT_EXPORT_METHOD(sendBinary:(NSString *)base64String forSocketID:(nonnull NSNumber *)socketID)
{
  [self sendData:[[NSData alloc] initWithBase64EncodedString:base64String options:0] forSocketID:socketID];
}

- (void)sendData:(NSData *)data forSocketID:(nonnull NSNumber *)socketID
{
  [_sockets[socketID] send:data];
}

ABI36_0_0RCT_EXPORT_METHOD(ping:(nonnull NSNumber *)socketID)
{
  [_sockets[socketID] sendPing:NULL];
}

ABI36_0_0RCT_EXPORT_METHOD(close:(NSInteger)code reason:(NSString *)reason socketID:(nonnull NSNumber *)socketID)
{
  [_sockets[socketID] closeWithCode:code reason:reason];
  [_sockets removeObjectForKey:socketID];
}

- (void)setContentHandler:(id<ABI36_0_0RCTWebSocketContentHandler>)handler forSocketID:(NSString *)socketID
{
  if (!_contentHandlers) {
    _contentHandlers = [NSMutableDictionary new];
  }
  _contentHandlers[socketID] = handler;
}

#pragma mark - ABI36_0_0RCTSRWebSocketDelegate methods

- (void)webSocket:(ABI36_0_0RCTSRWebSocket *)webSocket didReceiveMessage:(id)message
{
  NSString *type;

  NSNumber *socketID = [webSocket ABI36_0_0ReactTag];
  id contentHandler = _contentHandlers[socketID];
  if (contentHandler) {
    message = [contentHandler processWebsocketMessage:message forSocketID:socketID withType:&type];
  } else {
    if ([message isKindOfClass:[NSData class]]) {
      type = @"binary";
      message = [message base64EncodedStringWithOptions:0];
    } else {
      type = @"text";
    }
  }

  [self sendEventWithName:@"websocketMessage" body:@{
    @"data": message,
    @"type": type,
    @"id": webSocket.ABI36_0_0ReactTag
  }];
}

- (void)webSocketDidOpen:(ABI36_0_0RCTSRWebSocket *)webSocket
{
  [self sendEventWithName:@"websocketOpen" body:@{
    @"id": webSocket.ABI36_0_0ReactTag,
    @"protocol": webSocket.protocol ? webSocket.protocol : @""
  }];
}

- (void)webSocket:(ABI36_0_0RCTSRWebSocket *)webSocket didFailWithError:(NSError *)error
{
  NSNumber *socketID = [webSocket ABI36_0_0ReactTag];
  _contentHandlers[socketID] = nil;
  _sockets[socketID] = nil;
  [self sendEventWithName:@"websocketFailed" body:@{
    @"message": error.localizedDescription,
    @"id": socketID
  }];
}

- (void)webSocket:(ABI36_0_0RCTSRWebSocket *)webSocket
 didCloseWithCode:(NSInteger)code
           reason:(NSString *)reason
         wasClean:(BOOL)wasClean
{
  NSNumber *socketID = [webSocket ABI36_0_0ReactTag];
  _contentHandlers[socketID] = nil;
  _sockets[socketID] = nil;
  [self sendEventWithName:@"websocketClosed" body:@{
    @"code": @(code),
    @"reason": ABI36_0_0RCTNullIfNil(reason),
    @"clean": @(wasClean),
    @"id": socketID
  }];
}

@end

@implementation ABI36_0_0RCTBridge (ABI36_0_0RCTWebSocketModule)

- (ABI36_0_0RCTWebSocketModule *)webSocketModule
{
  return [self moduleForClass:[ABI36_0_0RCTWebSocketModule class]];
}

@end
