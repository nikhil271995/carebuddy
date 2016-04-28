var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var userSchema = new Schema({
	first_name:{ 
		type: String, 
		required: true 
	},
	last_name:{ 
		type: String, 
		required: true 
	},
	email:{ 
		type: String, 
		required: true,
		unique: true  
	},
	altEmail:{ 
		type: String,
		unique : false,
	},
	skills:[{
		skillName :{
			type : String,
			unique : true,
		},
		aboutSkill :{
			type : String,
		},
		index: {
			type :String,
			unique : true
		}
	}],
	description: {
		type:String,
		unique:false,
		default:""
	},
	lastLogin: {
		type: String,
		unique : false,
		default : "Never"
	},
	password:{ 
		type: String, 
		required: true,
	},
	phone:{ 
		mobile:Number,
		isd:Number,
		std:Number,
		landline:Number
	},
	dob:String,
	address:{
		line1:String,
		line2:String,
		city:String,
		state:String,
		country:String,
		pin:String
	},
	fb:String,
	twitter:String,
	linkedIn:String,
	blog:String,
	skype:String,
	maritial:String,
	gender:String,
	summary:String,
	resume:{
		name:String,
		original_name:String
	},
	tenth:{
		school_name:String,
		city:String,
		state:String,
		board:String,
		marks:String,
		year:String,
		medium:String,
	},
	twelfth : {
		school_name:String,
		city:String,
		state:String,
		board:String,
		marks:String,
		year:String,
		medium:String,
		specialization:String,
		mode:String
	},
	grad:{
		school_name:String,
		city:String,
		state:String,
		board:String,
		marks:String,
		year:String,
		medium:String,
		specialization:String,
		mode:String
	},
	postgrad : {
		school_name:String,
		city:String,
		state:String,
		board:String,
		marks:String,
		year:String,
		medium:String,
		specialization:String,
		mode :String
	},
	_email:{
		type:Boolean,
		required:true,
		default:false
	},
	_approved:{
		type:Boolean,
		required:true,
		default:false
	},
	_login:{
		type:Boolean,
		default:true
	},
	resetPasswordToken : {
		type : String
	},
	resetPasswordExpires : {
		type : Date
	}
});
module.exports = mongoose.model('users', userSchema);
