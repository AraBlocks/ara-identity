#!/bin/bash

CWD="$(pwd)"
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" >/dev/null && pwd)"
PKG=${PKG:-$(which pkg)}
BUILD=${BUILD:-build}
TARGET=${TARGET:-bin/aid}

if [ -z "$PKG" ]; then
  PKG="node_modules/.bin/pkg"
fi

rm -rf $BUILD
mkdir -p $BUILD

build() {
  printf "> build: %s\n" $TARGET
  $PKG --output --public --out-path $BUILD $TARGET        \
    | while read line; do                                 \
        if $(echo $line | grep $CWD >/dev/null) &&        \
           $(echo $line | grep '\.node' >/dev/null); then \
          local path="$line";                             \
          printf ">   dep: %s\n" $(basename $path);       \
          cp $path $BUILD;                                \
        else                                              \
          echo $line;                                     \
        fi;                                               \
      done

  local rc=$?
  return $rc
}


build

mkdir $BUILD/{macos,linux,win}

mv $BUILD/aid-macos $BUILD/macos/aid
mv $BUILD/aid-linux $BUILD/linux/aid
mv $BUILD/aid-win.exe $BUILD/win/aid.exe

cp $BUILD/*.node $BUILD/macos
cp $BUILD/*.node $BUILD/linux
cp $BUILD/*.node $BUILD/win

rm -f $BUILD/*.node

cp "$DIR/install.sh" $BUILD/macos
cp "$DIR/install.sh" $BUILD/linux
cp "$DIR/install.sh" $BUILD/win

cp "$DIR/../README.md" $BUILD/macos
cp "$DIR/../README.md" $BUILD/linux
cp "$DIR/../README.md" $BUILD/win

cp "$DIR/../LICENSE" $BUILD/macos
cp "$DIR/../LICENSE" $BUILD/linux
cp "$DIR/../LICENSE" $BUILD/win

cp "$DIR/../CHANGELOG.md" $BUILD/macos
cp "$DIR/../CHANGELOG.md" $BUILD/linux
cp "$DIR/../CHANGELOG.md" $BUILD/win

exit $?
