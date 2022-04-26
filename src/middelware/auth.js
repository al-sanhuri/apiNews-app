const jwt = require('jsonwebtoken')
const Reporter = require('../models/reporters')

const auth = async (req,res,next) =>{
    try{
    const token = req.header('Authorization').replace('Bearer ','')
    console.log(token)
    const decode = jwt.verify(token,process.env.JWT_SECRET)
    console.log(decode) 

    const reporters = await Reporter.findOne({_id:decode._id,tokens:token})
    // console.log(reporters)
    if(!reporters){
        console.log('No reporters')
        throw new Error()
    }

    req.reporters = reporters 
    req.token = token
    next()
}
catch(e){
    console.log('I am here')
    res.status(401).send({error:'Please Authenticate'})
}
}

module.exports = auth