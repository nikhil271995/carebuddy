var passport = require('passport'),
LocalStrategy   = require('passport-local').Strategy;
var mongoose = require('mongoose');
var bCrypt = require('bcrypt-nodejs');
var flash = require('connect-flash');
var moment = require('moment');

//modesls
//var admins = mongoose.model('admins');
var users = mongoose.model('users');


// User
passport.serializeUser(function(user, done) {
        console.log('serializing user..');
        done(null, user._id);
});

passport.deserializeUser(function(obj, done) {
  //console.log("deserializing " + obj);
  done(null, obj);
});

passport.use('userlogin',new LocalStrategy(
    function(username, password, done) { 
        console.log("yo passport");
        users.findOneAndUpdate({ 'email' :  username },{ 
                 $set : {
                        lastLogin : moment().calendar()
                    }
                },
            function(err, user) {
                console.log(err);
                console.log(moment().toDate().getTime());
                console.log("trying");
                if (err)
                    return done(err);
                if (!user){
                    return done(null, false, { message: 'Incorrect Username/Password. Please try again.' });               
                }
                if (!isValidPassword(user, password)){
                    return done(null, false, { message: 'Incorrect Password. Please try again.' });
                }
               /* if(!user._email){
                    return done(null, false, { message: 'Please Verify your email to Login.' });  
                }
               if(!user._login){
                    return done(null, false, { message: 'Login Disabled for this user.Contact Admin for support.' });
                }*/
                console.log("Successful");
                console.log(user);
                return done(null, user);
            }
        );

    })
);

passport.use('adminlogin',new LocalStrategy(
    function(username, password, done) { 
        console.log(username,password);
        admins.findOne({ 'email' : username }, 
            function(err, user) {
                console.log(user);
                if (err)
                    return done(err);
                if (!user){
                    console.log('Username '+username+' does not Exist. Please try again.');
                    return done(null, false, { message: 'Incorrect Username/Password. Please try again.' });               
                }
                if (!isValidPassword(user, password)){
                    console.log('Invalid Password');
                    return done(null, false, { message: 'Incorrect Password. Please try again.' });
                }
                if(!user._email){
                    return done(null, false, { message: 'Please Verify your email to Login.' });  
                }
                return done(null, user);
            }
        );

    })
);

var isValidPassword = function(user, password){
	return bCrypt.compareSync(password, user.password);
}

module.exports = passport;

