RM ?= $(shell which rm)
CWD ?= $(shell pwd)
NPM ?= $(shell which npm)
BUILD ?= $(CWD)/build

.PHONY: default install uninstall clean

default: build

build: node_modules
	./scripts/package.sh

node_modules: package.json

package.json:
	$(NPM) install

clean:
	$(RM) -rf $(BUILD)
