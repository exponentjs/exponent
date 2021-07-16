// Copyright 2015-present 650 Industries. All rights reserved.

#import <EXPrint/EXWKSnapshotPDFRenderer.h>
#import <UMCore/UMDefines.h>

@interface EXWKSnapshotPDFRenderer ()

@end

@implementation EXWKSnapshotPDFRenderer

- (void)PDFFromWebView:(WKWebView *)webView completionHandler:(void (^)(NSError * _Nullable, NSData * _Nullable, int))handler
{
  UM_WEAKIFY(self);
  [webView evaluateJavaScript:@"window.innerHeight + ' ' + document.documentElement.scrollHeight" completionHandler:^(id jsResult, NSError * _Nullable error) {
    UM_ENSURE_STRONGIFY(self);
    NSString *jsResultString = jsResult;
    NSArray *items = [jsResultString componentsSeparatedByString:@" "];
    CGFloat pageHeight = [items[0] doubleValue];
    CGFloat scrollHeight = [items[1] doubleValue];
    int numberOfPages = ceil(scrollHeight / pageHeight);

    // Ensure all content is loaded by scrolling to the end of webpage
    [webView.scrollView setContentOffset:CGPointMake(0, scrollHeight - pageHeight) animated:NO];

    NSMutableData *pdfData = [NSMutableData data];
    UIGraphicsBeginPDFContextToData(pdfData, webView.bounds, nil);
    [self takeSnapshotForPage:0 ofPages:numberOfPages ofWebView:webView withCompletionHandler:^(NSError * _Nullable error) {
      UIGraphicsEndPDFContext();
      if (error) {
        handler(error, nil, 0);
      } else {
        handler(nil, pdfData, numberOfPages);
      }
    }];
  }];
}

- (void)takeSnapshotForPage:(int)pageIndex ofPages:(int)pagesCount ofWebView:(WKWebView *)webView withCompletionHandler:(void (^ _Nullable)(NSError * _Nullable error))completionHandler
{
  if (pageIndex >= pagesCount) {
    completionHandler(nil);
    return;
  }

  CGFloat pageHeight = webView.bounds.size.height;

  [webView.scrollView setContentOffset:CGPointMake(0, pageHeight * pageIndex) animated:NO];
  if (@available(iOS 11.0, *)) {
    [webView takeSnapshotWithConfiguration:nil completionHandler:^(UIImage * _Nullable snapshotImage, NSError * _Nullable error) {
      if (snapshotImage) {
        CGRect printRect = UIGraphicsGetPDFContextBounds();
        UIGraphicsBeginPDFPage();
        [snapshotImage drawInRect:printRect];
        [self takeSnapshotForPage:(pageIndex + 1) ofPages:pagesCount ofWebView:webView withCompletionHandler:completionHandler];
      } else {
        completionHandler(error);
      }
    }];
  } else {
    NSError *error = UMErrorWithMessage(@"Unexpected error occurred - on iOS under 11.0 use EXWKViewPDFRenderer.");
    completionHandler(error);
  }
}

@end
