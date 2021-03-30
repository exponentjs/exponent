// Copyright 2015-present 650 Industries. All rights reserved.

#import <UIKit/UIKit.h>
#import <EXScreenOrientation/EXScreenOrientationViewController.h>

@class EXViewController;
@class EXKernelAppRecord;

@protocol EXViewControllerDelegate <NSObject>

- (void)viewController:(EXViewController *)vc didNavigateAppToVisible:(EXKernelAppRecord *)appRecord;

@end

@interface EXViewController : EXScreenOrientationViewController

/**
 *  Invoked from `viewDidLoad`
 */
- (void)createRootAppAndMakeVisible;

@property (nonatomic, strong) UIViewController *contentViewController;
@property (nonatomic, weak) id<EXViewControllerDelegate> delegate;

@end
