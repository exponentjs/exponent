//
//  EXAV+AudioSampleCallback.h
//  EXAV
//
//  Created by Marc Rousavy on 09.07.21.
//

#pragma once

#import <Foundation/Foundation.h>
#import "EXAV.h"
#import <EXAV/EXAVPlayerData.h>

@interface EXAV (AudioSampleCallback)

- (void) installJSIBindingsForRuntime:(void *)jsRuntimePtr
                  withSoundDictionary:(NSMutableDictionary <NSNumber *, EXAVPlayerData *> *)soundDictionary;

@end
