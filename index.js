const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const { MongoClient } = require('mongodb');
const ObjectID = require('mongodb').ObjectId;
const fs = require('fs-extra');
require('dotenv').config();


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.hzq6j.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

const app = express()
app.use(bodyParser.json());
app.use(cors());

app.use(express.static('blogs'));
app.use(fileUpload());


const port = 5000;

app.get('/', (req, res) => {
    res.send('Hello World! I am running')
})



const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
const contentsCollection = client.db("myBlog").collection("content");
        
    app.post('/addContent', (req, res) =>{
        const file = req.files.file;
        const title = req.body.title;
        const content = req.body.content;
        const newImg = file.data;
        const encImg = newImg.toString('base64');

        var image = {
            contentType: file.mimetype,
            size: file.size,
            img: Buffer.from(encImg, 'base64')
        }
        contentsCollection.insertOne({title, content, image})
        .then(result => {
            res.send(result.insertedCount > 0);
            console.log(result);
        })

        console.log("database connected")
    });

    
    app.get('/contents', (req, res) => {
        contentsCollection.find({})
        .toArray((err, documents) => {
            res.send(documents);
        })
    });

    app.get('/details/:id', (req, res) => {
        contentsCollection.find({_id: ObjectID(req.params.id)})
        .toArray((err, documents) => {
          res.send(documents[0])
        })
    });







    

});

app.listen(process.env.PORT || port);