//  Copyright (c) 2020 650 Industries, Inc. All rights reserved.

#import <XCTest/XCTest.h>

#import <EXUpdates/EXUpdatesConfig.h>
#import <EXUpdates/EXUpdatesDatabase.h>
#import <EXUpdates/EXUpdatesFileDownloader.h>
#import <EXUpdates/EXUpdatesUpdate.h>

@interface EXUpdatesFileDownloaderTest : XCTestCase

@property (nonatomic, strong) EXUpdatesDatabase *database;

@property (nonatomic, strong) EXUpdatesConfig *basicConfig;
@property (nonatomic, strong) EXUpdatesFileDownloader *basicDownloader;

@end

@implementation EXUpdatesFileDownloaderTest

- (void)setUp
{
  _database = [EXUpdatesDatabase new];

  _basicConfig = [EXUpdatesConfig configWithDictionary:@{
    @"EXUpdatesURL": @"https://exp.host/@test/test",
    @"EXUpdatesRuntimeVersion": @"1.0"
  }];
  _basicDownloader = [[EXUpdatesFileDownloader alloc] initWithUpdatesConfig:_basicConfig];
}

- (void)tearDown
{
  [super tearDown];
}

- (void)testSetManifestHTTPHeaderFields_LaunchedUpdate
{
  NSUUID *uuid = [NSUUID UUID];
  EXUpdatesUpdate *update = [EXUpdatesUpdate updateWithId:uuid scopeKey:@"scopeKey" commitTime:[NSDate date] runtimeVersion:@"1.0" metadata:nil status:EXUpdatesUpdateStatusReady keep:YES config:_basicConfig database:_database];

  NSMutableURLRequest *request = [NSMutableURLRequest requestWithURL:[NSURL URLWithString:@"https://test.test"]];
  [_basicDownloader setManifestHTTPHeaderFields:request withLaunchedUpdate:update];

  XCTAssertEqualObjects(uuid.UUIDString, [request valueForHTTPHeaderField:@"expo-current-update-id"]);
}

- (void)testSetManifestHTTPHeaderFields_NoLaunchedUpdate
{
  NSMutableURLRequest *request = [NSMutableURLRequest requestWithURL:[NSURL URLWithString:@"https://test.test"]];
  [_basicDownloader setManifestHTTPHeaderFields:request withLaunchedUpdate:nil];

  XCTAssertNil([request valueForHTTPHeaderField:@"expo-current-update-id"]);
}

@end
