#!/bin/bash

CWD="$(pwd)"
PKG=${PKG:-$(which pkg)}
BUILD=${BUILD:-build/}
TARGET=${TARGET:-bin/ara-identity}

if [ -z "$PKG" ]; then
  PKG="node_modules/.bin/pkg"
fi

rm -rf $BUILD
mkdir -p $BUILD

build() {
  printf "> build: %s\n" $TARGET
  $PKG -o $BUILD/aid $TARGET                    \
    | grep $CWD                                 \
    | grep '\.node'                             \
    | while read path; do                       \
      printf ">   dep: %s\n" $(basename $path); \
      cp $path $BUILD;                          \
    done

  local rc=$?
  return $rc
}

build
exit $?
