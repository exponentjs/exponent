require 'json'

package = JSON.parse(File.read(File.join(__dir__, 'package.json')))

# Following the example of react-native-firebase
# https://github.com/invertase/react-native-firebase/blob/bf5271ef46b534d3363206f816d114f9ac5c59ee/packages/app/RNFBApp.podspec#L5-L10

sd_web_image_version = '~> 5.0'
sd_web_image_svgkit_plugin_version = '~> 1.2'

using_custom_sd_web_image_version = defined? $SDWebImageVersion
using_custom_sd_web_image_svgkit_plugin_version = defined? $SDWebImageSVGKitPluginVersion

if using_custom_sd_web_image_version
  sd_web_image_version = $SDWebImageVersion
  Pod::UI.info "expo-image: Using user specified SDWebImage version '#{sd_web_image_version}'"
end

if using_custom_sd_web_image_svgkit_plugin_version
  sd_web_image_svgkit_plugin_version = $SDWebImageSVGKitPluginVersion
  Pod::UI.info "expo-image: Using user specified SDWebImageSVGKitPlugin version '#{sd_web_image_svgkit_plugin_version}'"
end

Pod::Spec.new do |s|
  s.name           = 'expo-image'
  s.version        = package['version']
  s.summary        = package['description']
  s.description    = package['description']
  s.license        = package['license']
  s.author         = package['author']
  s.homepage       = package['homepage']
  s.platform       = :ios, '11.0'
  s.source         = { git: 'https://github.com/expo/expo.git' }

  s.source_files = "ios/**/*.{h,m}"
  s.requires_arc = true

  s.dependency 'React-Core'

  s.dependency 'SDWebImage', sd_web_image_version
  s.dependency 'SDWebImageSVGKitPlugin', sd_web_image_svgkit_plugin_version

end
