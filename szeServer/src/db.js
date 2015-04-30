// Http error codes
var HTTP_NOT_FOUND = 404;
var HTTP_SERVER_ERROR = 500;

// for the Mysql connection
var mysql = require('mysql');

// the connection
var connection = mysql.createConnection({
	host : 'localhost',
	user : 'root',
	password : 'root',
	database : 'test'
});

// Connect to the db
exports.init = function(cb) {
	connection.connect(function(err) {
		if (!err) {
			console.log("Connected to MySql database");
			cb(true);
		} else if (err) {
			console.log(err);
			cb(false);
		}
	});
};

// Function to execute the sqls
execStatement = function(stm, params, cb) {

	 console.log(stm, params);

	connection.query(stm, params, function(err, results) {

		if (err) {
			console.log(err);
			results = HTTP_SERVER_ERROR;
		}
		if (cb) {
			cb(results);
		}
	});

};



//insert a new sim
exports.insertSim = function (simNumber,simTelefonNumber,cb){
	
	execStatement('insert into sims (sim_number,sim_telefon_number) values (?,?)',[simNumber,simTelefonNumber,cb], function (res) {
		if(res === HTTP_SERVER_ERROR){
			cb(HTTP_SERVER_ERROR);
			return;
		}
		
		var simId = res.simId;
		
		console.log('Inserted sim with id: '+simId);
	});
};

//update the sim
exports.updateSim = function (simNumber,simTelefonNumber,simId,cb){
	
	execStatement('update sims set sim_number = ?, sim_telefon_number = ? where sim_id = ?',[simNumber,simTelefonNumber,simId,cb], function (res) {
		if(res === HTTP_SERVER_ERROR){
			cb(HTTP_SERVER_ERROR);
			return;
		}
				
		console.log('Updated sim with id: '+simId);
	});
};

//delete the sim
exports.deleteSim = function (simId,cb){
	
	execStatement('delete from sims where sim_id = ?',[simId,cb],function(res){
		if(res === HTTP_SERVER_ERROR){
			cb(HTTP_SERVER_ERROR);
			return;
		}
		console.log('Deleted sim with id: '+simId);
	});
	
};


//get all sim
exports.getAllSim = function (cb){
	
	execStatement('select sim_id, sim_number, sim_telefon_number from sims',[cb], function(res){
		if (res.length === 0) {
			cb(0);
			return;
		}
		cb(res);
	});
};

//get sim by id
exports.getSimById = function (simId,cb){
	
	execStatement('select sim_id, sim_number, sim_telefon_number from sims where sim_id = ?',[simId,cb], function(res){
		if (res.length === 0) {
			cb(0);
			return;
		}
		
		//cb(res);
		var simID = res[0].sim_id;
		var simNo = res[0].sim_number;
		var simPhoneNumber = res[0].sim_telefon_number;

		cb({
			'SIM_ID' : simID,
			'SIM_NO' : simNo,
			'SIM_PHONE_NUMBER' : simPhoneNumber
		});
		
	});
};


// insert a new device
exports.insertDevice = function(deviceIMEI,cb){
	execStatement('insert into devices (device_imei) values (?)',[deviceIMEI,cb], function(res){
			if(res === HTTP_SERVER_ERROR){
				cb(HTTP_SERVER_ERROR);
				return;
			}
			
			var deviceId = res.deviceId;
			
			console.log('Inserted device with id: '+deviceId);
	});
};


//update the device
exports.updateDevice = function(deviceId,deviceImei,simId,cb){
	execStatement('update devices set device_imei = ?, sim_id = ? where device_id = ?',[deviceImei,simId,deviceId,cb], function(res){
			if(res === HTTP_SERVER_ERROR){
				cb(HTTP_SERVER_ERROR);
				return;
			}
			
			var deviceId = res.deviceId;
			
			
			console.log('Updated device with id: '+deviceId);
	});
};

//delete the device
exports.deleteDevice = function (deviceId,cb){
	
	execStatement('delete from devices where device_id = ?',[deviceId,cb],function(res){
		if(res === HTTP_SERVER_ERROR){
			cb(HTTP_SERVER_ERROR);
			return;
		}
		console.log('Deleted device with id: '+deviceId);
	});
	
};

//get all device
exports.getAllDevice = function (cb){
	
	execStatement('select device_id, device_imei, sim_id from devices',[cb], function(res){
		if (res.length === 0) {
			cb(0);
			return;
		}
		cb(res);
	});
};

//get all deviceID****
exports.getAllDeviceId = function (cb){
	
	execStatement('select device_id from devices',[cb], function(res){
		if (res.length === 0) {
			cb(0);
			return;
		}
		cb(res);
	});
};

//get device by id
exports.getDeviceById = function (deviceId,cb){
	
	execStatement('select device_id, device_imei, sim_id from devices where device_id = ?',[deviceId,cb], function(res){
		if (res.length === 0) {
			cb(0);
			return;
		}
		//cb(res);
		var deviceId = res[0].deviceId;
		
		//cb(res);
		var simID = res[0].sim_id;
		var deviceIMEI = res[0].device_imei;

		cb({
			'DEVICE_ID' : deviceId,
			'SIM_ID' : simID,
			'DEVICE_IMEI' : deviceIMEI
		});
	});
};

// insert a new user
// username,pass,email,deviceid(nullable)
exports.insertUser = function(userName,userGivenName,userSurName, userPassword, userEmail, roleId, cb) {

	execStatement('insert into users ( user_name ,user_given_name,user_sur_name,user_password, user_email, role_id) values ( ? , ? , ?,  ? , ? ,?) ', [ userName,userGivenName, userSurName,userPassword, userEmail, roleId, cb], function(res) {

				if (res === HTTP_SERVER_ERROR) {
					cb(HTTP_SERVER_ERROR);
					return;
				}


				var userId = res.insertId;
				

				console.log('Inserted user with id: '+userId);
			});

};


// mod the user
// username,pass,email,deviceid(nullable)
exports.updateUser = function(userId,userGivenName,userSurName,userPassword, userEmail, deviceId , cb) {
	
	execStatement('update users set user_given_name = ?, user_sur_name = ? ,user_password = ? , user_email = ?,  device_id = ? where user_id = ?', [userGivenName,userSurName,userPassword, userEmail,deviceId,userId,cb], function(res) {

				if (res === HTTP_SERVER_ERROR) {
					cb(HTTP_SERVER_ERROR);
					return;
				}

				console.log('Updated user with id: '+userId);
			});

};

//delete the user
exports.deleteUser = function (userId,cb){
	
	execStatement('delete from users where user_id = ?',[userId,cb],function(res){
		if(res === HTTP_SERVER_ERROR){
			cb(HTTP_SERVER_ERROR);
			return;
		}
		console.log('Deleted user with id: '+userId);
	});
	
};

//get all user
exports.getAllUser = function (cb){
	
	execStatement('select user_id, user_name, user_email, device_id, role_id,user_given_name,user_sur_name from users',[cb], function(res){
		if (res.length === 0) {
			cb(0);
			return;
		}
		cb(res);
	});
};

//get user by id
exports.getUserById = function (userId,cb){
	
	execStatement('select u.user_id, u.user_name, u.user_email, u.device_id, u.role_id ,user_given_name,user_sur_name from users u where u.user_id= ?',[userId,cb], function(res){
		if (res.length === 0) {
			cb(0);
			return;
		}
		//cb(res);
		var userId = res[0].user_id;
		var hash = res[0].user_password;
		var userName = res[0].user_name;
		var userEMail = res[0].user_email;
		var userGivenName = res[0].user_given_name;
		var userSurName = res[0].user_sur_name;
		cb({
			'USER_ID' : userId,
			'HASH' : hash,
			'USERNAME' : userName,
			'USER_GIVEN_NAME' : userGivenName,
			'USER_EMAIL' : userEMail,
			'USER_SURNAME' : userSurName
		});
	});
};


//role
exports.getRoleById = function (roleId,cb){
	
	execStatement('select r.role_id, r.role_name from roles r where r.role_id= ?',[roleId,cb], function(res){
		if (res.length === 0) {
			cb(0);
			return;
		}
		cb(res);
	});
};

exports.getAllRole = function (cb){
	
	execStatement('select r.role_id, r.role_name from roles r',[cb], function(res){
		if (res.length === 0) {
			cb(0);
			return;
		}
		cb(res);
	});
};

//equip a user
exports.insertRecord = function (userId,deviceId,simId,cb) {
	
	//TODO equip the user
	execStatement('insert ',[userId,deviceId,simId,cb],function(res){
		
		
	});
}

// valid user
// if valid, then return the id and the pass
exports.getValidUserId = function(userName, userPassword, cb) {

	execStatement('select u.user_id,u.user_password from users u where u.user_name = ?', [ userName ], function(res) {

		if (res.length === 0) {
			cb(0);
			return;
		}
		//console.log('res:  '+res);

		var userId = res[0].user_id;
		var hash = res[0].user_password;

		cb({
			'USER_ID' : userId,
			'HASH' : hash
		});
	});

};


//get role id by user id
exports.getUserRoleByUserId = function(userId, cb) {
	execStatement('select u.role_id, r.role_name from users u inner join roles r on u.role_id = r.role_id where u.user_id = ?', [ userId ], function(res) {
				
		var roleId = res[0].role_id;
		var roleName = res[0].role_name;
		cb({
			'ROLE_ID' : res[0].role_id,
			'ROLE_NAME' : res[0].role_name
		});
	});
 
};
	


