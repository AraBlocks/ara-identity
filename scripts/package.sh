#!/bin/bash

CWD="$(pwd)"
PKG=${PKG:-$(which pkg)}
BUILD=${BUILD:-build/}
TARGET=${TARGET:-bin/ara-identity}

rm -rf $BUILD
mkdir -p $BUILD/{macos,linux,win}

build() {
  $PKG -t $1 -o $BUILD/$1/aid $TARGET \
    | grep $CWD                       \
    | grep '\.node'                   \
    | while read path; do             \
      echo "dep: " $(basename $path); \
      cp $path $BUILD/$1;             \
    done

  local rc=$?
  echo "> build: $TARGET for $1"
  return $rc
}

(build 'linux') && (build 'macos') && (build 'win')
exit $?
