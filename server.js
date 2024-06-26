const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const app =express();
const userRouter =require('./Routers/userRouter');
const bookRouter = require('./Routers/bookRouter');
const trishoolRouter = require('./Routers/trishoolRouter');
const galleryRouter = require('./Routers/galleryRouter');
const teamRouter = require('./Routers/teamRouter');

app.use(cors({
    origin: 'https://hindisamitinith.netlify.app', 
    // origin: 'http://localhost:3000',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true, 
}));

app.use(express.json());
dotenv.config();

mongoose.connect(process.env.URL)
.then(()=>{
    console.log("Database connection successful");
    app.listen(process.env.PORT || 8000,(err)=>{
        if(err){
            console.log(err);
        }
        console.log(`server is listening at ${process.env.PORT}`);
    });
})
.catch((error)=>{
    console.log("error",error);
})

app.use(userRouter);
app.use(bookRouter);
app.use(trishoolRouter);
app.use(galleryRouter);
app.use(teamRouter);

// Serve static files from the "uploads" directory
app.use('/uploads', express.static('uploads'));
app.use('/bookUploads',express.static('bookUploads'));
app.use('/coverUploads',express.static('coverUploads'));
app.use('/trishoolUploads',express.static('trishoolUploads'));
app.use('/galleryUploads',express.static('galleryUploads'));
app.use('/teamUploads',express.static('teamUploads'));
app.use('/image', express.static('image'));
