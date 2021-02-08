// Copyright 2015-present 650 Industries. All rights reserved.

@objc
public protocol DevMenuItemsContainerProtocol {
  @objc
  func getRootItems() -> [DevMenuScreenItem]
  
  @objc
  func getAllItems() -> [DevMenuScreenItem]
  
  @objc
  func addItem(_ item: DevMenuScreenItem)
  
  @objc
  func serializeItems() -> [[String: Any]]
}
