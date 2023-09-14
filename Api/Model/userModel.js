const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
    name:{
     type:String,
     require:[true , "Please tell us your name"],
    },
    email:{
        type:String,
        require:[true , "Please provide email"],
        unique:true,
        lowercase:true,
    },
    role:{
      type:String,
      enum:["user " , "admin"],
      default:"user",
    },
    password:{
        type:String,
         require:[true , "Please provide your password"],

    },
    passwordConfirm:{
        type:String,
        require:[true , "please confirm password"],
        validate:{
        validator:function(el) {
            return el===this.password;
        },
        message:"Password are not same"
    },
},
});


userSchema.pre("save " , async function(next){

    //omly run function if password is Modified else next()
    if (!this.isModified("password")) return next();

    //hash password 
    this.password=await bcrypt.hash(this.password , 12);


    this.passwordConfirm=undefined;
    next();
});

userSchema.pre("save " , function(next){
    if (!this.isModified("password") || this.isNew) return next();
    this.passwordChangedAt= Date.now()-1000;
    next();
});


userSchema.pre(/^find/ ,  function(next){
   this.find({active:{$ne:false}});
    next();
});
userSchema.methods.correctPassword=async function(
    candidatePassword,
    userPassword
){
    return await bcrypt.compare(candidatePassword , userPassword)
};

userSchema.methods.changedPasswordAfter=function (JWTTimestamp){
    if(this.passwordChangedAT){
        const changedTimestamp=parseInt(
            this.passwordChangedAT.getTime()/1000,
            10,
        )
        return JWTTimestamp<changedTimestamp
    }
    return false
};

const User = mongoose.model("User" , userSchema);
module.exports = User;