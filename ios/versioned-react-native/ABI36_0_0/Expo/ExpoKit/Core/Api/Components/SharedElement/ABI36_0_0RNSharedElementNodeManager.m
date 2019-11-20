//
//  ABI36_0_0RCTMagicMoveCloneDataManager.m
//  ABI36_0_0React-native-shared-element
//

#import <UIKit/UIKit.h>
#import "ABI36_0_0RNSharedElementNodeManager.h"

@implementation ABI36_0_0RNSharedElementNodeManager
{
  NSMutableDictionary* _items;
}

- (instancetype)init
{
  _items = [[NSMutableDictionary alloc]init];
  return self;
}

- (ABI36_0_0RNSharedElementNode*) acquire:(NSNumber*) ABI36_0_0ReactTag view:(UIView*)view isParent:(BOOL)isParent
{
  @synchronized(_items)
  {
    ABI36_0_0RNSharedElementNode* node = [_items objectForKey:ABI36_0_0ReactTag];
    if (node != nil) {
      node.refCount = node.refCount + 1;
      return node;
    }
      node = [[ABI36_0_0RNSharedElementNode alloc]init:ABI36_0_0ReactTag view:view isParent:isParent];
    [_items setObject:node forKey:ABI36_0_0ReactTag];
    return node;
  }
}

- (long) release:(ABI36_0_0RNSharedElementNode*) node
{
  @synchronized(_items)
  {
    node.refCount = node.refCount - 1;
    if (node.refCount == 0) {
      ABI36_0_0RNSharedElementNode* dictItem = [_items objectForKey:node.ABI36_0_0ReactTag];
      if (dictItem == node) {
        [_items removeObjectForKey:node.ABI36_0_0ReactTag];
      }
    }
    return node.refCount;
  }
}

@end
