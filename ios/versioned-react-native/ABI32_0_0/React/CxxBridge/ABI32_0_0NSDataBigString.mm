/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

#import "ABI32_0_0NSDataBigString.h"

namespace facebook {
namespace ReactABI32_0_0 {

static NSData *ensureNullTerminated(NSData *source)
{
  if (!source || source.length == 0) {
    return nil;
  }

  NSUInteger sourceLength = source.length;
  unsigned char lastByte;
  [source getBytes:&lastByte range:NSMakeRange(sourceLength - 1, 1)];

  // TODO: bundles from the packager should always include a NULL byte
  // or we should we relax this requirement and only read as much from the
  // buffer as length indicates
  if (lastByte == '\0') {
    return source;
  } else {
    NSMutableData *data = [source mutableCopy];
    unsigned char nullByte = '\0';
    [data appendBytes:&nullByte length:1];
    return data;
  }
}

NSDataBigString::NSDataBigString(NSData *data)
{
  m_length = [data length];
  m_data = ensureNullTerminated(data);
}

} }
