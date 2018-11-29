## [0.32.5](https://github.com/AraBlocks/ara-identity/compare/0.32.4...0.32.5) (2018-11-29)


### Bug Fixes

* **protobuf/index.js:** Use browserify friendly path ([7e9dcc4](https://github.com/AraBlocks/ara-identity/commit/7e9dcc4))



## [0.32.4](https://github.com/AraBlocks/ara-identity/compare/0.32.3...0.32.4) (2018-11-29)



## [0.32.3](https://github.com/AraBlocks/ara-identity/compare/0.32.2...0.32.3) (2018-11-29)



## [0.32.2](https://github.com/AraBlocks/ara-identity/compare/0.32.1...0.32.2) (2018-11-29)



## [0.32.1](https://github.com/AraBlocks/ara-identity/compare/0.31.3...0.32.1) (2018-11-29)


### Bug Fixes

* check did.normalize input length ([af8c186](https://github.com/AraBlocks/ara-identity/commit/af8c186))
* check if method is ara first ([590d0b0](https://github.com/AraBlocks/ara-identity/commit/590d0b0))
* move inside prefix check ([789d8be](https://github.com/AraBlocks/ara-identity/commit/789d8be))
* **archive.js:** Fix duplicate peer connections ([6e15813](https://github.com/AraBlocks/ara-identity/commit/6e15813))
* **bin/ara-identity:** Fix typo ([b35b628](https://github.com/AraBlocks/ara-identity/commit/b35b628))


### Features

* **scripts/install.sh:** Add install script for binary builds ([f4246a3](https://github.com/AraBlocks/ara-identity/commit/f4246a3))



## [0.31.3](https://github.com/AraBlocks/ara-identity/compare/0.31.0...0.31.3) (2018-11-15)


### Bug Fixes

* derive wallet key ([ccd9479](https://github.com/AraBlocks/ara-identity/commit/ccd9479))
* **bin/ara-identity:** Add argument validation to keystore-dump ([d025b9d](https://github.com/AraBlocks/ara-identity/commit/d025b9d))
* **create.js:** remove log ([6b2a518](https://github.com/AraBlocks/ara-identity/commit/6b2a518))
* **ethereum/wallet.js:** make linter happy ([4f5e206](https://github.com/AraBlocks/ara-identity/commit/4f5e206))
* **ethereum/wallet.js:** replace redundant index check ([16d619e](https://github.com/AraBlocks/ara-identity/commit/16d619e))


### Features

* **ethereum/wallet.js:** derivation path for constant, optional index ([9111d14](https://github.com/AraBlocks/ara-identity/commit/9111d14))



# [0.31.0](https://github.com/AraBlocks/ara-identity/compare/0.30.3...0.31.0) (2018-11-15)


### Bug Fixes

* **bin/ara-identity:** Address PR feedback ([98be9ad](https://github.com/AraBlocks/ara-identity/commit/98be9ad))
* **bin/ara-identity:** Address PR feedback ([c9fb4aa](https://github.com/AraBlocks/ara-identity/commit/c9fb4aa))
* **create.js:** Use plain text password to encrypt web3 Eth keystore ([ba873ef](https://github.com/AraBlocks/ara-identity/commit/ba873ef))
* **ethereum/keystore.js:** Add fallback for old Ara ID's to recover method ([03c4546](https://github.com/AraBlocks/ara-identity/commit/03c4546))


### Features

* **bin/ara-identity:** Add method to retrieve web3 Ethereum keystore ([d63165f](https://github.com/AraBlocks/ara-identity/commit/d63165f))
* **bin/ara-identity:** Fix keystore-dump options ([0f31b93](https://github.com/AraBlocks/ara-identity/commit/0f31b93))



## [0.30.3](https://github.com/AraBlocks/ara-identity/compare/0.30.2...0.30.3) (2018-11-08)


### Features

* **.:** Implement porcelain 'aid.save()' ([88285e8](https://github.com/AraBlocks/ara-identity/commit/88285e8))



## [0.30.2](https://github.com/AraBlocks/ara-identity/compare/0.29.0...0.30.2) (2018-11-06)


### Bug Fixes

* **create.js:** Fix broken logic for optional contexts ([7fa68c3](https://github.com/AraBlocks/ara-identity/commit/7fa68c3))
* **rc.js:** Remove default 'whoami' property causing rc conflicts ([fa26cfd](https://github.com/AraBlocks/ara-identity/commit/fa26cfd))


### Features

* **archive:** ability to shallow archive just a ddo ([06b01f7](https://github.com/AraBlocks/ara-identity/commit/06b01f7))
* **create.js:** Use default context (that closes) if not given ([0a02654](https://github.com/AraBlocks/ara-identity/commit/0a02654))



# [0.29.0](https://github.com/AraBlocks/ara-identity/compare/0.28.1...0.29.0) (2018-10-25)


### Bug Fixes

* **bin/ara-identity:** Fix revoke method definition ([49fd578](https://github.com/AraBlocks/ara-identity/commit/49fd578))
* **bin/ara-identity:** Fix typo ([fc60365](https://github.com/AraBlocks/ara-identity/commit/fc60365))
* **bin/ara-identity:** Fix usage help ([16cba30](https://github.com/AraBlocks/ara-identity/commit/16cba30))
* **bin/ara-identity:** fix usage message ([1f777d9](https://github.com/AraBlocks/ara-identity/commit/1f777d9))
* **create.js:** add id property to service endpoints ([7e92671](https://github.com/AraBlocks/ara-identity/commit/7e92671))
* **create.js:** Add method to create service endpoints in ddo ([ef054b5](https://github.com/AraBlocks/ara-identity/commit/ef054b5))
* **create.js:** Add option to use created when revoking ([8facadb](https://github.com/AraBlocks/ara-identity/commit/8facadb))
* **create.js:** Change opts property name ([c537d4b](https://github.com/AraBlocks/ara-identity/commit/c537d4b))
* **create.js:** Fix adding service endpoints to ddo ([72b3f2c](https://github.com/AraBlocks/ara-identity/commit/72b3f2c))
* **create.js:** fix how service endpoints are added ([a917d68](https://github.com/AraBlocks/ara-identity/commit/a917d68))
* **create.js:** Fix how service endpoints are added ([933fb9e](https://github.com/AraBlocks/ara-identity/commit/933fb9e))
* **create.js:** Fix linting issues ([6dc3621](https://github.com/AraBlocks/ara-identity/commit/6dc3621))
* **create.js:** Fix revoke argument ([46317c1](https://github.com/AraBlocks/ara-identity/commit/46317c1))
* **create.js:** Fix service endpoint class argument ([98c7e7e](https://github.com/AraBlocks/ara-identity/commit/98c7e7e))
* **create.js:** Refactor code ([707f968](https://github.com/AraBlocks/ara-identity/commit/707f968))
* **revoke.js:** Add checks for password ([c177a82](https://github.com/AraBlocks/ara-identity/commit/c177a82))
* **revoke.js:** Add proper method definitio ([012d077](https://github.com/AraBlocks/ara-identity/commit/012d077))
* **revoke.js:** Make web3 context as an arguement ([7188e78](https://github.com/AraBlocks/ara-identity/commit/7188e78))
* **revoke.js:** Parse existing DDO to get publicKeys and authentication ([fe92734](https://github.com/AraBlocks/ara-identity/commit/fe92734))
* **revoke.js:** Pass the entire ddo to create() ([a58b799](https://github.com/AraBlocks/ara-identity/commit/a58b799))
* **revoke.js:** Read old DDO content to retrieve created time ([3aefeaa](https://github.com/AraBlocks/ara-identity/commit/3aefeaa))
* **revoke.js:** Refactor ddo resolving ([bfa654f](https://github.com/AraBlocks/ara-identity/commit/bfa654f))


### Features

* **bin/ara-identity:** Add revoke command to the CLI ([8f64582](https://github.com/AraBlocks/ara-identity/commit/8f64582))
* **create.js:** Add revoke property to DIDDocument creation ([96140bb](https://github.com/AraBlocks/ara-identity/commit/96140bb))
* **create.js:** Allow arbitrary values in service endpoints ([0565199](https://github.com/AraBlocks/ara-identity/commit/0565199))
* **index.js:** Add revoke() method ([9893b20](https://github.com/AraBlocks/ara-identity/commit/9893b20))
* **revoke.js:** Add method to revoke identities ([9cd052b](https://github.com/AraBlocks/ara-identity/commit/9cd052b))



## [0.28.1](https://github.com/AraBlocks/ara-identity/compare/0.28.0...0.28.1) (2018-10-22)



# [0.28.0](https://github.com/AraBlocks/ara-identity/compare/0.27.0...0.28.0) (2018-10-15)



# [0.27.0](https://github.com/AraBlocks/ara-identity/compare/0.26.0...0.27.0) (2018-10-15)



# [0.26.0](https://github.com/AraBlocks/ara-identity/compare/0.25.0...0.26.0) (2018-10-15)



# [0.25.0](https://github.com/AraBlocks/ara-identity/compare/0.24.0...0.25.0) (2018-10-11)


### Bug Fixes

* **create.js:** Check validity of mnemonic ([9b58366](https://github.com/AraBlocks/ara-identity/commit/9b58366))



# [0.24.0](https://github.com/AraBlocks/ara-identity/compare/0.23.0...0.24.0) (2018-10-04)


### Bug Fixes

* **README.md:** Address PR feedback ([596f209](https://github.com/AraBlocks/ara-identity/commit/596f209))
* **README.md:** Address PR feedback ([8867f9e](https://github.com/AraBlocks/ara-identity/commit/8867f9e))
* **README.md:** Fix method error check rule ([292902d](https://github.com/AraBlocks/ara-identity/commit/292902d))


### Features

* **archive/resolve:** added keyringOpts extraction from ararc ([03823ac](https://github.com/AraBlocks/ara-identity/commit/03823ac))



# [0.23.0](https://github.com/AraBlocks/ara-identity/compare/0.22.0...0.23.0) (2018-10-01)


### Features

* **bin/aid:** Add quiet mode to create ([1037144](https://github.com/AraBlocks/ara-identity/commit/1037144))



# [0.22.0](https://github.com/AraBlocks/ara-identity/compare/0.21.0...0.22.0) (2018-09-19)



# [0.21.0](https://github.com/AraBlocks/ara-identity/compare/0.20.0...0.21.0) (2018-09-19)



# [0.20.0](https://github.com/AraBlocks/ara-identity/compare/0.19.0...0.20.0) (2018-09-19)



# [0.19.0](https://github.com/AraBlocks/ara-identity/compare/0.18.0...0.19.0) (2018-09-19)



# [0.18.0](https://github.com/AraBlocks/ara-identity/compare/0.17.0...0.18.0) (2018-09-19)



# [0.17.0](https://github.com/AraBlocks/ara-identity/compare/0.16.0...0.17.0) (2018-09-19)


### Bug Fixes

* **archive.js:** Fix broken replication streams ([8799418](https://github.com/AraBlocks/ara-identity/commit/8799418))
* **fs.js:** Fix broken FS api over the network ([668ba28](https://github.com/AraBlocks/ara-identity/commit/668ba28))



# [0.16.0](https://github.com/AraBlocks/ara-identity/compare/0.15.1...0.16.0) (2018-09-18)



## [0.15.1](https://github.com/AraBlocks/ara-identity/compare/0.15.0...0.15.1) (2018-09-18)



# [0.15.0](https://github.com/AraBlocks/ara-identity/compare/0.14.0...0.15.0) (2018-09-18)



# [0.14.0](https://github.com/AraBlocks/ara-identity/compare/0.13.0...0.14.0) (2018-09-18)


### Features

* **bin/ara-identity:** Add CLI command keystore-dump ([7b0241a](https://github.com/AraBlocks/ara-identity/commit/7b0241a))
* **did.js:** Add getIdentifier method ([79b3b76](https://github.com/AraBlocks/ara-identity/commit/79b3b76))



# [0.13.0](https://github.com/AraBlocks/ara-identity/compare/0.12.0...0.13.0) (2018-09-14)


### Bug Fixes

* **resolve.js:** Fix resolution race to error ([cfa2227](https://github.com/AraBlocks/ara-identity/commit/cfa2227))



# [0.12.0](https://github.com/AraBlocks/ara-identity/compare/0.11.1...0.12.0) (2018-09-14)


### Features

* **bin/ara-identity:** Add CLI command keystore-dump ([5e516f4](https://github.com/AraBlocks/ara-identity/commit/5e516f4))
* **resolve.js:** Introduce faster and concurrenty resolution ([17b7058](https://github.com/AraBlocks/ara-identity/commit/17b7058))



## [0.11.1](https://github.com/AraBlocks/ara-identity/compare/0.10.0...0.11.1) (2018-09-13)


### Features

* **did.js:** Introduce did.normalize() ([564a910](https://github.com/AraBlocks/ara-identity/commit/564a910))
* **fs.js:** Consolidated/abstract FS API for identity files ([5e3abad](https://github.com/AraBlocks/ara-identity/commit/5e3abad))



# [0.10.0](https://github.com/AraBlocks/ara-identity/compare/0.9.0...0.10.0) (2018-09-13)



# [0.9.0](https://github.com/AraBlocks/ara-identity/compare/0.8.0...0.9.0) (2018-09-13)


### Bug Fixes

* **archive.js:** Fix broken archive logic ([8a2ee84](https://github.com/AraBlocks/ara-identity/commit/8a2ee84))



# [0.8.0](https://github.com/AraBlocks/ara-identity/compare/0.7.1...0.8.0) (2018-09-11)


### Features

* **bin/ara-identity:** Add recover to the aid CLI ([d640d9e](https://github.com/AraBlocks/ara-identity/commit/d640d9e))
* **bin/ara-identity:** Address PR feedback ([2d935b2](https://github.com/AraBlocks/ara-identity/commit/2d935b2))
* **bin/ara-identity:** Change recover CLI's console logs ([401d4d9](https://github.com/AraBlocks/ara-identity/commit/401d4d9))
* **resolve.js:** Change remote response format to match with local resolve ([e47b251](https://github.com/AraBlocks/ara-identity/commit/e47b251))



## [0.7.1](https://github.com/AraBlocks/ara-identity/compare/0.7.0...0.7.1) (2018-09-11)



# [0.7.0](https://github.com/AraBlocks/ara-identity/compare/0.6.0...0.7.0) (2018-09-11)


### Features

* **index.js:** Fix PR feedback ([25af5f0](https://github.com/AraBlocks/ara-identity/commit/25af5f0))
* **replicate.js:** Add proper error handling ([de15cb2](https://github.com/AraBlocks/ara-identity/commit/de15cb2))
* **replicate.js:** Initial Method Commit ([e3dbf30](https://github.com/AraBlocks/ara-identity/commit/e3dbf30))
* **replicate.js:** Linting & add timeouts ([5698de3](https://github.com/AraBlocks/ara-identity/commit/5698de3))
* **replicate.js:** Remove redundant method ([8ff8d7f](https://github.com/AraBlocks/ara-identity/commit/8ff8d7f))
* **replicate.js:** Simplify replication to only use cfs.discovery ([2fd1930](https://github.com/AraBlocks/ara-identity/commit/2fd1930))
* **replicate.js:** Update implementation ([5221e98](https://github.com/AraBlocks/ara-identity/commit/5221e98))



# [0.6.0](https://github.com/AraBlocks/ara-identity/compare/0.5.1...0.6.0) (2018-09-10)


### Features

* **recover.js:** To recover an Ara ID using a Bip39 mnemonic ([b5930e0](https://github.com/AraBlocks/ara-identity/commit/b5930e0))
* **test/recover.js:** Change wallet test methods ([3a84554](https://github.com/AraBlocks/ara-identity/commit/3a84554))



## [0.5.1](https://github.com/AraBlocks/ara-identity/compare/0.4.0...0.5.1) (2018-09-06)



# [0.4.0](https://github.com/AraBlocks/ara-identity/compare/0.3.1...0.4.0) (2018-08-28)


### Features

* **create.js:** Store Ethereum public key in DDO ([9f75f41](https://github.com/AraBlocks/ara-identity/commit/9f75f41))



## [0.3.1](https://github.com/AraBlocks/ara-identity/compare/0.3.0...0.3.1) (2018-08-22)



# [0.3.0](https://github.com/AraBlocks/ara-identity/compare/0.2.0...0.3.0) (2018-08-22)



# [0.2.0](https://github.com/AraBlocks/ara-identity/compare/0.1.0...0.2.0) (2018-08-22)



# [0.1.0](https://github.com/AraBlocks/ara-identity/compare/fc4cbe8...0.1.0) (2018-08-21)


### Bug Fixes

* rc keystore, no buffer assumption in recover ([582fc26](https://github.com/AraBlocks/ara-identity/commit/582fc26))
* remove keys from rc, have eth resolve to keystore ([f9cfbd3](https://github.com/AraBlocks/ara-identity/commit/f9cfbd3))
* **create.js:** PR feedback changes ([34bcc56](https://github.com/AraBlocks/ara-identity/commit/34bcc56))
* **create.js:** PR feedback changes ([bf52557](https://github.com/AraBlocks/ara-identity/commit/bf52557))
* **create.js:** remove old log ([18468b9](https://github.com/AraBlocks/ara-identity/commit/18468b9))
* **create.js:** remove old log ([880a750](https://github.com/AraBlocks/ara-identity/commit/880a750))
* **create.js:** Typo ([2caf4dc](https://github.com/AraBlocks/ara-identity/commit/2caf4dc))
* **ethereum/keystore.js:** fix crypto call ([e23e374](https://github.com/AraBlocks/ara-identity/commit/e23e374))
* **resolve.js:** update incorrect import ([d0dff59](https://github.com/AraBlocks/ara-identity/commit/d0dff59))


### Features

* **.ararc:** Add .ararc for tests/etc ([63cfb3e](https://github.com/AraBlocks/ara-identity/commit/63cfb3e))
* **archiver.js:** Initial archiver implementation ([aa50af4](https://github.com/AraBlocks/ara-identity/commit/aa50af4))
* **bin/ara-identity:** Change CLI prompt ([b189f74](https://github.com/AraBlocks/ara-identity/commit/b189f74))
* **bin/ara-identity:** Introduce ara-identity command ([830a82f](https://github.com/AraBlocks/ara-identity/commit/830a82f))
* **bin/ara-identity:** Introduce import command ([19b2df4](https://github.com/AraBlocks/ara-identity/commit/19b2df4))
* **create.js:** add authentication ddo support ([d80a8ef](https://github.com/AraBlocks/ara-identity/commit/d80a8ef))
* **create.js:** Add eth account to identity object ([a9fb322](https://github.com/AraBlocks/ara-identity/commit/a9fb322))
* **create.js:** Add mnemonic passphrase generation ([8b61b89](https://github.com/AraBlocks/ara-identity/commit/8b61b89))
* **create.js:** allow for additional publicKeys in document ([e00c71e](https://github.com/AraBlocks/ara-identity/commit/e00c71e))
* **ddo.js:** Add initial ddo.js implementation ([07dea5e](https://github.com/AraBlocks/ara-identity/commit/07dea5e))
* **did.js:** Add initial did.js implementation ([649dd28](https://github.com/AraBlocks/ara-identity/commit/649dd28))
* **ethereum/entropy.js:** Initial entropy implementation ([fc4cbe8](https://github.com/AraBlocks/ara-identity/commit/fc4cbe8))
* **ethereum/keystore.js:** Add initial keystore implementation ([d555e1c](https://github.com/AraBlocks/ara-identity/commit/d555e1c))
* **ethereum/wallet.js:** Add Non-zero buffer check ([60c7851](https://github.com/AraBlocks/ara-identity/commit/60c7851))
* **key-pair.js:** Add key-pair.js implementation ([1a704a4](https://github.com/AraBlocks/ara-identity/commit/1a704a4))
* **keystore/account.js:** Changing ethereum account creation ([88fb50a](https://github.com/AraBlocks/ara-identity/commit/88fb50a))
* **list.js:** Fix error handling ([2c6980a](https://github.com/AraBlocks/ara-identity/commit/2c6980a))
* **list.js:** Make list as a separate module and add it to the CLI ([1aca918](https://github.com/AraBlocks/ara-identity/commit/1aca918))
* **list.js:** Refactor code ([d5bb112](https://github.com/AraBlocks/ara-identity/commit/d5bb112))
* **list.js:** Refactor code to make it asynchronous ([072122a](https://github.com/AraBlocks/ara-identity/commit/072122a))
* **protobuf/:** Add Identity message ([be9bb89](https://github.com/AraBlocks/ara-identity/commit/be9bb89))
* **protobuf/:** Add Keys and KeyPair message types ([435d6f9](https://github.com/AraBlocks/ara-identity/commit/435d6f9))
* **protobuf/:** Introduce Keystore protocol buffer ([41173df](https://github.com/AraBlocks/ara-identity/commit/41173df))
* **rc.js:** Add runtime configuration ([168af32](https://github.com/AraBlocks/ara-identity/commit/168af32))
* **resolve.js:** Change Error msg ([836b134](https://github.com/AraBlocks/ara-identity/commit/836b134))
* **resolve.js:** change how opt checks are done ([e383aab](https://github.com/AraBlocks/ara-identity/commit/e383aab))
* **resolve.js:** fix resolve() method bug(cache=true) ([e77363b](https://github.com/AraBlocks/ara-identity/commit/e77363b))
* **resolve.js:** Fix typo ([262cc3f](https://github.com/AraBlocks/ara-identity/commit/262cc3f))
* **resolve.js:** Fixing resolve method ([af2ebc8](https://github.com/AraBlocks/ara-identity/commit/af2ebc8))
* **resolve.js:** linting ([07b8a7e](https://github.com/AraBlocks/ara-identity/commit/07b8a7e))
* **resolve.js:** lintint ([d4ee5ac](https://github.com/AraBlocks/ara-identity/commit/d4ee5ac))
* **resolve.js:** Refactor resolve method to follow same standard ([93ee3dd](https://github.com/AraBlocks/ara-identity/commit/93ee3dd))
* **resolve.js:** remove redundant console logs ([3e7914a](https://github.com/AraBlocks/ara-identity/commit/3e7914a))
* **resolve.js:** remove redundant method ([2210609](https://github.com/AraBlocks/ara-identity/commit/2210609))
* **resolve.js:** Update method for both CLI & programmatic usage ([8d4419f](https://github.com/AraBlocks/ara-identity/commit/8d4419f))
* **resolve.js:** Use negation for opt checks ([1d6a827](https://github.com/AraBlocks/ara-identity/commit/1d6a827))
* **secrets.js:** Add identity secrets encryption/decryption ([9fe406e](https://github.com/AraBlocks/ara-identity/commit/9fe406e))
* **test/list.js:** Fix build issue ([50953d3](https://github.com/AraBlocks/ara-identity/commit/50953d3))
* **util.js:** add checks to writeIdentity method ([4e4484b](https://github.com/AraBlocks/ara-identity/commit/4e4484b))
* **util.js:** add function to write ARA identity files to disc ([a560354](https://github.com/AraBlocks/ara-identity/commit/a560354))
* **util.js:** Add list functionality of identities ([656dea4](https://github.com/AraBlocks/ara-identity/commit/656dea4))
* **util.js:** Add test cases & fix error msg ([2896a37](https://github.com/AraBlocks/ara-identity/commit/2896a37))
* **util.js:** exported identity path generation ([b4293c7](https://github.com/AraBlocks/ara-identity/commit/b4293c7))
* **util.js:** fix linting issues ([c66f13f](https://github.com/AraBlocks/ara-identity/commit/c66f13f))
* Add test cases for HD wallet creation ([83b5918](https://github.com/AraBlocks/ara-identity/commit/83b5918))
* add test cases for mnemonic passphrase ([e9bd450](https://github.com/AraBlocks/ara-identity/commit/e9bd450))
* Fix Error message typo ([c8d11f5](https://github.com/AraBlocks/ara-identity/commit/c8d11f5))
* fix linting issues ([6947782](https://github.com/AraBlocks/ara-identity/commit/6947782))
* Fix linting issues ([b1f32ac](https://github.com/AraBlocks/ara-identity/commit/b1f32ac))
* fix typo ([05bf2d9](https://github.com/AraBlocks/ara-identity/commit/05bf2d9))
* fix unit test cases ([0b00107](https://github.com/AraBlocks/ara-identity/commit/0b00107))
* load ethereum account based on privateKey ([c5589b2](https://github.com/AraBlocks/ara-identity/commit/c5589b2))
* refactor code ([2704dcc](https://github.com/AraBlocks/ara-identity/commit/2704dcc))
* Refactor code according to PR feedback ([8fa7819](https://github.com/AraBlocks/ara-identity/commit/8fa7819))
* Refactor code according to PR feedback ([b618fac](https://github.com/AraBlocks/ara-identity/commit/b618fac))
* Refactor code and fix console message ([4f160e4](https://github.com/AraBlocks/ara-identity/commit/4f160e4))
* **util.js:** Initial utils ([9de3290](https://github.com/AraBlocks/ara-identity/commit/9de3290))
* **wallet.js:** Change Wallet implementation to use HD wallets ([8ca33cc](https://github.com/AraBlocks/ara-identity/commit/8ca33cc))
* Refactor list.js according to PR feedback ([88cedd6](https://github.com/AraBlocks/ara-identity/commit/88cedd6))
* remove extra line ([6860d37](https://github.com/AraBlocks/ara-identity/commit/6860d37))
* Remove unwanted key file ([3875370](https://github.com/AraBlocks/ara-identity/commit/3875370))
* update account load to use wallet privateKey, load testing ([43dd1fa](https://github.com/AraBlocks/ara-identity/commit/43dd1fa))



