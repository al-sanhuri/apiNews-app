const express = require('express')
const router = express.Router()
const auth = require('../middelware/auth')
const News = require('../models/news')

// post 

router.post('/news',auth,async(req,res)=>{
    try{
        const news = new News({...req.body,owner:req.reporters._id})
        //  console.log(news)
        await news.save()
        res.status(200).send(news)
    }
    catch(e){
        res.status(400).send(e.message)
    }

})

router.get('/news',auth,async(req,res)=>{
    try{
        await req.reporters.populate('news')
        res.send(req.reporters.news)
    }
    catch(e){
        res.status(500).send(e.message)
    }
})

router.get('/news/:id',auth,async(req,res)=>{
    try{
        const id= req.params.id
        console.log(req.reporters._id) 
        const news = await News.findOne({_id:id,owner:req.reporters._id})
        console.log(news)
        if(!news){
          return res.status(404).send('No news is found')
        }
        res.status(200).send(news)
    }
    catch(e){
        res.status(500).send(e.message)
    }
})

router.patch('/news/:id',auth,async(req,res)=>{
    try{
        const _id = req.params.id 
        const news = await News.findOneAndUpdate({_id,owner:req.reporters._id},req.body,{
            new:true,
            runValidators:true
        })
        if(!news){
            return res.status(404).send('No news is found')
        }
        res.status(200).send(news)
    }
    catch(e){
        res.status(400).send(e.message)
    }
})

router.delete('/news/:id',auth,async(req,res)=>{
    try{
        const news = await News.findOneAndDelete({_id:req.params.id,owner:req.reporters._id})
        if(!news)
        return res.status(404).send('No news is found')
        res.status(200).send(news)
    }
    catch(e){
        res.status(500).send(e.message)
    }
})

router.get('/reportsNews/:id',auth,async(req,res)=>{
    try{
        const _id = req.params.id
        const news = await News.findOne({_id,owner:req.reporters._id})
        if(!news){
            return res.status(404).send('No news is found')
        }
        await news.populate('owner')
        res.status(200).send(news.owner)
    }
    catch(e){
        res.status(500).send(e)
    }
})

module.exports = router