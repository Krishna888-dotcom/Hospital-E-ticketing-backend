const express = require('express');
const router = express.Router();
const UserRegistration = require('../models/userRegistrationModel')
const {check,validationResult} = require('express-validator');
const {getCustomizedError,getFormattedToday,getFancyDate,getTimeValue} = require('../utils/utils')
const bcryptjs = require('bcryptjs');
const {sendMailMessage} = require('../utils/mail')
const validator = require('validator')
const jwt = require('jsonwebtoken')


//registration api
router.post('/registerUser',[
    check('firstName',"Firstname cannot be left empty.").not().isEmpty(),
    check('lastName','Lastname cannot be left empty.').not().isEmpty(),
    check('email',"Email cannot be left empty.").not().isEmpty(),
    check('userName',"Username cannot be left empty.").not().isEmpty(),
    check('phoneNumber',"Phone Number cannot be left empty.").not().isEmpty(),
    check('address',"Address cannot be left empty.").not().isEmpty(),
    check('dob',"Date Of Birth cannot be left empty.").not().isEmpty(),
    check('gender',"Gender cannot be left empty.").not().isEmpty(),
    check('password',"Password cannot be left empty.").not().isEmpty(),
    check('confirmPassword',"Confirm Password cannot be left empty.").not().isEmpty(),
    check('userName',"Username should contain atleast 5 characters.").isLength({"min":5}),
    check('email',"Inappropriate email format.").isEmail(),
    check('phoneNumber',"Mobile number should not contain any alphabets.").isNumeric(),
    check('phoneNumber','Mobile number should contain 10 characters.').isLength({"min":10,"max":10}),
    check('password','Passoword must lie within the range of 6-25').isLength({"min":6,"max":25})

],async (req,res)=>{
    try
    {
        let errors = validationResult(req);
        if(errors.isEmpty())
        {
            let firstName = req.body['firstName'].trim();
            let lastName = req.body['lastName'].trim();
            let email = req.body['email'].trim();
            let userName = req.body['userName'].trim().toLowerCase();
            let phoneNumber = req.body['phoneNumber'].trim();
            let address = req.body['address'].trim();
            let dob = req.body['dob'];
            let splitDob = dob.split("-")[1]+"-"+dob.split("-")[2]
            let gender = req.body['gender'];
            let password = req.body['password'];
            let confirmPassword = req.body['confirmPassword'];

            let registeredAccounts = await UserRegistration.find({});
            let userNameContainer = registeredAccounts.map((val)=>{return val.userName});
            let emailContainer = registeredAccounts.map((val)=>{return val.email});
            let phoneNumberContainer = registeredAccounts.map((val)=>{return val.phoneNumber});

            let errorBox = {};
            let userAge = parseInt((new Date().getTime() - new Date(dob).getTime())/(1000*60*60*24*365))

            //error handling
            if(!validator.isAlpha(firstName.replace(" ","")))
            {
                errorBox['firstName'] = "Firstname should not contain numeric characters."
            }
            if(!validator.isAlpha(lastName.replace(" ","")))
            {
                errorBox['lastName'] = "Lastname should not contain numeric characters."
            }
            if(userNameContainer.includes(userName))
            {
                errorBox['userName'] = "Username already exists."
            }
            if(emailContainer.includes(email))
            {
                errorBox['email'] = "Email address already exists."
            }
            if(phoneNumberContainer.includes(phoneNumber))
            {
                errorBox['phoneNumber'] = "Mobile number already exists."
            }
            if(userAge < 16)
            {
                errorBox['dob'] = "You are underage to hold the account."
            }
            if(password != confirmPassword)
            {
                errorBox['password'] = "Password mismatch."
            }

            //saving
            if(Object.keys(errorBox).length > 0)
            {
                return res.status(202).json({"success":false,"message":"Certain errors found during registration.","error":errorBox})
            }
            else
            {
                firstName = firstName.slice(0,1).toUpperCase()+firstName.slice(1,firstName.length).toLowerCase();
                lastName = lastName.slice(0,1).toUpperCase()+lastName.slice(1,lastName.length).toLowerCase();
                //hashing
                bcryptjs.hash(password,10,(err,hash)=>{
                    const user = new UserRegistration({
                        "firstName":firstName,
                        "lastName":lastName,
                        "userName":userName,
                        "email":email,
                        "phoneNumber":phoneNumber,
                        "address":address,
                        "password":hash,
                        "dob":dob,
                        "createdAt":getFormattedToday(new Date()),
                        "gender":gender,
                        "dob2":splitDob,
                        "fancyCreation":getFancyDate(new Date()),
                        "wishedDate":dob
                    })
                    user.save()
                    .then((result)=>{
                        let content = {
                            "heading":"Registration Successful!!",
                            "greeting":getTimeValue()+" "+firstName+" "+lastName+",",
                            "message":"Congratulations! You have successfully signed up for Hospital E-Ticketing!!",
                            "message2":"Hope you would like our services.",
                            "task":"UserRegistration"
                        }
                        sendMailMessage("Hospital E-Ticketing",email,content);

                        return res.status(200).json({"success":true,"message":"Registered Successfully!!"})
                    })
                    .catch((err)=>{
                        
                        return res.status(404).json({"success":false,"message":err})
                    })


                })
            }
            

        }
        else
        {
            let customizedError = getCustomizedError(errors.array());
            return res.status(202).json({"success":false,"message":"Certain errors found during registration.","error":customizedError});
        }
    }
    catch(err)
    {
        console.log(err)   
        return res.status(404).json({'success':false,"message":err});
    }
    
})


//login api
router.post('/loginUser',[
    check('userName',"Username cannot be left empty.").not().isEmpty(),
    check('password','Password cannot be left empty').not().isEmpty()
],(req,res)=>{
    
    let errors = validationResult(req);
    if(errors.isEmpty())
    {
        let userName = req.body['userName'].trim().toLowerCase();
        let password = req.body['password'];

        let authentication = UserRegistration.findOne({"userName":userName}).select("+password");
        authentication.then((data)=>{
            if(data != null)
            {
                bcryptjs.compare(password,data.password,(err,result)=>{
                    if(result == true)
                    {
                        let token = jwt.sign({"accId":data._id},'loginKey');
                        return res.cookie('loginToken',token,{httpOnly:true,maxAge:1000*60*60*24}).status(200).json({"success":true,"message":"Logged In!!","token":token,"data":data})
                    }
                    else
                    {
                        return res.status(202).json({"success":false,"message":"Invalid credentials.","error":{"random":"Invalid credentials."}})
                    }
                })
            }
            else
            {
                return res.status(202).json({"success":false,"message":"Invalid credentials.","error":{"random":"Invalid credentials."}})
            }
        })
        .catch((err)=>{
            return res.status(404).json({"success":false,"message":err});
        })
    }
    else
    {
        let customizedError = getCustomizedError(errors.array());
        return res.status(202).json({"success":false,"message":"Certain errors found during login.","error":customizedError})
    }
})



router.get('/logoutUser',(req,res)=>{
    return res.clearCookie('loginToken').status(200).json({"success":false,"message":"Logged Out."})
})


module.exports = router;