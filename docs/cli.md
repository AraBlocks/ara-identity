# CLI

## Setup

### Developer setup
```sh
$ git clone git@github.com:AraBlocks/ara-identity.git
$ cd ara-identity
$ npm install && npm link
```

### Install globally
```sh
$ npm install ara-identity --global
```

## Usage
```
$ aid --help
usage: aid [-hDV] <command> [options]

Commands:
  aid create                      Create an identity
  aid archive [did]               Archive identity in network
  aid resolve [did]               Resolve an identity
  aid list                        Output local identities
  aid whoami                      Output current Ara identity in context (.ararc)
  aid recover                     Recover an Ara identity using a mnemonic
  aid keystore-dump [did] [type]  Recover a private ethereum|ara key.

General Options:
  --help, -h     Show this help message
  --debug, -D    Enable debug output
  --version, -V  Show program version
```

## Commands
* [aid create](#aid-create)
* [aid archive](#aid-archive)
* [aid resolve](#aid-resolve)
* [aid list](#aid-list)
* [aid whoami](#aid-whoami)
* [aid recover](#aid-recover)
* [aid keystore-dump](#aid-keystore-dump)

<a name="aid-create"></a>
### 1. `aid create`
Create an Ara ID through the command line. Prompts the user to enter a password for encryption.

```sh
$ aid create -h
usage: aid create [-D] [options]

General Options:
  --help, -h     Show this help message
  --debug, -D    Enable debug output
  --version, -V  Show program version
```

#### Example
```sh
$ aid create
? Your identitys keystore will be secured by a passphrase.
Please provide a passphrase. Do not forget this as it will never be shown to you.
Passphrase: [hidden]

 ara: info:  New identity created: did:ara:4d7eba2809e627168054cae10a3a08fbdb9f5d58cd0e26a565c1c14c4157cb45
 ara: warn:  Will write identity file: ddo.json
 ara: warn:  Will write identity file: keystore/eth
 ara: warn:  Will write identity file: keystore/ara
 ara: warn:  Will write identity file: schema.proto
 ara: warn:  Will write identity file: identity
 ara: info:  Please safely store the following 12 word mnemonic phrase for this
 ara: info:  Ara ID. This phrase will be required to restore your Ara ID.
 ara: info:  It will never be shown again:
 ara: info:

╔════════════════════════════════════════════════════════════════════════════╗
║ glad kangaroo coyote rich detail grief matrix spirit jeans owner heart net ║
╚════════════════════════════════════════════════════════════════════════════╝
```

<a name="aid-archive"></a>
### 2. `aid archive`
Archive an Ara ID to a remote server from the command line. Prompts the user to enter their password for verification.

```sh
$ aid archive -h
usage: aid archive [-D] [options]

Positionals:
  did  [default: ]

Network Options:
  --secret, -s   Shared secret key for the associated network keys  [required]
  --keyring, -k  Path to Ara network keyring file  [required]
  --network, -n  Human readable network name for keys in keyring  [required]

General Options:
  --help, -h     Show this help message
  --debug, -D    Enable debug output
  --version, -V  Show program version
```

#### Example

```sh
$ aid archive did:ara:4d7eba2809e627168054cae10a3a08fbdb9f5d58cd0e26a565c1c14c4157cb45 \
              -s test-secret \
              -n archiver \
              -k /home/ubuntu/.ara/keyrings/test-keyring.pub

? Please provide a passphrase for your identity. This is needed to archive your identity.
Passphrase: [hidden]
 ara: warn:  Archiving new identity for network /home/ubuntu/.ara/keyrings/test-keyring.pub.
 ara: info:  Got hello from archiver node: key=35e2e3ec mac=5d8c8995
 ara: info:  Authenticated with archiver node: keys=c9e1b5f4 signature=dbb8c339
 ara: info:  Got okay from archiver node: signature=dbb8c339
 ara: info:  1 connection made
 ara: info:  Successfully archived identity to network archiver
```

<a name="aid-resolve"></a>
### 3. `aid resolve`
Resolves an Ara ID to its DID document either locally or from a remote server.

```
$ aid resolver -h
usage: aid resolve [-D] [options]

Positionals:
  did  [default: ""]

Network Options:
  --secret, -s   Shared secret key for the associated network keys.
  --keyring, -k  Path to Ara network keyring file
  --network, -n  Human readable network name for keys in keyring

Resolution Options:
  --cache, -C    Enable or disable cache  [boolean] [default: true]
  --timeout, -t  Resolution timeout

General Options:
  --help, -h     Show this help message
  --debug, -D    Enable debug output
  --version, -V  Show program version
```

#### Example
```
$ aid resolve 4d7eba2809e627168054cae10a3a08fbdb9f5d58cd0e26a565c1c14c4157cb45 \
              -s test-secret \
              -n resolver \
              -k /home/ubuntu/.ara/keyrings/test-keyring.pub

{
  "@context": "https://w3id.org/did/v1",
  "id": "did:ara:4d7eba2809e627168054cae10a3a08fbdb9f5d58cd0e26a565c1c14c4157cb45",
  "publicKey": [
    {
      "id": "did:ara:4d7eba2809e627168054cae10a3a08fbdb9f5d58cd0e26a565c1c14c4157cb45#owner",
      "type": "Ed25519VerificationKey2018",
      "owner": "did:ara:4d7eba2809e627168054cae10a3a08fbdb9f5d58cd0e26a565c1c14c4157cb45",
      "publicKeyHex": "4d7eba2809e627168054cae10a3a08fbdb9f5d58cd0e26a565c1c14c4157cb45",
      "publicKeyBase58": "6DWUK3mwZEGEBjazCWxURuLKgtw3BH8dEs4QfQCJxK32",
      "publicKeyBase64": "E1+uigJ5icWgFTK4Qo6CPvbn11YzQ4mpWXBwUxBV8tF"
    },
    {
      "id": "did:ara:4d7eba2809e627168054cae10a3a08fbdb9f5d58cd0e26a565c1c14c4157cb45#eth",
      "type": "Secp256k1VerificationKey2018",
      "owner": "did:ara:4d7eba2809e627168054cae10a3a08fbdb9f5d58cd0e26a565c1c14c4157cb45",
      "publicKeyHex": "6cc2eae7aa46f4fa81e06478b55db6e104e3cca5fbd30fef6254673475ce4b9c835ef60b1cf50bfe2d6c9112f6d8991634bc0027b63668906ff0cd11da06936a",
      "publicKeyBase58": "3B7yqU1AUBJ3d9o1pQ28pzQFd8Am7MJ75UaJV4ecbWWAphwV8bjL9YkuZgCVxkbB68tMd2CEhnHoAZtDAse1LeEm",
      "publicKeyBase64": "Bswurnqkb0+oHgZHi1XbbhBOPMpfvTD+9iVGc0dc5LnINe9gsc9Qv+LWyREvbYmRY0vAAntjZokG/wzRHaBpNq"
    }
  ],
  "authentication": [
    {
      "publicKey": "did:ara:4d7eba2809e627168054cae10a3a08fbdb9f5d58cd0e26a565c1c14c4157cb45#owner",
      "type": "Ed25519SignatureAuthentication2018"
    },
    {
      "publicKey": "did:ara:4d7eba2809e627168054cae10a3a08fbdb9f5d58cd0e26a565c1c14c4157cb45#eth",
      "type": "Secp256k1SignatureAuthentication2018"
    }
  ],
  "service": [],
  "created": "2018-09-20T18:05:49.347Z",
  "updated": "2018-09-20T18:05:49.347Z",
  "proof": {
    "type": "Ed25519VerificationKey2018",
    "nonce": "9bfb9a6a2c96a5c8fb579b6906e4d7eba93da51945e9923db15fa89493db79d9",
    "domain": "ara",
    "created": "2018-09-20T18:05:49.351Z",
    "creator": "did:ara:4d7eba2809e627168054cae10a3a08fbdb9f5d58cd0e26a565c1c14c4157cb45#owner",
    "signatureValue": "f1bfaaed64ca2c19c1d25b3f9af31dc3b8a78cd2af9e73a218c3c76e0ac3d2fbd0656aaf4a00db6a4721132625cc2d9fe5e766fa07f3b93223d8cbaac7b4870b"
  }
}
```

<a name="aid-list"></a>
### 4. `aid list`
Lists all identities present locally in a given path. Defaults to the Ara root folder.

```sh
$ aid list -h
usage: aid list [-D] [options]

List Options:
  --path, -p  Path to look for identities

General Options:
  --help, -h     Show this help message
  --debug, -D    Enable debug output
  --version, -V  Show program version
```

#### Example
```
$ aid list
did:ara:4d7eba2809e627168054cae10a3a08fbdb9f5d58cd0e26a565c1c14c4157cb45
did:ara:a5619aac8ea814a3e0e3b50e54493a3933ddf0418e3da892fd2bfd1240d1b3ac
did:ara:eafe6299d7d5c286bb50599f20efcd9906205ca772842242b0141f5c263ae7c0
```

<a name="aid-whoami"></a>
### 5. `aid whoami`
Displays the default Ara ID Environment variable. Returns null is the environment variable is not set. Set the environment variable in [rc.js](https://github.com/AraBlocks/ara-identity/blob/master/rc.js).

```sh
$ aid whoami -h
usage: aid whoami [-D] [options]

Resolution Options:
  --cache, -C    Enable or disable cache  [boolean] [default: true]
  --timeout, -t  Resolution timeout

General Options:
  --help, -h     Show this help message
  --debug, -D    Enable debug output
  --version, -V  Show program version
```

#### Example
```
$ aid whoami
did:ara:4d7eba2809e627168054cae10a3a08fbdb9f5d58cd0e26a565c1c14c4157cb45
```

<a name="aid-recover"></a>
### 6. `aid recover`
Recover a lost Ara ID by providing a valid bip39 mnemonic provided during creation.

```
$ aid recover -h
usage: aid [-D] recover [options]

Recovery Options:
  --mnemonic, -m  Valid bip39 mnemonic  [required]

General Options:
  --help, -h     Show this help message
  --debug, -D    Enable debug output
  --version, -V  Show program version
```

#### Example
```
$ aid recover -m 'glad kangaroo coyote rich detail grief matrix spirit jeans owner heart net'
? Your identity's keystore will be secured by a passphrase after recovery.
Please provide a passphrase. Do not forget this as it will never be shown to you.
Passphrase: [hidden]
 ara: info:  Identity recovered : did:ara:c293cfc3f1bb21c5dec7e6273961aa2e3565f3db4d896851dd13612b02918478
 ara: warn:  Will write identity file: ddo.json
 ara: warn:  Will write identity file: keystore/eth
 ara: warn:  Will write identity file: keystore/ara
 ara: warn:  Will write identity file: schema.proto
 ara: warn:  Will write identity file: identity
 ara: info:  Identity recovered successfully.
```

<a name="aid-keystore-dump"></a>
### aid keystore-dump
Print eth or ara private key for a given an Ara ID. Requires a password for verification.

```
$ aid keystore-dump -h
usage: aid keystore-dump [-D] [options]

Positionals:
  did  [default: "did:ara:4d7eba2809e627168054cae10a3a08fbdb9f5d58cd0e26a565c1c14c4157cb45"]
  type  [default: "eth"]

Options:
  --path, -p  Path to look for did directory
  --file

General Options:
  --help, -h     Show this help message
  --debug, -D    Enable debug output
  --version, -V  Show program version
```

#### Example (Ara keystore)
```
$ aid keystore-dump did:ara:c293cfc3f1bb21c5dec7e6273961aa2e3565f3db4d896851dd13612b02918478 ara
? Please enter the passphrase associated with the identity.
Passphrase: [hidden]

 ara: info:  Ara private key: 1845786828b7dfc7273d10617899306476756385bab550214647b8bd......
```

#### Example (Eth keystore)
```
$ aid keystore-dump did:ara:c293cfc3f1bb21c5dec7e6273961aa2e3565f3db4d896851dd13612b02918478 eth
? Please enter the passphrase associated with the identity.
Passphrase: [hidden]

 ara: info:  Ara ID Ethereum private key: b50955c58c7e773da62b85e0e6a38f5c2283f4bfdad7d7ddaaa9d8b43f21991a

```
