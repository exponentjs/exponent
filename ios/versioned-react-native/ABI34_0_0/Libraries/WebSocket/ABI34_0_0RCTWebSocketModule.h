/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

#import <ReactABI34_0_0/ABI34_0_0RCTEventEmitter.h>

NS_ASSUME_NONNULL_BEGIN

@protocol ABI34_0_0RCTWebSocketContentHandler <NSObject>

- (id)processWebsocketMessage:(id __nullable)message
                  forSocketID:(NSNumber *)socketID
                     withType:(NSString *__nonnull __autoreleasing *__nonnull)type;

@end

@interface ABI34_0_0RCTWebSocketModule : ABI34_0_0RCTEventEmitter

// Register a custom handler for a specific websocket. The handler will be strongly held by the WebSocketModule.
- (void)setContentHandler:(id<ABI34_0_0RCTWebSocketContentHandler> __nullable)handler forSocketID:(NSNumber *)socketID;

- (void)sendData:(NSData *)data forSocketID:(nonnull NSNumber *)socketID;

@end

@interface ABI34_0_0RCTBridge (ABI34_0_0RCTWebSocketModule)

- (ABI34_0_0RCTWebSocketModule *)webSocketModule;

@end

NS_ASSUME_NONNULL_END
