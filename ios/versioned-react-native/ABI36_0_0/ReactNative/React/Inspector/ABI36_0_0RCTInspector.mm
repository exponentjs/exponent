// Copyright (c) Facebook, Inc. and its affiliates.
//
// This source code is licensed under the MIT license found in the
// LICENSE file in the root directory of this source tree.

#import <ABI36_0_0React/ABI36_0_0RCTInspector.h>

#if ABI36_0_0RCT_DEV && !TARGET_OS_UIKITFORMAC

#include <ABI36_0_0jsinspector/ABI36_0_0InspectorInterfaces.h>

#import <ABI36_0_0React/ABI36_0_0RCTDefines.h>
#import <ABI36_0_0React/ABI36_0_0RCTInspectorPackagerConnection.h>
#import <ABI36_0_0React/ABI36_0_0RCTLog.h>
#import <ABI36_0_0React/ABI36_0_0RCTSRWebSocket.h>
#import <ABI36_0_0React/ABI36_0_0RCTUtils.h>

using namespace ABI36_0_0facebook::ABI36_0_0React;

// This is a port of the Android impl, at
// ABI36_0_0React-native-github/ABI36_0_0ReactAndroid/src/main/java/com/facebook/ABI36_0_0React/bridge/Inspector.java
// ABI36_0_0React-native-github/ABI36_0_0ReactAndroid/src/main/jni/ABI36_0_0React/jni/JInspector.cpp
// please keep consistent :)

class RemoteConnection : public IRemoteConnection {
public:
RemoteConnection(ABI36_0_0RCTInspectorRemoteConnection *connection) :
  _connection(connection) {}

  virtual void onMessage(std::string message) override {
    [_connection onMessage:@(message.c_str())];
  }

  virtual void onDisconnect() override {
    [_connection onDisconnect];
  }
private:
  const ABI36_0_0RCTInspectorRemoteConnection *_connection;
};

@interface ABI36_0_0RCTInspectorPage () {
  NSInteger _id;
  NSString *_title;
  NSString *_vm;
}
- (instancetype)initWithId:(NSInteger)id
                     title:(NSString *)title
                     vm:(NSString *)vm;
@end

@interface ABI36_0_0RCTInspectorLocalConnection () {
  std::unique_ptr<ILocalConnection> _connection;
}
- (instancetype)initWithConnection:(std::unique_ptr<ILocalConnection>)connection;
@end

static IInspector *getInstance()
{
  return &ABI36_0_0facebook::ABI36_0_0React::getInspectorInstance();
}

@implementation ABI36_0_0RCTInspector

ABI36_0_0RCT_NOT_IMPLEMENTED(- (instancetype)init)

+ (NSArray<ABI36_0_0RCTInspectorPage *> *)pages
{
  std::vector<InspectorPage> pages = getInstance()->getPages();
  NSMutableArray<ABI36_0_0RCTInspectorPage *> *array = [NSMutableArray arrayWithCapacity:pages.size()];
  for (size_t i = 0; i < pages.size(); i++) {
    ABI36_0_0RCTInspectorPage *pageWrapper = [[ABI36_0_0RCTInspectorPage alloc] initWithId:pages[i].id
                                                                   title:@(pages[i].title.c_str())
                                                                   vm:@(pages[i].vm.c_str())];
    [array addObject:pageWrapper];

  }
  return array;
}

+ (ABI36_0_0RCTInspectorLocalConnection *)connectPage:(NSInteger)pageId
                         forRemoteConnection:(ABI36_0_0RCTInspectorRemoteConnection *)remote
{
  auto localConnection = getInstance()->connect((int)pageId, std::make_unique<RemoteConnection>(remote));
  return [[ABI36_0_0RCTInspectorLocalConnection alloc] initWithConnection:std::move(localConnection)];
}

@end

@implementation ABI36_0_0RCTInspectorPage

ABI36_0_0RCT_NOT_IMPLEMENTED(- (instancetype)init)

- (instancetype)initWithId:(NSInteger)id
                     title:(NSString *)title
                        vm:(NSString *)vm
{
  if (self = [super init]) {
    _id = id;
    _title = title;
    _vm = vm;
  }
  return self;
}

@end

@implementation ABI36_0_0RCTInspectorLocalConnection

ABI36_0_0RCT_NOT_IMPLEMENTED(- (instancetype)init)

- (instancetype)initWithConnection:(std::unique_ptr<ILocalConnection>)connection
{
  if (self = [super init]) {
    _connection = std::move(connection);
  }
  return self;
}

- (void)sendMessage:(NSString *)message
{
  _connection->sendMessage([message UTF8String]);
}

- (void)disconnect
{
  _connection->disconnect();
}

@end

#endif
