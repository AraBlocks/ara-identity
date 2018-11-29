#!/bin/bash

PREFIX="${PREFIX-$HOME/.ara}"
BIN="$PREFIX/bin"
AID="${AID:-$BIN/ara-identity}"

mkdir -p $PREFIX
mkdir -p $BIN
mkdir -p $AID

cp *.node $AID
cp aid $AID

if test -f aid.exe; then
  echo "TODO"
else
  ln -sf $AID/aid $BIN/aid
fi
