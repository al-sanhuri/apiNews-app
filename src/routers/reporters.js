const express = require('express')
const router = express.Router()
const Reporters = require('../models/reporters')
const auth = require('../middelware/auth')
const multer = require('multer')

router.post('/reporters',async(req,res)=>{
    try{
    const reporters = new Reporters(req.body)
    const token = await reporters.generateToken()
    await reporters.save()
    res.status(200).send({reporters,token})
}
catch(e){
    res.status(400).send(e.message)
}
})
/////////////////////////////////////////////////////////////////////////////

// login 
router.post('/login',async(req,res)=>{
    try{
        const reporters = await Reporters.findByCredentials(req.body.email,req.body.password)
        const token = await reporters.generateToken()
        res.send({reporters,token})
    }
    catch(e){
        res.status(400).send(e.message)
    }
})
/////////////////////////////////////////////////////////////////////////////

router.get('/profile',auth,async(req,res)=>{
    res.send(req.reporters)
})

router.get('/reporters',auth,async(req,res)=>{
   // array of documnets
   try{
    const reporters =  await Reporters.find({})
    res.status(200).send(reporters) 
   }
   catch(e){
        res.status(500).send(e)
   }  
   
})

/////////////////////////////////////////////////////////////////////////////////

// get by id 

router.get('/reporters/:id',auth,(req,res)=>{
    console.log(req.params)

    Reporters.findById(req.params.id).then((reporters)=>{
        if(!reporters){
           return res.status(404).send('No reporters is found')
        }
        res.status(200).send(reporters)
    }).catch((e)=>{
        res.status(500).send(e)
    })
})

///////////////////////////////////////////////////////////////////////////////


router.patch('/reporters/:id',auth,async(req,res)=>{
    try{
        const updates = Object.keys(req.body)
        // console.log(updates)
        const reporters = await Reporters.findById(req.params.id)
        if(!reporters){
            return res.status(404).send('No reporters is found')
        }
        updates.forEach((el)=> reporters[el] = req.body[el])
        await reporters.save()

        res.status(200).send(reporters)
    }
    catch(e){
        res.status(400).send(e)
    }
})

///////////////////////////////////////////////////////////////////////////////

router.delete('/logout',auth,async(req,res)=>{
    try{

        req.reporters.tokens = req.reporters.tokens.filter((el)=>{
            return el !== req.token
        })
        await req.reporters.save()
        res.status(200).send()
    }
    catch(e){
        res.status(500).send(e)
    }
})

router.delete('/reporters/:id',auth,async(req,res)=>{
    try{
        const reporters = await Reporters.findByIdAndDelete(req.params.id)
        if(!reporters){
            return res.status(404).send('NO reporters is found')
        }
        res.status(200).send(reporters)
    }
    catch(e){
        res.status(500).send(e)
    }
})

/////////////////////////////////////////////////////////////////////////

// upload image

const uploads = multer({
    limits:{
        fileSize:1000000
    },
    fileFilter(req,file,cb){
        if(!file.originalname.match(/\.(jpg|jpeg|png|jfif)$/)){
            cb(new Error('Please upload image'))
        }
        cb(null,true)
    }
})

router.post('/image/:id',auth,uploads.single('iamge'),async(req,res)=>{
    try{
        req.reporters.avatar = req.file.buffer
        await req.reporters.save()
        res.send()
    }
    catch(e){
        res.send(e)
    }
})

module.exports = router