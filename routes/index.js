var express = require('express');
var router = express.Router();
var passport = require('./auth.js');
var mongoose = require('mongoose');
var bCrypt = require('bcrypt-nodejs');
var flash = require('connect-flash');

//models	
var users = mongoose.model('users');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('users/index', { title: 'CareBuddy' });
});

router.post('/userslogin', passport.authenticate('userlogin', {
    successRedirect: '/users/profile',
    failureRedirect: '/users',
    failureFlash:true
}));

router.get('/logout', function(req, res) {
	req.logout();
  	req.session.destroy()
	res.redirect('/');
});

var createHash = function(password){
	return bCrypt.hashSync(password, bCrypt.genSaltSync(10), null);
}

function userValidate(req,res,next){
	//console.log(req.user);
	users.findById(req.user,function(err, user) {
		if(user!=null){
			req.session.user = user;
			next();
		}
		else {
			console.log(err);
      		res.redirect('/');
		}
	});
}

module.exports = router;
