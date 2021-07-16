require 'json'

package = JSON.parse(File.read(File.join(__dir__, 'package.json')))

# Following the example of react-native-firebase
# https://github.com/invertase/react-native-firebase/blob/bf5271ef46b534d3363206f816d114f9ac5c59ee/packages/app/RNFBApp.podspec#L5-L10

sd_web_image_version = '~> 5.0'
using_custom_sd_web_image_version = defined? $SDWebImageVersion
if using_custom_sd_web_image_version
  sd_web_image_version = $SDWebImageVersion
  Pod::UI.puts "expo-image: Using user specified SDWebImage version '#{$sd_web_image_version}'"
end

sd_web_image_webp_coder = '~> 0.8.4'
using_custom_sd_web_image_webp_coder_version = defined? $SDWebImageWebPCoderVersion
if using_custom_sd_web_image_webp_coder_version
  using_custom_sd_web_image_webp_coder_version  = $SDWebImageWebPCoderVersion
  Pod::UI.puts "expo-image: Using user specified SDWebImage webP coder version '#{$sd_web_image_webp_coder}'"
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
  s.dependency 'SDWebImageWebPCoder', sd_web_image_webp_coder
  s.dependency 'SDWebImageSVGKitPlugin', '~> 1.3'
  s.dependency 'SVGKit', '~> 2.1'
end
