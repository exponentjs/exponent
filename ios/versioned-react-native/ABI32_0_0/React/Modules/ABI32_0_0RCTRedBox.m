/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

#import "ABI32_0_0RCTRedBox.h"

#import "ABI32_0_0RCTBridge.h"
#import "ABI32_0_0RCTConvert.h"
#import "ABI32_0_0RCTDefines.h"
#import "ABI32_0_0RCTErrorInfo.h"
#import "ABI32_0_0RCTEventDispatcher.h"
#import "ABI32_0_0RCTJSStackFrame.h"
#import "ABI32_0_0RCTRedBoxExtraDataViewController.h"
#import "ABI32_0_0RCTUtils.h"

#if ABI32_0_0RCT_DEBUG

@class ABI32_0_0RCTRedBoxWindow;

@protocol ABI32_0_0RCTRedBoxWindowActionDelegate <NSObject>

- (void)redBoxWindow:(ABI32_0_0RCTRedBoxWindow *)redBoxWindow openStackFrameInEditor:(ABI32_0_0RCTJSStackFrame *)stackFrame;
- (void)reloadFromRedBoxWindow:(ABI32_0_0RCTRedBoxWindow *)redBoxWindow;
- (void)loadExtraDataViewController;

@end

@interface ABI32_0_0RCTRedBoxWindow : UIWindow <UITableViewDelegate, UITableViewDataSource>
@property (nonatomic, weak) id<ABI32_0_0RCTRedBoxWindowActionDelegate> actionDelegate;
@end

@implementation ABI32_0_0RCTRedBoxWindow
{
    UITableView *_stackTraceTableView;
    NSString *_lastErrorMessage;
    NSArray<ABI32_0_0RCTJSStackFrame *> *_lastStackTrace;
}

- (instancetype)initWithFrame:(CGRect)frame
{
    if ((self = [super initWithFrame:frame])) {
#if TARGET_OS_TV
        self.windowLevel = UIWindowLevelAlert + 1000;
#else
        self.windowLevel = UIWindowLevelStatusBar - 1;
#endif
        self.backgroundColor = [UIColor colorWithRed:0.8 green:0 blue:0 alpha:1];
        self.hidden = YES;

        UIViewController *rootController = [UIViewController new];
        self.rootViewController = rootController;
        UIView *rootView = rootController.view;
        rootView.backgroundColor = [UIColor clearColor];

        const CGFloat buttonHeight = 60;

        CGRect detailsFrame = rootView.bounds;
        detailsFrame.size.height -= buttonHeight;

        _stackTraceTableView = [[UITableView alloc] initWithFrame:detailsFrame style:UITableViewStylePlain];
        _stackTraceTableView.autoresizingMask = UIViewAutoresizingFlexibleWidth | UIViewAutoresizingFlexibleHeight;
        _stackTraceTableView.delegate = self;
        _stackTraceTableView.dataSource = self;
        _stackTraceTableView.backgroundColor = [UIColor clearColor];
#if !TARGET_OS_TV
        _stackTraceTableView.separatorColor = [UIColor colorWithWhite:1 alpha:0.3];
        _stackTraceTableView.separatorStyle = UITableViewCellSeparatorStyleNone;
#endif
        _stackTraceTableView.indicatorStyle = UIScrollViewIndicatorStyleWhite;
        [rootView addSubview:_stackTraceTableView];

#if TARGET_OS_SIMULATOR
        NSString *reloadText = @"Reload JS (\u2318R)";
        NSString *dismissText = @"Dismiss (ESC)";
        NSString *copyText = @"Copy (\u2325\u2318C)";
        NSString *extraText = @"Extra Info (\u2318E)";
#else
        NSString *reloadText = @"Reload JS";
        NSString *dismissText = @"Dismiss";
        NSString *copyText = @"Copy";
        NSString *extraText = @"Extra Info";
#endif

        UIButton *dismissButton = [UIButton buttonWithType:UIButtonTypeCustom];
        dismissButton.autoresizingMask = UIViewAutoresizingFlexibleWidth | UIViewAutoresizingFlexibleTopMargin | UIViewAutoresizingFlexibleRightMargin;
        dismissButton.accessibilityIdentifier = @"redbox-dismiss";
        dismissButton.titleLabel.font = [UIFont systemFontOfSize:13];
        [dismissButton setTitle:dismissText forState:UIControlStateNormal];
        [dismissButton setTitleColor:[UIColor colorWithWhite:1 alpha:0.5] forState:UIControlStateNormal];
        [dismissButton setTitleColor:[UIColor whiteColor] forState:UIControlStateHighlighted];
        [dismissButton addTarget:self action:@selector(dismiss) forControlEvents:UIControlEventTouchUpInside];

        UIButton *reloadButton = [UIButton buttonWithType:UIButtonTypeCustom];
        reloadButton.autoresizingMask = UIViewAutoresizingFlexibleWidth | UIViewAutoresizingFlexibleTopMargin | UIViewAutoresizingFlexibleLeftMargin;
        reloadButton.accessibilityIdentifier = @"redbox-reload";
        reloadButton.titleLabel.font = [UIFont systemFontOfSize:13];

        [reloadButton setTitle:reloadText forState:UIControlStateNormal];
        [reloadButton setTitleColor:[UIColor colorWithWhite:1 alpha:0.5] forState:UIControlStateNormal];
        [reloadButton setTitleColor:[UIColor whiteColor] forState:UIControlStateHighlighted];
        [reloadButton addTarget:self action:@selector(reload) forControlEvents:UIControlEventTouchUpInside];

        UIButton *copyButton = [UIButton buttonWithType:UIButtonTypeCustom];
        copyButton.autoresizingMask = UIViewAutoresizingFlexibleWidth | UIViewAutoresizingFlexibleTopMargin | UIViewAutoresizingFlexibleLeftMargin;
        copyButton.accessibilityIdentifier = @"redbox-copy";
        copyButton.titleLabel.font = [UIFont systemFontOfSize:13];
        [copyButton setTitle:copyText forState:UIControlStateNormal];
        [copyButton setTitleColor:[UIColor colorWithWhite:1 alpha:0.5] forState:UIControlStateNormal];
        [copyButton setTitleColor:[UIColor whiteColor] forState:UIControlStateHighlighted];
        [copyButton addTarget:self action:@selector(copyStack) forControlEvents:UIControlEventTouchUpInside];

        UIButton *extraButton = [UIButton buttonWithType:UIButtonTypeCustom];
        extraButton.autoresizingMask = UIViewAutoresizingFlexibleWidth | UIViewAutoresizingFlexibleTopMargin | UIViewAutoresizingFlexibleLeftMargin;
        extraButton.accessibilityIdentifier = @"redbox-extra";
        extraButton.titleLabel.font = [UIFont systemFontOfSize:13];
        [extraButton setTitle:extraText forState:UIControlStateNormal];
        [extraButton setTitleColor:[UIColor colorWithWhite:1 alpha:0.5] forState:UIControlStateNormal];
        [extraButton setTitleColor:[UIColor whiteColor] forState:UIControlStateHighlighted];
        [extraButton addTarget:self action:@selector(showExtraDataViewController) forControlEvents:UIControlEventTouchUpInside];

        CGFloat buttonWidth = self.bounds.size.width / 4;
        dismissButton.frame = CGRectMake(0, self.bounds.size.height - buttonHeight, buttonWidth, buttonHeight);
        reloadButton.frame = CGRectMake(buttonWidth, self.bounds.size.height - buttonHeight, buttonWidth, buttonHeight);
        copyButton.frame = CGRectMake(buttonWidth * 2, self.bounds.size.height - buttonHeight, buttonWidth, buttonHeight);
        extraButton.frame = CGRectMake(buttonWidth * 3, self.bounds.size.height - buttonHeight, buttonWidth, buttonHeight);

        [rootView addSubview:dismissButton];
        [rootView addSubview:reloadButton];
        [rootView addSubview:copyButton];
        [rootView addSubview:extraButton];
    }
    return self;
}

ABI32_0_0RCT_NOT_IMPLEMENTED(- (instancetype)initWithCoder:(NSCoder *)aDecoder)

- (void)dealloc
{
    _stackTraceTableView.dataSource = nil;
    _stackTraceTableView.delegate = nil;
    [[NSNotificationCenter defaultCenter] removeObserver:self];
}

- (void)showErrorMessage:(NSString *)message withStack:(NSArray<ABI32_0_0RCTJSStackFrame *> *)stack isUpdate:(BOOL)isUpdate
{
    // Show if this is a new message, or if we're updating the previous message
    if ((self.hidden && !isUpdate) || (!self.hidden && isUpdate && [_lastErrorMessage isEqualToString:message])) {
        _lastStackTrace = stack;
        // message is displayed using UILabel, which is unable to render text of
        // unlimited length, so we truncate it
        _lastErrorMessage = [message substringToIndex:MIN((NSUInteger)10000, message.length)];

        [_stackTraceTableView reloadData];

        if (self.hidden) {
            [_stackTraceTableView scrollToRowAtIndexPath:[NSIndexPath indexPathForRow:0 inSection:0]
                                        atScrollPosition:UITableViewScrollPositionTop
                                                animated:NO];
        }

        [self makeKeyAndVisible];
        [self becomeFirstResponder];
    }
}

- (void)dismiss
{
    self.hidden = YES;
    [self resignFirstResponder];
    [ABI32_0_0RCTSharedApplication().delegate.window makeKeyWindow];
}

- (void)reload
{
    [_actionDelegate reloadFromRedBoxWindow:self];
}

- (void)showExtraDataViewController
{
    [_actionDelegate loadExtraDataViewController];
}

- (void)copyStack
{
    NSMutableString *fullStackTrace;

    if (_lastErrorMessage != nil) {
        fullStackTrace = [_lastErrorMessage mutableCopy];
        [fullStackTrace appendString:@"\n\n"];
    }
    else {
        fullStackTrace = [NSMutableString string];
    }

    for (ABI32_0_0RCTJSStackFrame *stackFrame in _lastStackTrace) {
        [fullStackTrace appendString:[NSString stringWithFormat:@"%@\n", stackFrame.methodName]];
        if (stackFrame.file) {
            [fullStackTrace appendFormat:@"    %@\n", [self formatFrameSource:stackFrame]];
        }
    }
#if !TARGET_OS_TV
    UIPasteboard *pb = [UIPasteboard generalPasteboard];
    [pb setString:fullStackTrace];
#endif
}

- (NSString *)formatFrameSource:(ABI32_0_0RCTJSStackFrame *)stackFrame
{
    NSString *fileName = ABI32_0_0RCTNilIfNull(stackFrame.file) ? [stackFrame.file lastPathComponent] : @"<unknown file>";
    NSString *lineInfo = [NSString stringWithFormat:@"%@:%lld",
                          fileName,
                          (long long)stackFrame.lineNumber];

    if (stackFrame.column != 0) {
        lineInfo = [lineInfo stringByAppendingFormat:@":%lld", (long long)stackFrame.column];
    }
    return lineInfo;
}

#pragma mark - TableView

- (NSInteger)numberOfSectionsInTableView:(__unused UITableView *)tableView
{
    return 2;
}

- (NSInteger)tableView:(__unused UITableView *)tableView numberOfRowsInSection:(NSInteger)section
{
    return section == 0 ? 1 : _lastStackTrace.count;
}

- (UITableViewCell *)tableView:(UITableView *)tableView cellForRowAtIndexPath:(NSIndexPath *)indexPath
{
    if (indexPath.section == 0) {
        UITableViewCell *cell = [tableView dequeueReusableCellWithIdentifier:@"msg-cell"];
        return [self reuseCell:cell forErrorMessage:_lastErrorMessage];
    }
    UITableViewCell *cell = [tableView dequeueReusableCellWithIdentifier:@"cell"];
    NSUInteger index = indexPath.row;
    ABI32_0_0RCTJSStackFrame *stackFrame = _lastStackTrace[index];
    return [self reuseCell:cell forStackFrame:stackFrame];
}

- (UITableViewCell *)reuseCell:(UITableViewCell *)cell forErrorMessage:(NSString *)message
{
    if (!cell) {
        cell = [[UITableViewCell alloc] initWithStyle:UITableViewCellStyleSubtitle reuseIdentifier:@"msg-cell"];
        cell.textLabel.accessibilityIdentifier = @"redbox-error";
        cell.textLabel.textColor = [UIColor whiteColor];
        cell.textLabel.font = [UIFont boldSystemFontOfSize:16];
        cell.textLabel.lineBreakMode = NSLineBreakByWordWrapping;
        cell.textLabel.numberOfLines = 0;
        cell.detailTextLabel.textColor = [UIColor whiteColor];
        cell.backgroundColor = [UIColor clearColor];
        cell.selectionStyle = UITableViewCellSelectionStyleNone;
    }

    cell.textLabel.text = message;

    return cell;
}

- (UITableViewCell *)reuseCell:(UITableViewCell *)cell forStackFrame:(ABI32_0_0RCTJSStackFrame *)stackFrame
{
    if (!cell) {
        cell = [[UITableViewCell alloc] initWithStyle:UITableViewCellStyleSubtitle reuseIdentifier:@"cell"];
        cell.textLabel.textColor = [UIColor colorWithWhite:1 alpha:0.9];
        cell.textLabel.font = [UIFont fontWithName:@"Menlo-Regular" size:14];
        cell.textLabel.lineBreakMode = NSLineBreakByCharWrapping;
        cell.textLabel.numberOfLines = 2;
        cell.detailTextLabel.textColor = [UIColor colorWithWhite:1 alpha:0.7];
        cell.detailTextLabel.font = [UIFont fontWithName:@"Menlo-Regular" size:11];
        cell.detailTextLabel.lineBreakMode = NSLineBreakByTruncatingMiddle;
        cell.backgroundColor = [UIColor clearColor];
        cell.selectedBackgroundView = [UIView new];
        cell.selectedBackgroundView.backgroundColor = [UIColor colorWithWhite:0 alpha:0.2];
    }

    cell.textLabel.text = stackFrame.methodName ?: @"(unnamed method)";
    if (stackFrame.file) {
        cell.detailTextLabel.text = [self formatFrameSource:stackFrame];
    } else {
        cell.detailTextLabel.text = @"";
    }
    return cell;
}

- (CGFloat)tableView:(UITableView *)tableView heightForRowAtIndexPath:(NSIndexPath *)indexPath
{
    if (indexPath.section == 0) {
        NSMutableParagraphStyle *paragraphStyle = [[NSParagraphStyle defaultParagraphStyle] mutableCopy];
        paragraphStyle.lineBreakMode = NSLineBreakByWordWrapping;

        NSDictionary *attributes = @{NSFontAttributeName: [UIFont boldSystemFontOfSize:16],
                                     NSParagraphStyleAttributeName: paragraphStyle};
        CGRect boundingRect = [_lastErrorMessage boundingRectWithSize:CGSizeMake(tableView.frame.size.width - 30, CGFLOAT_MAX) options:NSStringDrawingUsesLineFragmentOrigin attributes:attributes context:nil];
        return ceil(boundingRect.size.height) + 40;
    } else {
        return 50;
    }
}

- (void)tableView:(UITableView *)tableView didSelectRowAtIndexPath:(NSIndexPath *)indexPath
{
    if (indexPath.section == 1) {
        NSUInteger row = indexPath.row;
        ABI32_0_0RCTJSStackFrame *stackFrame = _lastStackTrace[row];
        [_actionDelegate redBoxWindow:self openStackFrameInEditor:stackFrame];
    }
    [tableView deselectRowAtIndexPath:indexPath animated:YES];
}

#pragma mark - Key commands

- (NSArray<UIKeyCommand *> *)keyCommands
{
    // NOTE: We could use ABI32_0_0RCTKeyCommands for this, but since
    // we control this window, we can use the standard, non-hacky
    // mechanism instead

    return @[
             // Dismiss red box
             [UIKeyCommand keyCommandWithInput:UIKeyInputEscape
                                 modifierFlags:0
                                        action:@selector(dismiss)],

             // Reload
             [UIKeyCommand keyCommandWithInput:@"r"
                                 modifierFlags:UIKeyModifierCommand
                                        action:@selector(reload)],

             // Copy = Cmd-Option C since Cmd-C in the simulator copies the pasteboard from
             // the simulator to the desktop pasteboard.
             [UIKeyCommand keyCommandWithInput:@"c"
                                 modifierFlags:UIKeyModifierCommand | UIKeyModifierAlternate
                                        action:@selector(copyStack)],

             // Extra data
             [UIKeyCommand keyCommandWithInput:@"e"
                                 modifierFlags:UIKeyModifierCommand
                                        action:@selector(showExtraDataViewController)]
             ];
}

- (BOOL)canBecomeFirstResponder
{
    return YES;
}

@end

@interface ABI32_0_0RCTRedBox () <ABI32_0_0RCTInvalidating, ABI32_0_0RCTRedBoxWindowActionDelegate, ABI32_0_0RCTRedBoxExtraDataActionDelegate>
@end

@implementation ABI32_0_0RCTRedBox
{
    ABI32_0_0RCTRedBoxWindow *_window;
    NSMutableArray<id<ABI32_0_0RCTErrorCustomizer>> *_errorCustomizers;
    ABI32_0_0RCTRedBoxExtraDataViewController *_extraDataViewController;
}

@synthesize bridge = _bridge;

ABI32_0_0RCT_EXPORT_MODULE()

- (void)registerErrorCustomizer:(id<ABI32_0_0RCTErrorCustomizer>)errorCustomizer
{
    dispatch_async(dispatch_get_main_queue(), ^{
        if (!self->_errorCustomizers) {
            self->_errorCustomizers = [NSMutableArray array];
        }
        if (![self->_errorCustomizers containsObject:errorCustomizer]) {
            [self->_errorCustomizers addObject:errorCustomizer];
        }
    });
}

// WARNING: Should only be called from the main thread/dispatch queue.
- (ABI32_0_0RCTErrorInfo *)_customizeError:(ABI32_0_0RCTErrorInfo *)error
{
    ABI32_0_0RCTAssertMainQueue();
    if (!self->_errorCustomizers) {
        return error;
    }
    for (id<ABI32_0_0RCTErrorCustomizer> customizer in self->_errorCustomizers) {
        ABI32_0_0RCTErrorInfo *newInfo = [customizer customizeErrorInfo:error];
        if (newInfo) {
            error = newInfo;
        }
    }
    return error;
}

- (void)showError:(NSError *)error
{
    [self showErrorMessage:error.localizedDescription
               withDetails:error.localizedFailureReason
                     stack:error.userInfo[ABI32_0_0RCTJSStackTraceKey]];
}

- (void)showErrorMessage:(NSString *)message
{
    [self showErrorMessage:message withParsedStack:nil isUpdate:NO];
}

- (void)showErrorMessage:(NSString *)message withDetails:(NSString *)details
{
    [self showErrorMessage:message withDetails:details stack:nil];
}

- (void)showErrorMessage:(NSString *)message withDetails:(NSString *)details stack:(NSArray<ABI32_0_0RCTJSStackFrame *> *)stack {
    NSString *combinedMessage = message;
    if (details) {
        combinedMessage = [NSString stringWithFormat:@"%@\n\n%@", message, details];
    }
    [self showErrorMessage:combinedMessage withParsedStack:stack isUpdate:NO];
}

- (void)showErrorMessage:(NSString *)message withRawStack:(NSString *)rawStack
{
    NSArray<ABI32_0_0RCTJSStackFrame *> *stack = [ABI32_0_0RCTJSStackFrame stackFramesWithLines:rawStack];
    [self showErrorMessage:message withParsedStack:stack isUpdate:NO];
}

- (void)showErrorMessage:(NSString *)message withStack:(NSArray<NSDictionary *> *)stack
{
    [self showErrorMessage:message withParsedStack:[ABI32_0_0RCTJSStackFrame stackFramesWithDictionaries:stack] isUpdate:NO];
}

- (void)updateErrorMessage:(NSString *)message withStack:(NSArray<NSDictionary *> *)stack
{
    [self showErrorMessage:message withParsedStack:[ABI32_0_0RCTJSStackFrame stackFramesWithDictionaries:stack] isUpdate:YES];
}

- (void)showErrorMessage:(NSString *)message withParsedStack:(NSArray<ABI32_0_0RCTJSStackFrame *> *)stack
{
    [self showErrorMessage:message withParsedStack:stack isUpdate:NO];
}

- (void)updateErrorMessage:(NSString *)message withParsedStack:(NSArray<ABI32_0_0RCTJSStackFrame *> *)stack
{
    [self showErrorMessage:message withParsedStack:stack isUpdate:YES];
}

- (void)showErrorMessage:(NSString *)message withParsedStack:(NSArray<ABI32_0_0RCTJSStackFrame *> *)stack isUpdate:(BOOL)isUpdate
{
    dispatch_async(dispatch_get_main_queue(), ^{
        if (self->_extraDataViewController == nil) {
            self->_extraDataViewController = [ABI32_0_0RCTRedBoxExtraDataViewController new];
            self->_extraDataViewController.actionDelegate = self;
        }
        [self->_bridge.eventDispatcher sendDeviceEventWithName:@"collectRedBoxExtraData" body:nil];

        if (!self->_window) {
            self->_window = [[ABI32_0_0RCTRedBoxWindow alloc] initWithFrame:[UIScreen mainScreen].bounds];
            self->_window.actionDelegate = self;
        }

        ABI32_0_0RCTErrorInfo *errorInfo = [[ABI32_0_0RCTErrorInfo alloc] initWithErrorMessage:message
                                                                       stack:stack];
        errorInfo = [self _customizeError:errorInfo];
        [self->_window showErrorMessage:errorInfo.errorMessage
                              withStack:errorInfo.stack
                               isUpdate:isUpdate];
    });
}

- (void)loadExtraDataViewController {
    dispatch_async(dispatch_get_main_queue(), ^{
        // Make sure the CMD+E shortcut doesn't call this twice
        if (self->_extraDataViewController != nil && ![self->_window.rootViewController presentedViewController]) {
            [self->_window.rootViewController presentViewController:self->_extraDataViewController animated:YES completion:nil];
        }
    });
}

ABI32_0_0RCT_EXPORT_METHOD(setExtraData:(NSDictionary *)extraData forIdentifier:(NSString *)identifier) {
    [_extraDataViewController addExtraData:extraData forIdentifier:identifier];
}

ABI32_0_0RCT_EXPORT_METHOD(dismiss)
{
    dispatch_async(dispatch_get_main_queue(), ^{
        [self->_window dismiss];
    });
}

- (void)invalidate
{
    [self dismiss];
}

- (void)redBoxWindow:(__unused ABI32_0_0RCTRedBoxWindow *)redBoxWindow openStackFrameInEditor:(ABI32_0_0RCTJSStackFrame *)stackFrame
{
    NSURL *const bundleURL = _overrideBundleURL ?: _bridge.bundleURL;
    if (![bundleURL.scheme hasPrefix:@"http"]) {
        ABI32_0_0RCTLogWarn(@"Cannot open stack frame in editor because you're not connected to the packager.");
        return;
    }

    NSData *stackFrameJSON = [ABI32_0_0RCTJSONStringify([stackFrame toDictionary], NULL) dataUsingEncoding:NSUTF8StringEncoding];
    NSString *postLength = [NSString stringWithFormat:@"%tu", stackFrameJSON.length];
    NSMutableURLRequest *request = [NSMutableURLRequest new];
    request.URL = [NSURL URLWithString:@"/open-stack-frame" relativeToURL:bundleURL];
    request.HTTPMethod = @"POST";
    request.HTTPBody = stackFrameJSON;
    [request setValue:postLength forHTTPHeaderField:@"Content-Length"];
    [request setValue:@"application/json" forHTTPHeaderField:@"Content-Type"];

    [[[NSURLSession sharedSession] dataTaskWithRequest:request] resume];
}

- (void)reload
{
    // Window is not used and can be nil
    [self reloadFromRedBoxWindow:nil];
}

- (void)reloadFromRedBoxWindow:(__unused ABI32_0_0RCTRedBoxWindow *)redBoxWindow
{
    if (_overrideReloadAction) {
        _overrideReloadAction();
    } else {
        [_bridge reload];
    }
    [self dismiss];
}

@end

@implementation ABI32_0_0RCTBridge (ABI32_0_0RCTRedBox)

- (ABI32_0_0RCTRedBox *)redBox
{
    return [self moduleForClass:[ABI32_0_0RCTRedBox class]];
}

@end

#else // Disabled

@implementation ABI32_0_0RCTRedBox

+ (NSString *)moduleName { return nil; }
- (void)registerErrorCustomizer:(id<ABI32_0_0RCTErrorCustomizer>)errorCustomizer {}
- (void)showError:(NSError *)message {}
- (void)showErrorMessage:(NSString *)message {}
- (void)showErrorMessage:(NSString *)message withDetails:(NSString *)details {}
- (void)showErrorMessage:(NSString *)message withRawStack:(NSString *)rawStack {}
- (void)showErrorMessage:(NSString *)message withStack:(NSArray<NSDictionary *> *)stack {}
- (void)updateErrorMessage:(NSString *)message withStack:(NSArray<NSDictionary *> *)stack {}
- (void)showErrorMessage:(NSString *)message withParsedStack:(NSArray<ABI32_0_0RCTJSStackFrame *> *)stack {}
- (void)updateErrorMessage:(NSString *)message withParsedStack:(NSArray<ABI32_0_0RCTJSStackFrame *> *)stack {}
- (void)showErrorMessage:(NSString *)message withStack:(NSArray<NSDictionary *> *)stack isUpdate:(BOOL)isUpdate {}
- (void)dismiss {}

@end

@implementation ABI32_0_0RCTBridge (ABI32_0_0RCTRedBox)

- (ABI32_0_0RCTRedBox *)redBox { return nil; }

@end

#endif
