// Copyright 2018-present 650 Industries. All rights reserved.

#import <EXNotifications/EXNotificationSchedulerModule.h>
#import <EXNotifications/EXNotificationSerializer.h>
#import <EXNotifications/EXNotificationBuilder.h>
#import <EXNotifications/NSDictionary+EXNotificationsVerifyingClass.h>

#import <UserNotifications/UserNotifications.h>

static NSString * const notificationTriggerTypeKey = @"type";
static NSString * const notificationTriggerRepeatsKey = @"repeats";

static NSString * const intervalNotificationTriggerType = @"timeInterval";
static NSString * const intervalNotificationTriggerIntervalKey = @"seconds";

static NSString * const dailyNotificationTriggerType = @"daily";
static NSString * const dailyNotificationTriggerHourKey = @"hour";
static NSString * const dailyNotificationTriggerMinuteKey = @"minute";

static NSString * const dateNotificationTriggerType = @"date";
static NSString * const dateNotificationTriggerTimestampKey = @"timestamp";

static NSString * const calendarNotificationTriggerType = @"calendar";
static NSString * const calendarNotificationTriggerComponentsKey = @"value";
static NSString * const calendarNotificationTriggerTimezoneKey = @"timezone";



@interface EXNotificationSchedulerModule ()

@property (nonatomic, weak) id<EXNotificationBuilder> builder;

@end

@implementation EXNotificationSchedulerModule

UM_EXPORT_MODULE(ExpoNotificationScheduler);

- (void)setModuleRegistry:(UMModuleRegistry *)moduleRegistry
{
  _builder = [moduleRegistry getModuleImplementingProtocol:@protocol(EXNotificationBuilder)];
}

# pragma mark - Exported methods

UM_EXPORT_METHOD_AS(getAllScheduledNotificationsAsync,
                    getAllScheduledNotifications:(UMPromiseResolveBlock)resolve reject:(UMPromiseRejectBlock)reject
                    )
{
  [[UNUserNotificationCenter currentNotificationCenter] getPendingNotificationRequestsWithCompletionHandler:^(NSArray<UNNotificationRequest *> * _Nonnull requests) {
    resolve([self serializeNotificationRequests:requests]);
  }];
}

UM_EXPORT_METHOD_AS(scheduleNotificationAsync,
                     scheduleNotification:(NSString *)identifier notificationSpec:(NSDictionary *)notificationSpec triggerSpec:(NSDictionary *)triggerSpec resolve:(UMPromiseResolveBlock)resolve rejecting:(UMPromiseRejectBlock)reject)
{
  @try {
    UNNotificationContent *content = [_builder notificationContentFromRequest:notificationSpec];
    UNNotificationRequest *request = [UNNotificationRequest requestWithIdentifier:identifier content:content trigger:[self triggerFromParams:triggerSpec]];
    [[UNUserNotificationCenter currentNotificationCenter] addNotificationRequest:request withCompletionHandler:^(NSError * _Nullable error) {
      if (error) {
        NSString *message = [NSString stringWithFormat:@"Failed to schedule notification. %@", error];
        reject(@"ERR_NOTIFICATIONS_FAILED_TO_SCHEDULE", message, error);
      } else {
        resolve(identifier);
      }
    }];
  } @catch (NSException *exception) {
    NSString *message = [NSString stringWithFormat:@"Failed to schedule notification. %@", exception];
    reject(@"ERR_NOTIFICATIONS_FAILED_TO_SCHEDULE", message, nil);
  }
}

UM_EXPORT_METHOD_AS(cancelScheduledNotificationAsync,
                     cancelNotification:(NSString *)identifier resolve:(UMPromiseResolveBlock)resolve rejecting:(UMPromiseRejectBlock)reject)
{
  [self cancelScheduledNotificationAsync:identifier resolve:resolve rejecting:reject];
}

UM_EXPORT_METHOD_AS(cancelAllScheduledNotificationsAsync,
                     cancelAllNotificationsWithResolver:(UMPromiseResolveBlock)resolve rejecting:(UMPromiseRejectBlock)reject)
{
  [self cancelAllScheduledNotificationsAsync:resolve rejecting:reject];
}

-(NSArray * _Nonnull)serializeNotificationRequests:(NSArray<UNNotificationRequest *> * _Nonnull) requests
{
  NSMutableArray *serializedRequests = [NSMutableArray new];
  for (UNNotificationRequest *request in requests) {
    [serializedRequests addObject:[EXNotificationSerializer serializedNotificationRequest:request]];
  }
  return serializedRequests;
}

-(void)cancelScheduledNotificationAsync:(NSString * _Nonnull)identifier resolve:(UMPromiseResolveBlock _Nonnull)resolve rejecting:(UMPromiseRejectBlock _Nonnull)reject
{
  [[UNUserNotificationCenter currentNotificationCenter] removePendingNotificationRequestsWithIdentifiers:@[identifier]];
  resolve(nil);
}

-(void)cancelAllScheduledNotificationsAsync:(UMPromiseResolveBlock _Nonnull)resolve rejecting:(UMPromiseRejectBlock _Nonnull)reject
{
  [[UNUserNotificationCenter currentNotificationCenter] removeAllPendingNotificationRequests];
  resolve(nil);
}

- (UNNotificationTrigger *)triggerFromParams:(NSDictionary *)params
{
  if (!params) {
    // nil trigger is a valid trigger
    return nil;
  }
  if (![params isKindOfClass:[NSDictionary class]]) {
    NSString *reason = [NSString stringWithFormat:@"Unknown notification trigger declaration passed in, expected a dictionary, received %@.", NSStringFromClass(params.class)];
    @throw [NSException exceptionWithName:NSInvalidArgumentException reason:reason userInfo:nil];
  }
  NSString *triggerType = params[notificationTriggerTypeKey];
  if ([intervalNotificationTriggerType isEqualToString:triggerType]) {
    NSNumber *interval = [params objectForKey:intervalNotificationTriggerIntervalKey verifyingClass:[NSNumber class]];
    NSNumber *repeats = [params objectForKey:notificationTriggerRepeatsKey verifyingClass:[NSNumber class]];

    return [UNTimeIntervalNotificationTrigger triggerWithTimeInterval:[interval unsignedIntegerValue]
                                                              repeats:[repeats boolValue]];
  } else if ([dateNotificationTriggerType isEqualToString:triggerType]) {
    NSNumber *timestampMs = [params objectForKey:dateNotificationTriggerTimestampKey verifyingClass:[NSNumber class]];
    NSUInteger timestamp = [timestampMs unsignedIntegerValue] / 1000;
    NSDate *date = [NSDate dateWithTimeIntervalSince1970:timestamp];

    return [UNTimeIntervalNotificationTrigger triggerWithTimeInterval:[date timeIntervalSinceNow]
                                                              repeats:NO];

  } else if ([dailyNotificationTriggerType isEqualToString:triggerType]) {
    NSNumber *hour = [params objectForKey:dailyNotificationTriggerHourKey verifyingClass:[NSNumber class]];
    NSNumber *minute = [params objectForKey:dailyNotificationTriggerMinuteKey verifyingClass:[NSNumber class]];
    NSDateComponents *dateComponents = [NSDateComponents new];
    dateComponents.hour = [hour integerValue];
    dateComponents.minute = [minute integerValue];

    return [UNCalendarNotificationTrigger triggerWithDateMatchingComponents:dateComponents
                                                                    repeats:YES];
  } else if ([calendarNotificationTriggerType isEqualToString:triggerType]) {
    NSDateComponents *dateComponents = [self dateComponentsFromParams:params[calendarNotificationTriggerComponentsKey]];
    NSNumber *repeats = [params objectForKey:notificationTriggerRepeatsKey verifyingClass:[NSNumber class]];

    return [UNCalendarNotificationTrigger triggerWithDateMatchingComponents:dateComponents
                                                                    repeats:[repeats boolValue]];
  } else {
    NSString *reason = [NSString stringWithFormat:@"Unknown notification trigger type: %@.", triggerType];
    @throw [NSException exceptionWithName:NSInvalidArgumentException reason:reason userInfo:nil];
  }
}

- (NSDateComponents *)dateComponentsFromParams:(NSDictionary<NSString *, id> *)params
{
  NSDateComponents *dateComponents = [NSDateComponents new];

  // TODO: Verify that DoW matches JS getDay()
  dateComponents.calendar = [NSCalendar calendarWithIdentifier:NSCalendarIdentifierISO8601];

  if ([params objectForKey:calendarNotificationTriggerTimezoneKey verifyingClass:[NSString class]]) {
    dateComponents.timeZone = [[NSTimeZone alloc] initWithName:params[calendarNotificationTriggerTimezoneKey]];
  }

  for (NSString *key in [self automatchedDateComponentsKeys]) {
    if (params[key]) {
      NSNumber *value = [params objectForKey:key verifyingClass:[NSNumber class]];
      [dateComponents setValue:[value unsignedIntegerValue] forComponent:[self calendarUnitFor:key]];
    }
  }

  return dateComponents;
}

- (NSDictionary<NSString *, NSNumber *> *)dateComponentsMatchMap
{
  static NSDictionary *map;
  if (!map) {
    map = @{
      @"year": @(NSCalendarUnitYear),
      @"month": @(NSCalendarUnitMonth),
      @"day": @(NSCalendarUnitDay),
      @"hour": @(NSCalendarUnitHour),
      @"minute": @(NSCalendarUnitMinute),
      @"second": @(NSCalendarUnitSecond),
      @"weekday": @(NSCalendarUnitWeekday),
      @"weekOfMonth": @(NSCalendarUnitWeekOfMonth),
      @"weekOfYear": @(NSCalendarUnitWeekOfYear),
      @"weekdayOrdinal": @(NSCalendarUnitWeekdayOrdinal)
    };
  }
  return map;
}

- (NSArray<NSString *> *)automatchedDateComponentsKeys
{
  return [[self dateComponentsMatchMap] allKeys];
}

- (NSCalendarUnit)calendarUnitFor:(NSString *)key
{
  return [[self dateComponentsMatchMap][key] unsignedIntegerValue];
}

@end
