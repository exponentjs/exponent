// Copyright 2015-present 650 Industries. All rights reserved.

#import <EXPrint/EXWKPDFRenderer.h>
#import <UMCore/UMDefines.h>
#import <EXPrint/EXWKSnapshotPDFRenderer.h>

@interface EXWKPDFRenderer () <WKNavigationDelegate>

@property (nonatomic, assign) CGSize pageSize;
@property (nonatomic, strong) WKWebView *webView;
@property (nonatomic, strong) id<EXPDFRenderer> renderer;
@property (nonatomic, strong) WKNavigation *htmlNavigation;
@property (nonatomic, strong) void (^onRenderingFinished)(NSError * _Nullable, NSData * _Nullable, int);

@end

@implementation EXWKPDFRenderer

- (void)PDFWithHtml:(NSString *)htmlString pageSize:(CGSize)pageSize completionHandler:(void (^)(NSError * _Nullable, NSData * _Nullable, int))handler
{
  _pageSize = pageSize;
  _onRenderingFinished = handler;
  _webView = [self createWebView];
  _renderer = [[EXWKSnapshotPDFRenderer alloc] init];
  _htmlNavigation = [_webView loadHTMLString:htmlString baseURL:nil];
}

#pragma mark - UIWebViewDelegate

- (void)webView:(WKWebView *)webView didFinishNavigation:(WKNavigation *)navigation
{
  if (_htmlNavigation != navigation) {
    return;
  }

  UM_WEAKIFY(self);
  [_renderer PDFFromWebView:webView completionHandler:^(NSError * _Nullable error, NSData * _Nullable data, int pagesCount) {
    UM_ENSURE_STRONGIFY(self);
    self.onRenderingFinished(error, data, pagesCount);
  }];
}

- (void)webView:(WKWebView *)webView didFailNavigation:(WKNavigation *)navigation withError:(NSError *)error
{
  if (_htmlNavigation != navigation) {
    return;
  }

  _onRenderingFinished(error, nil, 0);
}

- (WKWebView *)createWebView
{
  WKWebViewConfiguration *configuration = [[WKWebViewConfiguration alloc] init];
  CGRect frame = CGRectMake(0, 0, _pageSize.width, _pageSize.height);
  WKWebView *webView = [[WKWebView alloc] initWithFrame:frame configuration:configuration];
  webView.navigationDelegate = self;
  webView.backgroundColor = [UIColor clearColor];
  webView.scrollView.showsHorizontalScrollIndicator = NO;
  webView.scrollView.showsVerticalScrollIndicator = NO;

  return webView;
}

@end
