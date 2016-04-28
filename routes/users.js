var express = require('express');
var router = express.Router();
var passport = require('./auth.js');
var mongoose = require('mongoose');
var bCrypt = require('bcrypt-nodejs');
var flash = require('connect-flash');
var multer = require('multer');
var fs = require('fs');
var path = require('path');
var moment = require('moment');
var multer = require('multer');
var nodemailer = require('nodemailer');
var async = require('async');
var crypto = require('crypto');
//models
var users = mongoose.model('users');
//File upload flags and config

var fileUpload = false;
var fileFilter = false;
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
   if (file.fieldname == 'attach') {
      cb(null, '/home/anv13/git/carebuddy/app/public/files')
    }
  },
  filename: function (req, file, cb) {
    cb(null, req.user  + Date.now() + path.extname(file.originalname))
  }
})

var fileFilter = function(req,file,cb){
	fileUpload = true;
	console.log(file);
	if (file.mimetype=="application/pdf"||file.mimetype=="image/jpeg"||file.mimetype=="image/png"||file.mimetype=="application/vnd.openxmlformats-officedocument.wordprocessingml.document"||file.mimetype=="application/msword") {
		cb(null,true);
	} else {
		fileFilter = true;
		cb(null,false);
	}

}

var uploads = multer({
	storage:storage,
	fileFilter:fileFilter,
	limits:{
		fileSize: 2048*1024
	}
});

var upload = uploads.fields([{ name: 'attach' }]);


/* GET users listing. */
router.get('/',function(req, res, next) {
	res.render('users/index',{error:req.flash('Successful'),reg_error:req.flash('Error'),reg_success:req.flash('LoginSuccess')});
});

router.get('/profile', userValidate ,function(req, res, next) {
	var userId = req.session.user;
	users.findById(userId,function(err,user){
			res.render('users/profile',{userData:user,error:req.flash('Successful'),reg_error:req.flash('Error'),reg_success:req.flash('LoginSuccess')});
	})
});

router.get('/register', function(req,res,next) {
	res.render('users/register',{error:req.flash('error'),reg_error:req.flash('registrationError'),reg_success:req.flash('registrationSuccess')});
});

router.post('/register', function(req, res, next) {
  console.log(req.body);
  // POST Request
  var first_name = req.body.first_name;
  var last_name = req.body.last_name;
  var confirm_password = req.body.confirm_password;
  var password = req.body.password;
  var email = req.body.email;
  if(password.localeCompare(confirm_password)!=0){
  	req.flash('registrationError','Passwords do not match. Please Check again.');
  	res.redirect('register');
  }
  else{
  	users.findOne({'email':email},function(err, user) {
  		if(user!=null){
  			req.flash('registrationError','E-mail already registered. Please Register using a different E-mail or use Forgot Password for password recovery.');
  			res.redirect('register');
  		}
  		else{
  		  var phone = req.body.phone;
		  // Database Entry
		  var user = new users({
		  	first_name:first_name,
		  	last_name:last_name,
		  	email:email,
		  	password:createHash(password),
		  	phone:{
		  		mobile:phone
		  	}
		  });
		  user.save(function(err, user) {
		  	if (err){
		  		console.log(err);
		  		req.flash('error','Database Error. Please Try again or Contact Admin if it persists.');
		  		res.redirect('register');
		  	}
		  	else{
		  		req.flash('success','User has been added');
		  		/*
		  		var mailOptions = {
				    from: '', // sender address
				    to: email, // list of receivers
				    subject: 'Welcome to ConfluenceEdu', // Subject line
				    text: '<h2>Welcome to ConfluenceEdu</h2>Hello '+first_name+
				    '<br>Thank You for signing up for ConfluenceEdu. You can login after verifying your email by clicking '+
				    '<a href="'+website+'/users/confirm/'+user._id+'">here</a>.<br>'+ 'You can also paste the link below in your browser to confirm.<br>'+
				    '<a href="'+website+'/users/confirm/'+user._id+'">'+website+'/users/confirm/'+user._id+'</a><br><br>Regards,<br>Webmaster<br>ConfluenceEdu', // plaintext body
				    html: '<h2>Welcome to ConfluenceEdu</h2>Hello '+first_name+
				    '<br>Thank You for signing up for ConfluenceEdu. You can login after verifying your email by clicking '+
				    '<a href="'+website+'/users/confirm/'+user._id+'">here</a>.<br>'+ 'You can also paste the link below in your browser to confirm.<br>'+
				    '<a href="'+website+'/users/confirm/'+user._id+'">'+website+'/users/confirm/'+user._id+'</a><br><br>Regards,<br>Webmaster<br>ConfluenceEdu' // html body
				};
				var adminMailOptions = {
				    from: '', // sender address
				    to:'', // list of receivers
				    subject: 'New user Registration.', // Subject line
				    text: 'Hello Admin,<br>'+
				    'New User '+first_name+' '+last_name+
				    ' Has registered with the Email '+email+'.',// plaintext body
				    html: 'Hello Admin,<br>'+'New User '+first_name+' '+
				    	   last_name+' Has registered with the Email '+email+'.' // html body
				};

				// send mail with defined transport object
				transporter.sendMail(mailOptions, function(error, info){
					if(error){
						console.log(error);
					}else{
						console.log('Message sent: ' + info.response);
					}
				});
				transporter.sendMail(adminMailOptions, function(error, info){
					if(error){
						console.log(error);
					}else{
						console.log('Message sent: ' + info.response);
					}
				});*/
	  			res.redirect('register');
		  	}
		  });
		}
	});

  }
});

router.get('/profile/remove/:skill',userValidate,function (req,res,next) {
	users.findByIdAndUpdate(req.session.user,{
		$pull: { 
			skills : {
				skillName : req.params.skill
			}
		}
	},function(err,user){
		console.log(user);
		if(err){
			console.log(err);
			req.flash("Database error.Please contact admin");
		}
		else{
			console.log(req.params.skill);
			req.flash("Skill Successfully Removed");
		}
		res.redirect("/users/profile");
	});
});

router.post('/profile', userValidate, function(req,res,next){
	upload(req, res, function (err) {
		console.log(req.body);
		var file = false;
		    if (err) {
		      console.log(err.message);
		      req.flash('error',err.message.toString());
		      res.redirect('/users/profile');
		    }
		    else if(fileFilter==true){
		    	fileFilter = false;
		    	req.flash('error','Error Uploading Document. Invalid File-Type.');
		      	res.redirect('/users/profile');
		    }else if(fileUpload==true && req.files.attach==null){
		    	fileUpload = false;
		    	req.flash('error','Error Uploading Document. Max File-Size Exceeded.');
		      	res.redirect('/users/profile');
		      }
		    else if(req.body.message == '' && req.files.attach==null){
		    	req.flash('error','Please Enter a Message.');
		      	res.redirect('/users/profile');
		      }
		    else{
				//console.log(req.body);
				console.log(req.files);
				var message = req.body.message;
				var originalname,name;
				if (req.files.attach!=null) {
					file = true;
					name = req.files.attach[0].filename;
					originalname = req.files.attach[0].originalname;
				} else {
					originalname=null;
					name=null;
				}
			users.findByIdAndUpdate(req.user,{
				$set : {
						first_name : req.body.first_name,
						last_name : req.body.last_name,
						phone : {
							mobile : req.body.mobile,
							landline : req.body.landline,
							isd : req.body.isd,
							std : req.body.std
						},
						dob : req.body.dob,
						gender : req.body.gender,
						maritial : req.body.maritial,
						fb : req.body.fb,
						twitter : req.body.twitter,
						linkedIn : req.body.linkedIn,
						skype : req.body.skype,
						blog : req.body.blog
				},
				$pushAll : {
			        	"skills":[{
			        		skillName: req.body.skillName1, 
		        			aboutSkill: req.body.aboutSkill1,
		        			_file : file, 
			        		file : name,
			        		orignalfile : originalname,
			        		index:"1"
			        		},
							{
			        		skillName: req.body.skillName2, 
		        			aboutSkill: req.body.aboutSkill2,
		        			_file : file, 
			        		file : name,
			        		orignalfile : originalname,
			        		index:"2"
			        		},
			        		{
			        		skillName: req.body.skillName3, 
		        			aboutSkill: req.body.aboutSkill3,
		        			_file : file, 
			        		file : name,
			        		orignalfile : originalname,
			        		index:"3"
			        		},
			        		{
			        		skillName: req.body.skillName4, 
		        			aboutSkill: req.body.aboutSkill4,
		        			_file : file, 
			        		file : name,
			        		orignalfile : originalname,
			        		index:"4"
			        		},
			        		{
			        		skillName: req.body.skillName5, 
		        			aboutSkill: req.body.aboutSkill5,
		        			_file : file, 
			        		file : name,
			        		orignalfile : originalname,
			        		index:"5"
			        		},
			        		{
			        		skillName: req.body.skillName6, 
		        			aboutSkill: req.body.aboutSkill6,
		        			_file : file, 
			        		file : name,
			        		orignalfile : originalname,
			        		index:"6"
			        		},
			        		{
			        		skillName: req.body.skillName7, 
		        			aboutSkill: req.body.aboutSkill7,
		        			_file : file, 
			        		file : name,
			        		orignalfile : originalname,
			        		index:"7"
			        		},
			        		{
			        		skillName: req.body.skillName8, 
		        			aboutSkill: req.body.aboutSkill8,
		        			_file : file, 
			        		file : name,
			        		orignalfile : originalname,
			        		index:"8"
			        		},
			        		{
			        		skillName: req.body.skillName9, 
		        			aboutSkill: req.body.aboutSkill9,
		        			_file : file, 
			        		file : name,
			        		orignalfile : originalname,
			        		index:"9"
			        		},
			        		{
			        		skillName: req.body.skillName10, 
		        			aboutSkill: req.body.aboutSkill10,
		        			_file : file, 
			        		file : name,
			        		orignalfile : originalname,
			        		index:"10"
			        		},
			        		]
				}
			},
			{
		        	safe: true, 
		        	upsert: true, 
		        	new : true,
		    },
			 function(err, user){
					console.log(user);
					if(err){
						req.flash('error',"Some database error occured, Please contact admin");
						console.log(err);
						res.redirect('/users/profile');
					}
					else{
						req.session.user = user;
						req.flash('success', "Profile Updated Successfully");
						res.redirect('/users/profile');
					}
		});
		}
	});
});

var createHash = function(password){
	return bCrypt.hashSync(password, bCrypt.genSaltSync(10), null);
}
function userValidate(req,res,next){
	users.findById(req.user,function(err, user) {
		if(user!=null){
			req.session.user = user;
			res.locals.currentuser = user;
			next();
		}
		else {
      		res.redirect("/users");
		}
	});
}

var isValidPassword = function(user, password){
	return bCrypt.compareSync(password, user.password);
}
module.exports = router;
