const dotenv = require('dotenv');
dotenv.config();
const mongoose = require('mongoose')
mongoose.connect(process.env.MONGO);

const express = require('express')
const app = express();

app.use(express.static('public/users'));


app.use((req, res, next) => {
    res.header(
      "Cache-Control",
      "no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0"
    );
    next();
});


//for user routes
const user_Route = require('./routers/userRoutes');
app.use('/',user_Route)

//for admin
app.use(express.static('public/admin'));
const admin_Route = require('./routers/adminRoute');
app.use('/admin',admin_Route)


app.listen(process.env.PORT,function(){
    console.log("server is running");
});