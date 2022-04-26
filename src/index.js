const express = require('express')
require('dotenv').config()
const app = express()
const port = process.env.PORT || 3000;

// connection
require('./db/mongoose')

// parse automatic
app.use(express.json())

// routers
const reportersRouter = require('./routers/reporters')
const newsRouter = require('./routers/news')
app.use(reportersRouter)
app.use(newsRouter)


app.listen(port,()=>{console.log('Server is running')})