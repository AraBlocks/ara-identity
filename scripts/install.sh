#!/bin/bash

PREFIX="${PREFIX-$HOME/.ara}"
BIN="$PREFIX/bin"
AID="${AID:-$BIN/ara-identity}"
OS=$(uname)

function ontrap {
  if [ -f $BASHRC.bak ]; then
    mv -f $BASHRC.bak $BASHRC
  fi
}

trap ontrap EXIT

echo "  mkdirp: $PREFIX"
mkdir -p $PREFIX

echo "  mkdirp: $BIN"
mkdir -p $BIN

echo "  mkdirp: $AID"
mkdir -p $AID

echo "  install: $(ls *.node --color=none | tr '\n' ' ')"
cp *.node $AID

echo "  install: $AID"
cp aid $AID

if test -f aid.exe; then
  echo " error: TODO: aid.exe"
  exit 1
else
  ln -sf $AID/aid $BIN/aid
fi

if [ "--completions" = "$1" ]; then
  if [ -z "$BASHRC" ]; then
    if [[ "Darwin" == "$OS" ]] || ! [ -f "$HOME/.bashrc" ]; then
      BASHRC="$HOME/.bash_profile"
    else
      BASHRC="$HOME/.bashrc"
    fi
  fi

  if ! [ -f "$BASHRC" ] || [ -z "$BASHRC" ]; then
    echo >&2 "  error: Unable to determine .bashrc or .bash_profile"
    exit 1
  fi

  TMPBASHRC="$BASHRC.tmp"
  PATTERN='s/###\-begin\-aid\-completions\-###.*###-end-aid-completions-###//'

  rm -f $TMPBASHRC

  echo "  backup: $BASHRC"
  cp -f $BASHRC $BASHRC.bak

  cat $BASHRC | \
    tr '\n' '\r' | \
    sed $PATTERN | \
    tr '\r' '\n' > $TMPBASHRC

  echo "  diff: (before) $BASHRC <> $TMPBASHRC"
  diff $BASHRC $TMPBASHRC

  echo " install: aid completions "
  $BIN/aid __completions | \
    sed 's/_yargs/_aid/g' | \
    sed 's/begin-yargs/begin-aid/g' | \
    sed 's/end-yargs/end-aid/g' >> $TMPBASHRC

  echo "  diff: (after) $BASHRC <> $TMPBASHRC"
  diff $BASHRC $TMPBASHRC

  echo "  install: $BASHRC (aid completions)"
  mv -f $TMPBASHRC $BASHRC

  echo "  cleanup:  $TMPBASHRC $BASHRC.bak"
  rm -f $TMPBASHRC $BASHRC.bak

fi

echo
echo "  ok!"
