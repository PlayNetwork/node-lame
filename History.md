1.4.2 / 2017-02-07
==================

* adjusted decoder control flow for readability
* exposed `close` method to cleanup resources used by decoder
* added `id3` option (defaults to `false`) to constructor; when true, ID3 tags are read

1.4.1 / 2016-07-29
==================

* package: removed "readable-stream"
* build target set to "Release"

1.4.0 / 2016-05-31
==================

* dependency: update "mpg123" to v1.22.4

1.3.0 / 2016-05-30
==================

  * package: update "bindings" to v1.2.1
  * package: update "debug" to v2.2.0
  * package: update "nan" to v2.3.3
  * package: update "readable-stream" to v2.1.4

1.2.3 / 2015-09-08
==================

  * add config files for freebsd (#55, @antxxxx)
  * package: add "license" property (#54, @TimothyGu)
  * package: upgrade "nan" to v2.x (#57, @FlatIO)
  * travis: implement `sudo: false`

1.2.2 / 2015-05-01
==================

  * encoder: fix encoder memory leak (#49, @gierschv)
  * README: fix example syntax (#48, @gierschv)
  * package: update "nan" to v1.8.4

1.2.1 / 2015-04-09
==================

  * package: update "nan" to v1.7.0

1.2.0 / 2015-03-06
==================

  * node 0.12 support
  * package: update "nan" to v1.6.2
  * travis: test node v0.11.x
  * Build with NodeWebkit 0.11.x

1.1.2 / 2015-01-13
==================

  * package: allow any "debug" v2
  * Add support for node 0.11.13 via nan (#34, @yhbyun)

1.1.1 / 2014-07-28
==================

  * travis: don't test node v0.6, v0.9
  * travis: test node v0.10, v0.11
  * package: update all dependency versions
  * README: use svg for Travis badge
  * examples: fix require() call in mp3player.js example
  * encoder: added support for stereo modes (#29, @benjamine)
  * decoder: never output NUL bytes in the ID3 strings
  * decoder, encoder: always use "readable-stream"

1.1.0 / 2014-04-28
==================

  * encoder: added support for mono audio (`channels: 1`, #26)
  * encoder: better `pcm_type` handling
