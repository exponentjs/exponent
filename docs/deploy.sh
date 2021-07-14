#!/usr/bin/env bash

set -euo pipefail

scriptdir=$(dirname "${BASH_SOURCE[0]}")
declare -a buckets=("docs.expo.io" "docs.expo.dev")
target="${1-$scriptdir/out}"

if [ ! -d "$target" ]; then
  echo "target $target not found"
  exit 1
fi

for bucket in ${buckets[@]}; do

# To keep the previous website up and running, we deploy it using these steps.
#   1.  Sync Next.js static assets in \`_next/**\` folder
#      > Uploads the new generated JS and asset files (stored in hashed folders to avoid collision with older deployments)
#   2.  Sync assets in \`static/**\` folder
#   3. Overwrite HTML dependents, not located in \`_next/**\` or \`static/**\` folder
#      > Force overwrite of all HTML files to make sure we use the latest one
#   4. Sync assets and clean up outdated files from previous deployments
#   5. Add custom redirects
#   6. Copy domain-specific sitemap.xml separately since they're named separately in the build step

echo "::group::[1/7] Sync Next.js static assets in \`_next/**\` folder ($bucket)"
aws s3 sync \
  --no-progress \
  --exclude "*" \
  --include "_next/**" \
  --cache-control "public, max-age=31536000, immutable" \
  "$target" \
  "s3://${bucket}"
echo "::endgroup::"

echo "::group::[2/7] Sync assets in \`static/**\` folder ($bucket)"
aws s3 sync \
  --no-progress \
  --exclude "*" \
  --include "static/**" \
  --cache-control "public, max-age=3600" \
  "$target" \
  "s3://${bucket}"
echo "::endgroup::"

# Due to a bug with `aws s3 sync` we need to copy everything first instead of syncing
# see: https://github.com/aws/aws-cli/issues/3273#issuecomment-643436849
echo "::group::[3/7] Overwrite HTML dependents, not located in \`_next/**\` or \`static/**\` folder ($bucket)"
aws s3 cp \
  --no-progress \
  --recursive \
  --exclude "_next/**" \
  --exclude "static/**" \
  --exclude "*-sitemap.xml" \
  --exclude "*-robots.txt" \
  "$target" \
  "s3://${bucket}"
echo "::endgroup::"

echo "::group::[4/7] Sync assets and clean up outdated files from previous deployments ($bucket)"
aws s3 sync \
  --no-progress \
  --delete \
  "$target" \
  "s3://${bucket}"
echo "::endgroup::"

declare -A redirects # associative array variable

# usage:
# redicts[requests/for/this/path]=are/redirected/to/this/one

# Temporarily create a redirect for a page that Home links to
redirects[versions/latest/introduction/installation.html]=versions/latest/introduction/installation/
# useful link on twitter
redirects[versions/latest/guides/app-stores.html]=versions/latest/distribution/app-stores/
# Xdl caches
redirects[versions/latest/guides/offline-support.html]=versions/latest/guides/offline-support/
# xdl convert comment
redirects[versions/latest/sdk/index.html]=versions/latest/sdk/overview/
# upgrading expo -> upgrading sdk walkthrough
redirects[versions/latest/workflow/upgrading-expo]=versions/latest/workflow/upgrading-expo-sdk-walkthrough/
# rename
redirects[versions/latest/sdk/haptic/index.html]=versions/latest/sdk/haptics/
# duplicate docs file, consolidate into one page
redirects[versions/latest/sdk/introduction/index.html]=versions/latest/sdk/overview/
# project-lifecycle is now covered by managed-vs-bare
redirects[versions/latest/introduction/project-lifecycle/]=versions/latest/introduction/managed-vs-bare/
# exp-cli is now expo-cli
redirects[versions/latest/guides/exp-cli.html]=versions/latest/workflow/expo-cli/
redirects[versions/latest/guides/exp-cli]=versions/latest/workflow/expo-cli/
# Migrated FAQ pages
redirects[faq/image-background]=ui-programming/image-background/
redirects[faq/react-native-styling-buttons]=ui-programming/react-native-styling-buttons/
redirects[faq/react-native-version-mismatch]=troubleshooting/react-native-version-mismatch/
redirects[faq/clear-cache-windows]=troubleshooting/clear-cache-windows/
redirects[faq/clear-cache-macos-linux]=troubleshooting/clear-cache-macos-linux/
redirects[faq/application-has-not-been-registered]=troubleshooting/application-has-not-been-registered/

echo "::group::[5/7] Add custom redirects ($bucket)"
for i in "${!redirects[@]}" # iterate over keys
do
  aws s3 cp \
    --no-progress \
    --metadata-directive REPLACE \
    --website-redirect "/${redirects[$i]}" \
    "$target/404.html" \
    "s3://${bucket}/${i}"

  # Also add redirects for paths without `.html` or `/`
  # S3 translates URLs with trailing slashes to `path/` -> `path/index.html`
  if [[ $i != *".html" ]] && [[ $i != *"/" ]]; then
    aws s3 cp \
      --no-progress \
      --metadata-directive REPLACE \
      --website-redirect "/${redirects[$i]}" \
      "$target/404.html" \
      "s3://${bucket}/${i}/index.html"
  fi
done
echo "::endgroup::"

echo "::group::[6/7] Copy over domain-specific sitemap.xml and robots.txt ($bucket)"
aws s3 cp \
  --no-progress \
  "$target/${bucket}-sitemap.xml" \
  "s3://${bucket}/sitemap.xml"

aws s3 cp \
  --no-progress \
  "$target/${bucket}-robots.txt" \
  "s3://${bucket}/robots.txt"
echo "::endgroup::"

echo "::group::[7/7] Notify Google of sitemap changes ($bucket)"
if [ "$bucket" == "docs.expo.io" ]; then
  echo "Strings are equal"
  curl -m 15 "http://www.google.com/ping\?sitemap\=https%3A%2F%2F${bucket}%2Fsitemap.xml"
  echo "\n::endgroup::"
else
  echo "Skipping Gooogle sitemap ping for $bucket"
fi
done
