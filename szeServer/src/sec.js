var bcrypt = require('bcryptjs');

exports.generateCryptHash = function(password, cb) {

	bcrypt.genSalt(8, function(err, salt) {
		bcrypt.hash(password, salt, function(err, hash) {
			return cb(err, hash);
		});
	});
};

exports.comparePassword = function(password, hash, cb) {

	bcrypt.compare(password, hash, function(err, matches) {

		if (err)
			return cb(false);
		else
			return cb(matches);
	});
};
