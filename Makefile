OS ?= $(shell uname)
RM ?= $(shell which rm)
CWD ?= $(shell pwd)
NPM ?= $(shell which npm)
BUILD ?= $(CWD)/build
PREFIX ?= /usr/local
TARGET ?= aid

.PHONY: default install uninstall clean

default: build

build: node_modules
	./scripts/package.sh

node_modules: package.json

package.json:
	$(NPM) install

install:
	$(error "make install not supported.")

uninstall:
	$(error "make uninstall not supported.")

clean:
	$(RM) -rf $(BUILD)
