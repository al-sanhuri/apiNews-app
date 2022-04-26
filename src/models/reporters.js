const mongoose = require("mongoose");
const validator = require("validator");
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');

const reportersScehma = mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    unique: true,
    validate(value) {
      if (!validator.isEmail(value)) {
        throw new Error("Email is invalid");
      }
    },
  },
  phoneNumber:{
    type:String,
    required:true,
    // trim:true,
    // const result = validatePhoneNumber.validate('+8801744253089');
    validate(value) {
      if (!validator.isMobilePhone(value,"ar-EG")) {
        throw new Error("phoneNumber is invalid");
      }
    },
  },
  age: {
    type: Number,
    default: 10,
    validate(value) {
      if (value < 0) {
        throw new Error("Age must be postive number");
      }
    },
  },
  password: {
    type: String,
    required: true,
    trim: true,
    minLength: 6,
    validate(value) {
      // pattern
      let strongPassword = new RegExp(
        "^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})"
      );
      if (!strongPassword.test(value)) {
        throw new Error(
          "Password must include uppercase,lowercase,numbers,characters"
        );
      }
    },
  },
  tokens:[
    {
      type:String,
      required:true
    }
  ],
  image:{
    type:Buffer
  }
});

/////////////////////////////////////////////////////////////////////////
reportersScehma.virtual('news',{
  ref:'News',
  localField:'_id',
  foreignField:'owner'
})
////////////////////////////////////////////////////////////////////
reportersScehma.pre('save',async function(){
    const reporters = this
    // console.log(reporters.password)
    if(reporters.isModified('password'))
    reporters.password = await bcryptjs.hash(reporters.password,8)
    // console.log(reporters.password)

})

///////////////////////////////////////////////////////////////////////////////
reportersScehma.statics.findByCredentials = async (email,password) =>{

  const reporters = await Reporter.findOne({email})
  console.log(reporters)

  if(!reporters){
    throw new Error('Unable to login')
  }
  const isMatch = await bcryptjs.compare(password,reporters.password)
  // console.log(isMatch)
  if(!isMatch){
    throw new Error('Unable to login')
  }
  //console.log('password')
  return reporters
}

//////////////////////////////////////////////////////////////////////////////
reportersScehma.methods.generateToken = async function(){
  const reporters = this
  const token = jwt.sign({_id:reporters._id.toString()},process.env.JWT_SECRET)

  reporters.tokens = reporters.tokens.concat(token)
  console.log(reporters.tokens)
  await reporters.save()
  return token
}

////////////////////////////////////////////////////////////////////////////

reportersScehma.methods.toJSON = function(){
  const reporters = this
  console.log(reporters)

  const reportersObject = reporters.toObject()

  delete reportersObject.password
  delete reportersObject.tokens
  return reportersObject
}


const Reporter = mongoose.model("Reporter", reportersScehma);

module.exports = Reporter;
