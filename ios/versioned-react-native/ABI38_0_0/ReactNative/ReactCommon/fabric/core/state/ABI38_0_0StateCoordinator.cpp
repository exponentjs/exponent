/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

#include "ABI38_0_0StateCoordinator.h"

#include <ABI38_0_0React/core/ShadowNode.h>
#include <ABI38_0_0React/core/StateData.h>
#include <ABI38_0_0React/core/StateUpdate.h>

namespace ABI38_0_0facebook {
namespace ABI38_0_0React {

StateCoordinator::StateCoordinator(EventDispatcher::Weak eventDispatcher)
    : eventDispatcher_(eventDispatcher) {}

const StateTarget &StateCoordinator::getTarget() const {
  std::shared_lock<better::shared_mutex> lock(mutex_);
  return target_;
}

void StateCoordinator::setTarget(StateTarget &&target) const {
  std::unique_lock<better::shared_mutex> lock(mutex_);

  assert(target && "`StateTarget` must not be empty.");

  if (target_) {
    auto &previousState = target_.getShadowNode().getState();
    auto &nextState = target.getShadowNode().getState();

    /*
     * Checking and setting `isObsolete_` prevents old states to be recommitted
     * on top of fresher states. It's okay to commit a tree with "older" Shadow
     * Nodes (the evolution of nodes is not linear), however, we never back out
     * states (they progress linearly).
     */
    if (nextState->isObsolete_) {
      return;
    }

    previousState->isObsolete_ = true;
  }

  target_ = std::move(target);
}

void StateCoordinator::dispatchRawState(
    StateUpdate &&stateUpdate,
    EventPriority priority) const {
  auto eventDispatcher = eventDispatcher_.lock();
  if (!eventDispatcher || !target_) {
    return;
  }

  eventDispatcher->dispatchStateUpdate(std::move(stateUpdate), priority);
}

} // namespace ABI38_0_0React
} // namespace ABI38_0_0facebook
