const mongoose = require('mongoose');
 const mongopath='mongodb://127.0.0.1:27017/ETicketing'
//const mongopath='mongodb+srv://mero-care:Kcn9yUbWRnpffd4C@merocare.4nl5x.mongodb.net/ETicketing?retryWrites=true&w=majority'
//Kcn9yUbWRnpffd4C
mongoose.connect(mongopath,{
    useNewUrlParser:true,
    useCreateIndex:true,
    useUnifiedTopology:true //to remove warnings while connection
});
console.log(`database connected`)