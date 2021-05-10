/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

#include "ABI39_0_0SliderState.h"

namespace ABI39_0_0facebook {
namespace ABI39_0_0React {

ImageSource SliderState::getTrackImageSource() const {
  return trackImageSource_;
}

ImageRequest const &SliderState::getTrackImageRequest() const {
  return *trackImageRequest_;
}

ImageSource SliderState::getMinimumTrackImageSource() const {
  return minimumTrackImageSource_;
}

ImageRequest const &SliderState::getMinimumTrackImageRequest() const {
  return *minimumTrackImageRequest_;
}

ImageSource SliderState::getMaximumTrackImageSource() const {
  return maximumTrackImageSource_;
}

ImageRequest const &SliderState::getMaximumTrackImageRequest() const {
  return *maximumTrackImageRequest_;
}

ImageSource SliderState::getThumbImageSource() const {
  return thumbImageSource_;
}

ImageRequest const &SliderState::getThumbImageRequest() const {
  return *thumbImageRequest_;
}

} // namespace ABI39_0_0React
} // namespace ABI39_0_0facebook
