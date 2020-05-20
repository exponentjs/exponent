// Copyright 2018-present 650 Industries. All rights reserved.

#import "EXScopedNotificationPresentationModule.h"
#import "EXScopedNotificationsUtils.h"

#import <EXNotifications/EXNotificationSerializer.h>

@interface EXScopedNotificationPresentationModule ()

@property (nonatomic, strong) NSString *experienceId;

@end

@implementation EXScopedNotificationPresentationModule

- (instancetype)initWithExperienceId:(NSString *)experienceId
{
  if (self = [super init]) {
    _experienceId = experienceId;
  }
  
  return self;
}

- (NSArray * _Nonnull)serializeNotifications:(NSArray<UNNotification *> * _Nonnull)notifications
{
  NSMutableArray *serializedNotifications = [NSMutableArray new];
  for (UNNotification *notification in notifications) {
    if ([EXScopedNotificationsUtils shouldNotification:notification beHandledByExperience:_experienceId]) {
      [serializedNotifications addObject:[EXNotificationSerializer serializedNotification:notification]];
    }
  }
  return serializedNotifications;
}

- (void)dismissNotificationWithIdentifier:(NSString *)identifier resolve:(UMPromiseResolveBlock)resolve reject:(UMPromiseRejectBlock)reject
{
  UM_WEAKIFY(self)
  [[UNUserNotificationCenter currentNotificationCenter] getDeliveredNotificationsWithCompletionHandler:^(NSArray<UNNotification *> * _Nonnull notifications) {
    UM_ENSURE_STRONGIFY(self)
    for (UNNotification *notification in notifications) {
      if ([notification.request.identifier isEqual:identifier]) {
        if ([EXScopedNotificationsUtils shouldNotification:notification beHandledByExperience:self.experienceId]) {
          [[UNUserNotificationCenter currentNotificationCenter] removeDeliveredNotificationsWithIdentifiers:@[identifier]];
        }
        break;
      }
    }
    resolve(nil);
  }];
}

- (void)dismissAllNotificationsWithResolver:(UMPromiseResolveBlock)resolve reject:(UMPromiseRejectBlock)reject
{
  UM_WEAKIFY(self)
  [[UNUserNotificationCenter currentNotificationCenter] getDeliveredNotificationsWithCompletionHandler:^(NSArray<UNNotification *> * _Nonnull notifications) {
    UM_ENSURE_STRONGIFY(self)
    NSMutableArray<NSString *> *toDismiss = [NSMutableArray new];
    for (UNNotification *notification in notifications) {
      if ([EXScopedNotificationsUtils shouldNotification:notification beHandledByExperience:self.experienceId]) {
        [toDismiss addObject:notification.request.identifier];
      }
    }
    [[UNUserNotificationCenter currentNotificationCenter] removeDeliveredNotificationsWithIdentifiers:toDismiss];
    resolve(nil);
  }];
}

@end
