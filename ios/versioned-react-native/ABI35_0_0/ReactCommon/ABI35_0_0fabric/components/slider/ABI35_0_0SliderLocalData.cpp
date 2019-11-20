/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

#include "ABI35_0_0SliderLocalData.h"

#include <ReactABI35_0_0/components/image/conversions.h>
#include <ReactABI35_0_0/debug/debugStringConvertibleUtils.h>

namespace facebook {
namespace ReactABI35_0_0 {

ImageSource SliderLocalData::getTrackImageSource() const {
  return trackImageSource_;
}

const ImageRequest &SliderLocalData::getTrackImageRequest() const {
  return trackImageRequest_;
}

ImageSource SliderLocalData::getMinimumTrackImageSource() const {
  return minimumTrackImageSource_;
}

const ImageRequest &SliderLocalData::getMinimumTrackImageRequest() const {
  return minimumTrackImageRequest_;
}

ImageSource SliderLocalData::getMaximumTrackImageSource() const {
  return maximumTrackImageSource_;
}

const ImageRequest &SliderLocalData::getMaximumTrackImageRequest() const {
  return maximumTrackImageRequest_;
}

ImageSource SliderLocalData::getThumbImageSource() const {
  return thumbImageSource_;
}

const ImageRequest &SliderLocalData::getThumbImageRequest() const {
  return thumbImageRequest_;
}

#pragma mark - DebugStringConvertible

#if RN_DEBUG_STRING_CONVERTIBLE
std::string SliderLocalData::getDebugName() const {
  return "SliderLocalData";
}

SharedDebugStringConvertibleList SliderLocalData::getDebugProps() const {
  return {
      debugStringConvertibleItem("trackImageSource", trackImageSource_),
      debugStringConvertibleItem(
          "minimumTrackImageSource", minimumTrackImageSource_),
      debugStringConvertibleItem(
          "maximumTrackImageSource", maximumTrackImageSource_),
      debugStringConvertibleItem("thumbImageSource", thumbImageSource_),
  };
}
#endif

} // namespace ReactABI35_0_0
} // namespace facebook
