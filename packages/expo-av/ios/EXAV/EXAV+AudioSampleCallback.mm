//
//  EXAV+AudioSampleCallback.mm
//  EXAV
//
//  Created by Marc Rousavy on 09.07.21.
//

#import <Foundation/Foundation.h>
#import "EXAV.h"
#import <EXAV/EXAVPlayerData.h>

#import <jsi/jsi.h>

using namespace facebook;

@implementation EXAV (AudioSampleCallback)

- (void) installJSIBindingsForRuntime:(void *)jsRuntimePtr
                  withSoundDictionary:(NSMutableDictionary <NSNumber *, EXAVPlayerData *> *)soundDictionary
{
  auto& runtime = *static_cast<jsi::Runtime*>(jsRuntimePtr);
  
  __weak auto weakSoundDictionary = soundDictionary;
  auto setAudioSampleCallback = [weakSoundDictionary](jsi::Runtime &runtime,
                                                      const jsi::Value &thisValue,
                                                      const jsi::Value *args,
                                                      size_t argsCount) -> jsi::Value {
    auto strongSoundDictionary = weakSoundDictionary;
    if (!strongSoundDictionary) {
      throw jsi::JSError(runtime, "Failed to strongify self!");
    }
    
    auto avId = static_cast<int>(args[0].asNumber());
    auto callback = args[0].asObject(runtime).asFunction(runtime);
    
    NSLog(@"SET CALLBACK FOR RECORDER %i...", avId);
    auto sound = [strongSoundDictionary objectForKey:@(avId)];
    if (sound == nil) {
      auto message = [NSString stringWithFormat:@"Sound Instance with ID %i does not exist!", avId];
      throw jsi::JSError(runtime, message.UTF8String);
    }
    
    auto callbackShared = std::make_shared<jsi::Function>(std::move(callback));
    
    [sound addSampleBufferCallback:^(AVAudioPCMBuffer * _Nonnull buffer) {
      NSLog(@"Sample Buffer Callback invoked!");
      callbackShared->call(runtime, jsi::Value::undefined());
    }];
    
    return jsi::Value::undefined();
  };
  
  runtime.global().setProperty(runtime,
                               "__exav_setAudioSampleCallback",
                               jsi::Function::createFromHostFunction(runtime,
                                                                     jsi::PropNameID::forUtf8(runtime, "__exav_setAudioSampleCallback"),
                                                                     2, // [AV-Instance ID, Callback]
                                                                     std::move(setAudioSampleCallback)));
}

@end
