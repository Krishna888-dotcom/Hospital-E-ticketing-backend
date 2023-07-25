const jwt = require('jsonwebtoken');
const UserRegistration = require('../models/userRegistrationModel');

module.exports.authorizeUser = (req,res,next)=>{
    try
    {
        console.log(req.headers['authorization'])
        let token = req.headers['authorization'].split(" ")[1];
        let userData = jwt.verify(token,'loginKey');
        let query = UserRegistration.findOne({"_id":userData.accId});
        query.then((data)=>{
            if(data != null)
            {
                req.user = data;
                next();
            }
            else
            {
                return res.status(202).json({"success":false,"message":"Unauthorized access!!"})
            }
        })
        .catch((err)=>{
            return res.status(404).json({"success":false,"message":err});
        })
    }
    catch(err)
    {
    
        return res.status(404).json({"success":false,"message":err});
    }
}


module.exports.verifyUser = (req,res,next)=>{
    if(req.user == null)
    {
        return res.status(202).json({"success":false,"message":"Unauthorized access!!"})
    }
    else if(req.user.userType != "User")
    {
        return res.status(202).json({"success":false,"message":"Unauthorized access!!"})
    }
    else
    {
        next();
    }
}

module.exports.verifyHospital = (req,res,next)=>{
    if(req.user == null)
    {
        return res.status(202).json({"success":false,"message":"Unauthorized access!!"})
    }
    else if(req.user.userType != "Hospital")
    {
        return res.status(202).json({"success":false,"message":"Unauthorized access!!"})
    }
    else
    {
        next();
    }
}

module.exports.verifyAdmin = (req,res,next)=>{
    if(req.user == null)
    {
        return res.status(202).json({"success":false,"message":"Unauthorized access!!"})
    }
    else if(req.user.userType != "Admin")
    {
        return res.status(202).json({"success":false,"message":"Unauthorized access!!"})
    }
    else
    {
        next();
    }
}

