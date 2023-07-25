const express = require('express');
const bodyParser = require('body-parser');
const colors = require('colors');
const cors = require('cors');
const http = require('http');
const path = require('path');
const dotenv = require('dotenv');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');

dotenv.config({
    "path":'./.env'
});

const db = require('./database/database');

const app = express();
const server = http.createServer(app);

const registrationRoute = require('./routes/registrationRoute')
const hospitalRoute = require('./routes/hospitalRoute')

app.use(cors());
app.use(bodyParser.urlencoded({extended:false}));
app.use(express.json());
app.use(cookieParser());

if(process.env.NODE_ENV.trim() == "development")
{
    app.use(morgan('dev'))
}

app.use('/images',express.static(path.join(__dirname,'/images')));
app.use(registrationRoute);
app.use(hospitalRoute)



let portNo = 90;
server.listen(portNo,()=>{
    console.log(colors.brightCyan.bold(`Server is running on ${process.env.NODE_ENV}at port:${portNo}`))
});
