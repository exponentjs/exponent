#import <ABI41_0_0React/ABI41_0_0UIView+React.h>
#import "ABI41_0_0RCTOnPageScrollEvent.h"

@implementation ABI41_0_0RCTOnPageScrollEvent
{
    NSNumber* _position;
    NSNumber* _offset;
}

@synthesize viewTag = _viewTag;

- (NSString *)eventName {
    return @"onPageScroll";
}

- (instancetype) initWithABI41_0_0ReactTag:(NSNumber *)ABI41_0_0ReactTag
                         position:(NSNumber *)position
                           offset:(NSNumber *)offset;
{
    ABI41_0_0RCTAssertParam(ABI41_0_0ReactTag);
    
    if ((self = [super init])) {
        _viewTag = ABI41_0_0ReactTag;
        _position = position;
        _offset = offset;
    }
    return self;
}

ABI41_0_0RCT_NOT_IMPLEMENTED(- (instancetype)init)
- (uint16_t)coalescingKey
{
    return 0;
}


- (BOOL)canCoalesce
{
    return YES;
}

+ (NSString *)moduleDotMethod
{
    return @"ABI41_0_0RCTEventEmitter.receiveEvent";
}

- (NSArray *)arguments
{
    return @[self.viewTag, ABI41_0_0RCTNormalizeInputEventName(self.eventName), @{
                 @"position": _position,
                 @"offset": _offset
                 }];
}

- (id<ABI41_0_0RCTEvent>)coalesceWithEvent:(id<ABI41_0_0RCTEvent>)newEvent;
{
    return newEvent;
}

@end
