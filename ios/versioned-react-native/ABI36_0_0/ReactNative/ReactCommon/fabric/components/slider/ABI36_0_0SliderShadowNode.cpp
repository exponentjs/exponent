/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

#include "ABI36_0_0SliderShadowNode.h"

#include <ABI36_0_0React/components/slider/SliderLocalData.h>
#include <ABI36_0_0React/components/slider/SliderShadowNode.h>
#include <ABI36_0_0React/core/LayoutContext.h>

namespace ABI36_0_0facebook {
namespace ABI36_0_0React {

extern const char SliderComponentName[] = "Slider";

void SliderShadowNode::setImageManager(const SharedImageManager &imageManager) {
  ensureUnsealed();
  imageManager_ = imageManager;
}

void SliderShadowNode::setSliderMeasurementsManager(
    const std::shared_ptr<SliderMeasurementsManager> &measurementsManager) {
  ensureUnsealed();
  measurementsManager_ = measurementsManager;
}

void SliderShadowNode::updateLocalData() {
  const auto &newTrackImageSource = getTrackImageSource();
  const auto &newMinimumTrackImageSource = getMinimumTrackImageSource();
  const auto &newMaximumTrackImageSource = getMaximumTrackImageSource();
  const auto &newThumbImageSource = getThumbImageSource();

  const auto &localData = getLocalData();
  if (localData) {
    assert(std::dynamic_pointer_cast<const SliderLocalData>(localData));
    auto currentLocalData =
        std::static_pointer_cast<const SliderLocalData>(localData);

    auto trackImageSource = currentLocalData->getTrackImageSource();
    auto minimumTrackImageSource =
        currentLocalData->getMinimumTrackImageSource();
    auto maximumTrackImageSource =
        currentLocalData->getMaximumTrackImageSource();
    auto thumbImageSource = currentLocalData->getThumbImageSource();

    bool anyChanged = newTrackImageSource != trackImageSource ||
        newMinimumTrackImageSource != minimumTrackImageSource ||
        newMaximumTrackImageSource != maximumTrackImageSource ||
        newThumbImageSource != thumbImageSource;

    if (!anyChanged) {
      return;
    }
  }

  // Now we are about to mutate the Shadow Node.
  ensureUnsealed();

  // It is not possible to copy or move image requests from SliderLocalData,
  // so instead we recreate any image requests (that may already be in-flight?)
  // TODO: check if multiple requests are cached or if it's a net loss
  const auto &newLocalData = std::make_shared<SliderLocalData>(
      newTrackImageSource,
      imageManager_->requestImage(newTrackImageSource),
      newMinimumTrackImageSource,
      imageManager_->requestImage(newMinimumTrackImageSource),
      newMaximumTrackImageSource,
      imageManager_->requestImage(newMaximumTrackImageSource),
      newThumbImageSource,
      imageManager_->requestImage(newThumbImageSource));
  setLocalData(newLocalData);
}

ImageSource SliderShadowNode::getTrackImageSource() const {
  return getProps()->trackImage;
}

ImageSource SliderShadowNode::getMinimumTrackImageSource() const {
  return getProps()->minimumTrackImage;
}

ImageSource SliderShadowNode::getMaximumTrackImageSource() const {
  return getProps()->maximumTrackImage;
}

ImageSource SliderShadowNode::getThumbImageSource() const {
  return getProps()->thumbImage;
}

#pragma mark - LayoutableShadowNode

Size SliderShadowNode::measure(LayoutConstraints layoutConstraints) const {
  if (SliderMeasurementsManager::shouldMeasureSlider()) {
    return measurementsManager_->measure(layoutConstraints);
  }

  return {};
}

void SliderShadowNode::layout(LayoutContext layoutContext) {
  updateLocalData();
  ConcreteViewShadowNode::layout(layoutContext);
}

} // namespace ABI36_0_0React
} // namespace ABI36_0_0facebook
