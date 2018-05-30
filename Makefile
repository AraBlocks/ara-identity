
GETH := $(shell which geth)

GETH_FLAGS += --rpc
GETH_FLAGS += --rpcapi "eth,net,web3"
GETH_FLAGS += --rpccorsdomain '*'
GETH_FLAGS += --rpcaddr localhost
GETH_FLAGS += --rpcport 8545

GETH_TESTNET_FLAGS += --fast
GETH_TESTNET_FLAGS += --cache=1048
GETH_TESTNET_FLAGS += --testnet
GETH_TESTNET_FLAGS += --unlock 0x8eb46e89a0c72576e56138dc3fb496143d6c845a
#GETH_TESTNET_FLAGS += --password 'ara is the dao'

.PHONY: default testnet

default:
	@:

testnet:
	@$(GETH) $(GETH_FLAGS) $(GETH_TESTNET_FLAGS)

