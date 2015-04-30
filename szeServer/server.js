//paths, urls
var ROOT = '/';
var INDEX = '/index';
var MENUS = '/menus';
var LOGIN = '/login';
var LOGOUT = '/logout';
var REGISTRATION = '/signup';
var ALL = '/*';

//if we need only the data
//for the tests
var SEPARATOR = '_';

//workflow urls
var SAVE_CONFIGURATION = '/saveconfiguration'
var INSERT_USER = '/insertuser';
var INSERT_DEVICE = '/insertdevice';
var INSERT_SIM = '/insertsim';
var UPDATE_USER = '/updateuser';
var UPDATE_DEVICE = '/updatedevice';
var UPDATE_SIM = '/updatesim';
var DELETE_USER = '/users/delete/:id';
var DELETE_DEVICE = '/devices/delete/:id';
var DELETE_SIM = '/sims/delete/:id';
var USERS = '/users';
var USER = '/users/:id';
var DEVICES = '/devices';
var DEVICE = '/devices/:id';
var SIMS = '/sims';
var SIM = '/sims/:id';
var ROLES = '/roles'
var ROLE = '/roles/:id';


// ports http & https 
var HTTP_PORT = 3000;
var HTTPS_PORT = 3001;

//Constants
var ONE_DAY = 24 * 60 * 60 * 1000;

var user_id;
var sim_id;
var device_id;

//main
var express = require('express');
var expressSession = require('express-session');
var fs = require('fs');
var app = express();
var mime = require('mime');
var https = require('https');
var http = require('http');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var consolidate = require('consolidate');
var ehandlebars = require('express-handlebars');



app.use(expressSession({
    secret: '0ec53c34ceb021b4c7907d31db2ff752',
    name: 'session',
    cookie: {maxAge: ONE_DAY},
    resave: true,
    saveUninitialized: true
}));

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());  
app.use(cookieParser());
//app.use(expressValidator);


app.engine('html', consolidate.underscore);
app.engine('handlebars', ehandlebars({defaultLayout: 'main'}));
app.set('views', './views');
app.set('view engine', 'handlebars');//handlebars or jade ? maybe the best and richtest solution is the handlebars with jquery

//for the srcirpt
//f example : jquery
app.use(express.static('./src/scripts'));
//for the css
//include the static css file
app.use(express.static('./src/css/'));
//images
app.use(express.static('./src/images'));
//fonts
app.use(express.static('./src/fonts'));

//include the db
db = require('./src/db');


db.init(function(res) {

	if (!res) {
		process.exit(code = 1);
	}

});
// security options
var options = {
	key : fs.readFileSync('keys/key.pem'),
	cert : fs.readFileSync('keys/cert.pem')
};

crypt = require('./src/sec');

// Create an HTTP service.
http.createServer(app).listen(HTTP_PORT);
console.log('Listening on port ' + HTTP_PORT + '...');
// Create an HTTPS service identical to the HTTP service.
https.createServer(options, app).listen(HTTPS_PORT);
console.log('Listening on port ' + HTTPS_PORT + '...');
console.log('Started-time: '+ new Date());


//misc
sendToClient = function(con, res) {
	con.header('application/json');
	con.json({'data' : res});
	//con.send(res);
};

//Redirect to another page
redirectToPage = function (req,res,page){
	res.writeHead(302, {'Location': page});
	res.end();	
};

//Example: from /index makes index
getPageName = function(str){
	if(str.indexOf('/') > -1)
	{
		return str.substring(1,str.length);
	}
	else return str;
}


//check the urls
//we need the role and the user
//if the user is undefined, then return to login
//TODO if we want to check the roles
//example admin-- every pages user-- just see the data
app.get(ALL,function(req,res,next){	
	var userName = req.session.userName;
	var userId = req.session.userId;
	var userRoleId= req.session.roleId;
	var userRoleName =req.session.roleName;
	var urlEndPath = req.originalUrl;
	console.log('The url path --> ' +req.get('host')+urlEndPath);
	console.log('The userName and the roleName : ' + userName + ' --- ' + userRoleName);
	
	//req.abort();
	//req.end();
    //res.destroy();
	
	var response = res;
	var request = req;
	//we don't have user
	if(userName === undefined)
	{
		//ok
		if(urlEndPath == LOGIN || urlEndPath == REGISTRATION || urlEndPath == ROOT)
		{
			//ok 
			next();
		}
		//not valid url, he doesn't have the role
		else
		{
			myRedirecter(req,res,LOGIN,'Bejelentkezés','Nincs jogosultsága a kért oldal megtekintéséhez, kérem jelentkezzen be');
		}
	}
	else
	{
		
		if(urlEndPath == LOGIN || urlEndPath == REGISTRATION || urlEndPath == ROOT){
			myRedirecter(req,res,INDEX,'Főablak','');
		}
		else{
			next();
		}
	}
	
		
});

//redirect with messages
myRedirecter = function(req,res, URL, TITLE,message)
{
	res.render(getPageName(URL),{
		title : TITLE,
		layout : false,
		userName : req.session.userName,
		error : message
	});
}

// Methods
app.get(MENUS, function(req, res) {
	//TODO
	db.getMenuitems(function(results) {
		sendToClient(res, results);
	});

});


app.post(REGISTRATION, function(req,res){
	var request  = req;
	var response = res;
	
	var errorMsg = insertUser(req, res);
	if(errorMsg === '')
	{
		res.redirect(LOGIN);
	}
	else{
		//bleibt so;		
		res.render(getPageName(REGISTRATION),{
			title : 'Regisztráció',
			layout : false,
			error : errorMsg
		});
	}
});


//insert user
app.post(INSERT_USER, function(req,res){
	
	console.log('Post insert user')
	var request  = req;
	var response = res;
	
	var errorMsg = insertUser(req, res);
	if(errorMsg === '')
	{
		res.redirect(USERS);
	}
	else{
		//bleibt so;		
		res.render(getPageName(INSERT_USER),{
			title : 'Bevitel',
			layout : false,
			error : errorMsg
		});
		
	}
	
		
});


//
//ezt kell kiegészíteni role_id-val
insertUser = function(req,res)
{
	console.log('Insert user');
	
	var roleId = req.body.inputRoleId;
	var userName = req.body.inputUserName;//TODO check if it exists 
	var userGivenName = req.body.inputGivenName;
	var userSurName = req.body.inputSurName;
	var userPassword = req.body.inputPassword;
	var userPasswordConf = req.body.inputConfPassword;
	var userEmail = req.body.inputEmail;//TODO check if it exists
	
	console.log('ROLEID'+req.body.inputRoleId);
	
	if(roleId === '' || roleId === undefined){
		roleId = 2;
	}
	
	if(userName === '' || userName === undefined){
		console.log('userName is null') ;//TODO return false
		return 'A felhasználónév megadása kötelező';
	}
	
	if(userGivenName === '' || userGivenName === undefined){
		console.log('userGivenName is null'); //TODO return false;
		return 'A keresztnév megadása kötelező';
	}
	
	if(userSurName === '' || userSurName === undefined){
		console.log('userSurName is null'); //TODO return false;
		return 'A vezetéknév megadása kötelező';

	}
	if(userPassword === '' || userPassword === undefined){
		console.log('userPassword is null'); //TODO return false;
		return 'A jelszó megadása kötelező';
	}
	
	if(userPasswordConf === ''  || userPasswordConf === undefined){
		console.log('userPasswordConf is null');
		return 'A megerősítő jelszó megadása kötelező';
	}
	
	if(userPassword !== userPasswordConf){
		console.log('userPassword and userPasswordConf is not the same');
		return 'A megadott jelszavak nem egyeznek';
	}
	
	if(userEmail === '' || userEmail === undefined){
		console.log('userEmail is null'); //TODO return false;
		return 'Az e-mail cím megadása kötelező';
	}
	
	crypt.generateCryptHash(userPassword, function(err, hash) {

		if (err) {
			return 'Hiba keletkezett a művelet során';
		}
//ezt kiegészíteni role_idval
	
		db.insertUser(userName,userGivenName,userSurName,hash,userEmail, roleId);
		return '';

	});
}


//insert device
app.post(INSERT_DEVICE, function(req,res){
	
	console.log('Insert device');
	
	var deviceIMEI = req.body.inputIMEI;

	if(deviceIMEI === '' || deviceIMEI === undefined){
		console.log('deviceImei is null') ;//TODO return false
		return;
	}

	db.insertDevice(deviceIMEI);
	res.redirect(DEVICES);
		
});

//insert sim
app.post(INSERT_SIM, function(req,res){
	
	console.log('Insert sim');
	
	var simNumber = req.body.inputSimNo;
	var simTelefonNumber = req.body.inputPhoneNo;

	
	if(simNumber === '' || simNumber === undefined){
		console.log('simNumber is null') ;//TODO return false
		return;
	}

	if(simTelefonNumber === '' || simTelefonNumber === undefined){
		console.log('simTelefonNumer is null') ;//TODO return false
		return;
	}
	
	db.insertSim(simNumber,simTelefonNumber);
	res.redirect(SIMS);
});

//update user
app.post(USER, function(req,res){
	
	console.log('Update user '+user_id);
	
	var userId = user_id;
	var userName = req.body.inputUserName;//disabled = true!!!!!
	var userGivenName = req.body.inputGivenName;
	var userSurName = req.body.inputSurName;
	var userPassword = req.body.inputPassword;
	var userPasswordConf = req.body.inputConfPassword;
	var userEmail = req.body.inputEmail;
	
	/*
	if(userId === '' || userId === undefined){
		console.log('userId is null');
		return;
	}
	
	
	if(userName === '' || userName === undefined){
		console.log('userName is null');
		return;
	}
	
	if(userGivenName === '' || userGivenName === undefined){
		console.log('userGivenName is null'); //TODO return false;
		return;
	}
	
	if(userSurName === '' || userSurName === undefined){
		console.log('userSurName is null'); //TODO return false;
		return;

	}
	
	if(userPassword === ''  || userPassword === undefined){
		console.log('userPassword is null');
		return;
	}
	
	if(userPasswordConf === ''  || userPasswordConf === undefined){
		console.log('userPasswordConf is null');
		return;
	}
	*/
	if(userPassword !== userPasswordConf){
		console.log('userPassword and userPasswordConf is not the same');
		return;
	}
	/*
	if(userEmail === '' || userEmail === undefined){
		console.log('userEmail is null');
		return;
	}
	*/
	
	
	crypt.generateCryptHash(userPassword, function(err, hash) {

		if (err) {
			return 'Hiba keletkezett a művelet során';
		}
		
		db.updateUser(userId,userGivenName,userSurName,hash, userEmail,null);
		console.log('Update user '+userId +userGivenName + userSurName + hash + userEmail);
		
		res.redirect(USERS);
		
		return '';

	});
	
	
});

//update device
app.post(DEVICE, function(req,res){

	console.log('Update device');
	
	var deviceImei = req.body.inputIMEI;
	
	/*
	if(deviceId === '' || deviceId === undefined){
		console.log('deviceId is null');
		return;
	}
	
	if(deviceImei === '' || deviceImei === undefined){
		console.log('deviceImei is null');
		return;
	}
	*/
	
	db.updateDevice(device_id,deviceImei, undefined, null);
	res.redirect(DEVICES);
});

//update sim
app.post(SIM, function(req,res){

	console.log('Update sim');
	
	var simNumber = req.body.inputSimNo;
	var simTelefonNumber = req.body.inputPhoneNo;
	/*
	if(simNumber === '' || simNumber === undefined){
		console.log('simNumber is null');
		return;
	}
	
	if(simTelefonNumber === '' || simTelefonNumber === undefined){
		console.log('simTelefonNumber is null');
		return;
	}
	*/
	db.updateSim(simNumber,simTelefonNumber,sim_id,null);
	
	res.redirect(SIMS);
});



//delete user
app.get(DELETE_USER, function(req,res) {
	
	db.deleteUser(req.params.id);
	//"refresh" the table of users
	res.redirect(USERS);
	return;
	
});
//delete device
app.get(DELETE_DEVICE, function(req,res) {
	
	db.deleteDevice(req.params.id);
	
	//"refresh" the table of devices
	res.redirect(DEVICES);
	return;

});
//delete sim
app.get(DELETE_SIM, function(req,res) {
	
	db.deleteSim(req.params.id);
	
	//"refresh" the table of users
	res.redirect(SIMS);
	return;

});

//SAVE MERGED DATA
app.post(SAVE_CONFIGURATION, function(req,res){

	console.log('Save configuration');
	
	//TODO check the req and the res
	var simId = req.data.selected_sim;
	var deviceId = req.data.selected_device;
	var userId = req.data.selected_user;
	
	db.insertRecord(userId,deviceId,userId,function(cb)
	{
		//todo console if its okay or not
	});
});

// login

app.post(LOGIN, function(req, res) {

	console.log('Login function');
	// validity
	var userName = req.body.inputUserName;
	var userPass = req.body.inputPassword;
		
	if (userName && userPass) {
		
		db.getValidUserId(userName, userPass, function(cb) {

			if (cb === 0) {
				res.render(getPageName(LOGIN), {
					error : 'Sikertelen bejelentkezés. Nem található ilyen felhasználó az adatbázisban',
					layout : false
				});

			} else { 

				
				crypt.comparePassword(userPass, cb.HASH, function(match) {

					if (match) {

						
						db.getUserRoleByUserId(cb.USER_ID, function(val){
							req.session.userId = cb.USER_ID;
							req.session.userName = userName;
							req.session.roleId = val.ROLE_ID;
							req.session.roleName = val.ROLE_NAME;
							req.session.save();
					
							console.log('User ' + userName+ ' auth successfully with role : '+val.ROLE_NAME);
							
							res.redirect('/index');
						});

					} else {
						console.log('User ' + userName + ' auth failed');
						res.render(getPageName(LOGIN), {
							error : 'Sikertelen bejelentkezés. Kérem ellenőrízze jelszavát és próbálja meg újra.',
							layout : false,
						});
					}
				});

			}

		});

	}
	else
	{
		console.log('Login failed. Username or password is null');
		res.render(getPageName(LOGIN), {
			error: 'Kérem adja meg a felhasználó nevét, illetve jelszavát',
			layout : false
		});
	}

});


//get user by id
app.get(('/'+SEPARATOR+getPageName(USER)), function(req, res) {

	db.getUserById(req.params.id, function(results) {
		sendToClient(res, results);
	});

});

//get users
app.get(('/'+SEPARATOR+getPageName(USERS)), function(req,res){

	db.getAllUser(function(results) {
		
		sendToClient(res, results);
	});

});

//get device by id
app.get(('/'+SEPARATOR+getPageName(DEVICE)), function(req, res) {

	db.getDeviceById(req.params.id, function(results) {
		sendToClient(res, results);
	});

});

//get devices
app.get(('/'+SEPARATOR+getPageName(DEVICES)), function(req,res){

	db.getAllDevice(function(results) {
		sendToClient(res, results);
	});

});


//get sim by id
app.get(('/'+SEPARATOR+getPageName(SIM)), function(req, res) {

	db.getSimById(req.params.id, function(results) {
		sendToClient(res, results);
	});

});

//get sims
app.get(('/'+SEPARATOR+getPageName(SIMS)), function(req,res){

	db.getAllSim(function(results) {
		sendToClient(res, results);
	});

});


//get role by id
app.get(('/'+SEPARATOR+getPageName(ROLE)), function(req, res) {

	db.getRoleById(req.params.id, function(results) {
		sendToClient(res, results);
	});

});

//get roles
app.get(('/'+SEPARATOR+getPageName(ROLES)), function(req,res){

	db.getAllRole(function(results) {
		sendToClient(res, results);
	});

});

//get pgaes
app.get(REGISTRATION,function(req,res){
	res.render(getPageName(REGISTRATION),{
		title : 'Regisztráció',
		layout : false
	});
});


//index page
app.get(INDEX,function(req,res){
	
	console.log('GET index page')
	
	res.render(getPageName(INDEX),{
		title : 'Főoldal',
		layout : false,
		userName : req.session.userName
	});
		
});

//login page
app.get(LOGIN, function(req, res) {
	
	res.render(getPageName(LOGIN),{
		title : 'Bejelentkezés',
		layout : false
	});

});

app.get(LOGOUT, function(req,res){
	  console.log('Logout function');
	  req.session.destroy();
	  res.redirect(getPageName(LOGIN));
})

//index page, to begin the workflow
app.get(ROOT, function(req, res) {
	
	  res.render(getPageName(LOGIN), {
	    title: 'Bejelentkezés',
	    layout:false,
		userName : req.session.userName
	  });
	
	});

//add a user
//sign up the user with role
app.get(INSERT_USER, function(req, res){
	res.render(getPageName(INSERT_USER), {
		title: 'Regisztráció',
		layout : false,
		userName : req.session.userName
	});
});

//add a sim
app.get(INSERT_SIM, function(req,res){
	res.render(getPageName(INSERT_SIM), {
		title: 'Sim hozzáadása',
		layout : false,
		userName : req.session.userName
	});

})
//add a device
app.get(INSERT_DEVICE, function(req,res){
	res.render(getPageName(INSERT_DEVICE), {
		title: 'Eszköz hozzáadása',
		layout : false,
		userName : req.session.userName
	});

});

//update user
app.get(UPDATE_USER, function(req,res){
	
	res.render(getPageName('/updateuser'), {		
	
	//res.redirect('/index');
	
		title: 'Felhasználó módosítása',
		layout : false,
		//userGivenName : req.session.user_given_name
		userName : res.session.userName
	
	});	
});

//user by ID
app.get(USER, function(req,res) {

	db.getUserById(req.params.id, function(results) {
		
		user_id = req.params.id
		
		//req.session.userId = req.params.id;
	
		res.render(getPageName(UPDATE_USER), {
			
			title: 'Felhasználó módosítása',
			layout : false,

			userName : req.session.userName,
			userNameInp : results.USERNAME,
			userGivenName : results.USER_GIVEN_NAME,
			userSurname : results.USER_SURNAME,
			userEMail : results.USER_EMAIL

		});
		
		console.log('UserGivenName ' + results.user_given_name + ' \n:' + results);
		
		req.session.save();
		
		//ide
		
	});
	
		
});

//get users
app.get(USERS, function(req,res){
	
		res.render(getPageName(USERS), {
			title: 'Felhasználók',
			layout : false,
			userName : req.session.userName
		});
});


//device by ID
app.get(DEVICE, function(req,res) {

	db.getDeviceById(req.params.id, function(results) {
		
		device_id = req.params.id
		
		//req.session.userId = req.params.id;
	
		res.render(getPageName(UPDATE_DEVICE), {
			
			title: 'Eszköz módosítása',
			layout : false,

			userName : req.session.userName,
			deviceIMEI : results.DEVICE_IMEI

		});
		
		console.log('deviceIMEI ' + results.DEVICE_IMEI + ' \n:' + results);
		
		req.session.save();
		
		//ide
		
	});
	
		
});

//get devices
app.get(DEVICES, function(req,res){
	
	res.render(getPageName(DEVICES),{
		title : 'Eszközök',
		layout : false,
		userName : req.session.userName
	});
});

//sim by ID
app.get(SIM, function(req,res) {

	db.getSimById(req.params.id, function(results) {
		
		sim_id = req.params.id
		
		//req.session.userId = req.params.id;
	
		res.render(getPageName(UPDATE_SIM), {
			
			title: 'SIM kártya módosítása',
			layout : false,

			userName : req.session.userName,
			simNo : results.SIM_NO,
			simPhoneNumber : results.SIM_PHONE_NUMBER

		});
		
		console.log('simNo ' + results.SIM_NO + ' \n:' + results);
		
		req.session.save();
		
		//ide
		
	});
	
		
});

//get sims
app.get(SIMS, function(req,res){
	
	res.render(getPageName(SIMS),{
		title : 'SIM-kártyák',
		layout : false,
		userName : req.session.userName
	});
});

//report
//TODO


