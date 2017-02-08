'use strict';

const
	stream = require('stream'),
	util = require('util'),

	debug = require('debug')('lame:decoder'),

	binding = require('./bindings'),

	SAFE_BUFFER_LENGTH = binding.mpg123_safe_buffer();

// one-time initialization calls
binding.mpg123_init();
process.once('exit', binding.mpg123_exit);

function readDecodedData (decoder, done) {
	// read decoded bytes from the Decoder into a buffer
	let decodedBytes = new Buffer(SAFE_BUFFER_LENGTH);

	return binding.mpg123_read(
		decoder.handle,
		decodedBytes,
		decodedBytes.length,
		(readResult, bytesRead, meta) => {
			debug(
				'_transform(): mpg123_read(): result %d, %d bytes read, meta %d',
				readResult,
				bytesRead,
				meta);

			// bitwise operator on meta to determine if ID3 info is available
			if (meta & binding.MPG123_NEW_ID3) {
				debug('_transform(): MPG123_NEW_ID3');
				readID3Info(decoder);
			}

			if (bytesRead > 0) {
				if (decodedBytes.length !== bytesRead) {
					debug(
						'_transform(): mpg123_read(): slicing output buffer from %d to %d',
						decodedBytes.length,
						bytesRead);

					decodedBytes = decodedBytes.slice(0, bytesRead);
				}

				// write decoded bytes to underlying stream
				decoder.push(decodedBytes);
			}

			if (readResult === binding.MPG123_DONE) {
				debug('_transform(): decoding completed');
				return done();
			}

			if (readResult === binding.MPG123_NEED_MORE) {
				debug('_transform(): decoder needs additional data');
				return done();
			}

			if (readResult === binding.MPG123_NEW_FORMAT) {
				let format = binding.mpg123_getformat(decoder.handle);
				debug('_transform(): new format: %o', format);
				decoder.emit('format', format);

				return readDecodedData(decoder, done);
			}

			if (readResult !== binding.MPG123_OK) {
				return done(
					new Error([
						'_transform(): mpg123_read(): failed with code',
						readResult].join(' ')));
			}

			debug('_transform(): mpg123_read(): continuing to read decoded data');
			return readDecodedData(decoder, done);
		});
}

function readID3Info (decoder) {
	return binding.mpg123_id3(decoder.handle, (id3Result, id3Info) => {
		if (id3Result !== binding.MPG123_OK) {
			return decoder.emit(
				new Error(['mpg123_id3() failed ', id3Result].join('')));
		}

		let eventName = ['id3v', id3Info.tag ? 1 : 2].join('');

		return decoder.emit(eventName, id3Info);
	});
}

function Decoder (options) {
	if (!(this instanceof Decoder)) {
		return new Decoder(options);
	}

	// super
	stream.Transform.call(this, options);

	// create new binding instance for decoding
	this.handle = binding.mpg123_new(options ? options.decoder : null);

	if (!Buffer.isBuffer(this.handle)) {
		throw new Error([
			'decoder: unexpected return value: mpg123_new()',
			this.mediaHandle].join(' '));
	}

	let result = binding.mpg123_open_feed(this.handle);

	if (binding.MPG123_OK !== result) {
		throw new Error([
			'decoder: mpg123_open_feed failed',
			result].join(' '));
	}

	debug('created new Decoder instance');

	// capture the source stream on pipe
	this.once('pipe', (source) => {
		debug('instance of Decoder is piped into from source stream');
		this.source = source;
	});
}

Decoder.prototype._transform = function (chunk, encoding, done) {
	debug('_transform(): %d bytes', chunk.length);
	let self = this;

	// feed the source buffer into the Decoder
	return binding.mpg123_feed(this.handle, chunk, chunk.length, (feedResult) => {
		debug('_transform(): mpg123_feed(): return code %d', feedResult);

		if (feedResult !== binding.MPG123_OK) {
			return done(
				new Error(['_transform(): mpg123_feed(): failed', feedResult].join(' ')));
		}

		return readDecodedData(self, done);
	});
};

// Decoder inherits from Transform
util.inherits(Decoder, stream.Transform);

module.exports = Decoder;
