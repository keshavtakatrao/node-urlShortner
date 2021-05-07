const express = require('express');
const app = express();
const cors = require('cors');
const mongodb = require('mongodb');
const { response } = require('express');
const DB = 'urlShortner';
const bcrypt = require('bcryptjs');
const shortid = require('shortid');
require('dotenv').config();
const URL = process.env.DB;


app.use(cors());
app.use(express.json());

app.get('/user',async function(req,res){
    try{
        let connection = await mongodb.connect(URL);
        let db = connection.db(DB);
        let data = await db.collection('users').find().toArray();
        res.json(data);
        connection.close
    }
    catch(error){
        console.log(error)
    }
})
app.post('/register', async function(req,res){
    try {
        let connection = await mongodb.connect(URL);
        let db = connection.db(DB);
        let salt = await bcrypt.genSalt(10);
        let hash = await bcrypt.hash(req.body.password,salt);
        req.body.password = hash;
        db.collection('users').insertOne(req.body);
        res.json({
            message : 'user registered'
        })
        connection.close

    } catch (error) {
        console.log(error);
    }
})

app.post('/login',async function(req,res){
    try{
        let connection = await mongodb.connect(URL);
        let db = connection.db(DB);
        let user = await db.collection('users').findOne({email : req.body.email});

        if(user){
            let isPasswordCorrect = await bcrypt.compare(req.body.password,user.password);
            if(isPasswordCorrect){
                res.json({
                    message : "allow"
                })
            }
            else{
                res.status(404).json({
                    message : "Email or password incorrect"
                })
            }
        }
        else{
            res.status(404).json({
                message : "Email or password incorrect"
            })
        }
        connection.close

    }
    catch(error){
        console.log(error);
    }
})

app.post('/url', async function (req, res) {
    try {
        //connect DB
        req.body.shortUrl = shortid.generate();
        let connection = await mongodb.connect(URL);
        //select DB
        let db = connection.db(DB);
        //operation
        db.collection('shortUrl').insertOne(req.body);
        //close connection
        let data = req.body;
        res.json(data);
        connection.close();
    }
    catch (error) {
        console.log(error)
    }
})

app.get('/:shorturl',async function(req,res){
    try {
        let connection = await mongodb.connect(URL);
        let db = connection.db(DB);
        db.collection('shortUrl').insertOne(req.body);
        let data = await db.collection('shortUrl').findOne({shortUrl : req.params.shorturl});
        if(data){
            res.redirect(data.longUrl);
        }
        else{
            res.sendStatus(404);
        }
        connection.close();
    }
    catch (error) {
        console.log(error)
    }})
    app.listen(process.env.PORT || 3030);