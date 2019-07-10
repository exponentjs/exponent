/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

#import <Foundation/Foundation.h>

#import <ReactABI34_0_0/ABI34_0_0RCTDefines.h>

/*
 * Defined in ABI34_0_0RCTUtils.m
 */
ABI34_0_0RCT_EXTERN BOOL ABI34_0_0RCTIsMainQueue(void);

/**
 * This is the main assert macro that you should use. Asserts should be compiled out
 * in production builds. You can customize the assert behaviour by setting a custom
 * assert handler through `ABI34_0_0RCTSetAssertFunction`.
 */
#ifndef NS_BLOCK_ASSERTIONS
#define ABI34_0_0RCTAssert(condition, ...) do { \
  if ((condition) == 0) { \
    _ABI34_0_0RCTAssertFormat(#condition, __FILE__, __LINE__, __func__, __VA_ARGS__); \
    if (ABI34_0_0RCT_NSASSERT) { \
      [[NSAssertionHandler currentHandler] handleFailureInFunction:(NSString * _Nonnull)@(__func__) \
        file:(NSString * _Nonnull)@(__FILE__) lineNumber:__LINE__ description:__VA_ARGS__]; \
    } \
  } \
} while (false)
#else
#define ABI34_0_0RCTAssert(condition, ...) do {} while (false)
#endif
ABI34_0_0RCT_EXTERN void _ABI34_0_0RCTAssertFormat(
  const char *, const char *, int, const char *, NSString *, ...
) NS_FORMAT_FUNCTION(5,6);

/**
 * Report a fatal condition when executing. These calls will _NOT_ be compiled out
 * in production, and crash the app by default. You can customize the fatal behaviour
 * by setting a custom fatal handler through `ABI34_0_0RCTSetFatalHandler`.
 */
ABI34_0_0RCT_EXTERN void ABI34_0_0RCTFatal(NSError *error);

/**
 * The default error domain to be used for ReactABI34_0_0 errors.
 */
ABI34_0_0RCT_EXTERN NSString *const ABI34_0_0RCTErrorDomain;

/**
 * JS Stack trace provided as part of an NSError's userInfo
 */
ABI34_0_0RCT_EXTERN NSString *const ABI34_0_0RCTJSStackTraceKey;

/**
 * Raw JS Stack trace string provided as part of an NSError's userInfo
 */
ABI34_0_0RCT_EXTERN NSString *const ABI34_0_0RCTJSRawStackTraceKey;

/**
 * Name of fatal exceptions generated by ABI34_0_0RCTFatal
 */
ABI34_0_0RCT_EXTERN NSString *const ABI34_0_0RCTFatalExceptionName;

/**
 * A block signature to be used for custom assertion handling.
 */
typedef void (^ABI34_0_0RCTAssertFunction)(NSString *condition,
                                  NSString *fileName,
                                  NSNumber *lineNumber,
                                  NSString *function,
                                  NSString *message);

typedef void (^ABI34_0_0RCTFatalHandler)(NSError *error);

/**
 * Convenience macro for asserting that a parameter is non-nil/non-zero.
 */
#define ABI34_0_0RCTAssertParam(name) ABI34_0_0RCTAssert(name, @"'%s' is a required parameter", #name)

/**
 * Convenience macro for asserting that we're running on main queue.
 */
#define ABI34_0_0RCTAssertMainQueue() ABI34_0_0RCTAssert(ABI34_0_0RCTIsMainQueue(), \
  @"This function must be called on the main queue")

/**
 * Convenience macro for asserting that we're running off the main queue.
 */
#define ABI34_0_0RCTAssertNotMainQueue() ABI34_0_0RCTAssert(!ABI34_0_0RCTIsMainQueue(), \
@"This function must not be called on the main queue")

/**
 * These methods get and set the current assert function called by the ABI34_0_0RCTAssert
 * macros. You can use these to replace the standard behavior with custom assert
 * functionality.
 */
ABI34_0_0RCT_EXTERN void ABI34_0_0RCTSetAssertFunction(ABI34_0_0RCTAssertFunction assertFunction);
ABI34_0_0RCT_EXTERN ABI34_0_0RCTAssertFunction ABI34_0_0RCTGetAssertFunction(void);

/**
 * This appends additional code to the existing assert function, without
 * replacing the existing functionality. Useful if you just want to forward
 * assert info to an extra service without changing the default behavior.
 */
ABI34_0_0RCT_EXTERN void ABI34_0_0RCTAddAssertFunction(ABI34_0_0RCTAssertFunction assertFunction);

/**
 * This method temporarily overrides the assert function while performing the
 * specified block. This is useful for testing purposes (to detect if a given
 * function asserts something) or to suppress or override assertions temporarily.
 */
ABI34_0_0RCT_EXTERN void ABI34_0_0RCTPerformBlockWithAssertFunction(void (^block)(void), ABI34_0_0RCTAssertFunction assertFunction);

/**
 These methods get and set the current fatal handler called by the ABI34_0_0RCTFatal method.
 */
ABI34_0_0RCT_EXTERN void ABI34_0_0RCTSetFatalHandler(ABI34_0_0RCTFatalHandler fatalHandler);
ABI34_0_0RCT_EXTERN ABI34_0_0RCTFatalHandler ABI34_0_0RCTGetFatalHandler(void);

/**
 * Get the current thread's name (or the current queue, if in debug mode)
 */
ABI34_0_0RCT_EXTERN NSString *ABI34_0_0RCTCurrentThreadName(void);

/**
 * Helper to get generate exception message from NSError
 */
ABI34_0_0RCT_EXTERN NSString *ABI34_0_0RCTFormatError(NSString *message, NSArray<NSDictionary<NSString *, id> *> *stacktrace, NSUInteger maxMessageLength);

/**
 * Convenience macro to assert which thread is currently running (DEBUG mode only)
 */
#if DEBUG

#define ABI34_0_0RCTAssertThread(thread, format...) \
_Pragma("clang diagnostic push") \
_Pragma("clang diagnostic ignored \"-Wdeprecated-declarations\"") \
ABI34_0_0RCTAssert( \
  [(id)thread isKindOfClass:[NSString class]] ? \
    [ABI34_0_0RCTCurrentThreadName() isEqualToString:(NSString *)thread] : \
    [(id)thread isKindOfClass:[NSThread class]] ? \
      [NSThread currentThread] ==  (NSThread *)thread : \
      dispatch_get_current_queue() == (dispatch_queue_t)thread, \
  format); \
_Pragma("clang diagnostic pop")

#else

#define ABI34_0_0RCTAssertThread(thread, format...) do { } while (0)

#endif
