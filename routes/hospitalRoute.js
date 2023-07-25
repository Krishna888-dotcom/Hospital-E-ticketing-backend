const express = require('express');
const router = express.Router();
const Hospital = require('../models/hospitalModel');
const {check,validationResult} = require('express-validator');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload')
const validator = require('validator')
const {getCustomizedError,getUsername,genCode,getFormattedToday,getTimeValue} = require('../utils/utils')
const {sendMailMessage} = require('../utils/mail')
const bcryptjs = require('bcryptjs');


router.post('/addHospital',upload.single('hospitalImage'),auth.authorizeUser,auth.verifyAdmin,
 [
     check('hospitalName',"Hospital name cannot be left empty.").not().isEmpty(),
     check('emailAddress',"Email cannot be left empty.").not().isEmpty(),
     check('location',"Location cannot be left empty.").not().isEmpty(),
     check('mobileNumber',"Mobile Number cannot be left empty.").not().isEmpty(),
     check('officeNumber',"Office number cannot be left empty.").not().isEmpty(),
     check('personName',"Contact Person name cannot be left empty.").not().isEmpty(),
     check('designation',"Designation cannot be left empty.").not().isEmpty(),
     check('department',"Department cannot be left empty.").not().isEmpty(),
     check('latitude',"Latitude cannot be left empty.").not().isEmpty(),
     check('longitude',"Longitude be left empty.").not().isEmpty(),
     check('emailAddress','Inappropriate email address.').isEmail(),
     check('mobileNumber','Mobile number should contain only numeric characters.').isNumeric(),
     check('mobileNumber','Mobile number need to have exactly 10 characters.').isLength({"min":10,"max":10}),
     check('officeNumber','Office number should contain only numeric characters.').isNumeric(),
     check('hospitalName','Hospital name need to have atleast 8 characters.').isLength({"min":8}),
     check('latitude',"Latitude should be in numeric format.").isNumeric(),
     check('longitude',"Longitude should be in numeric format.").isNumeric()

 ]
,async (req,res)=>{
    try
    {
        let errors = validationResult(req);
        if(errors.isEmpty())
        {
            
            if(req.file == undefined)
            {
                return res.status(202).json({"success":false,"message":"Invalid image format.","error":{"hospitalImage":"Invalid image format."}})
            }
            else
            {
                let hospitalName = req.body['hospitalName'].trim();
                let emailAddress = req.body['emailAddress'].trim();
                let location = req.body['location'].trim();
                let mobileNumber = req.body['mobileNumber'].trim();
                let officeNumber = req.body['officeNumber'].trim();
                let personName = req.body['personName'].trim();
                let designation = req.body['designation'].trim();
                let hospitalImage = req.file.path;
                let department = req.body['department'].trim();
                let latitude = req.body['latitude'];
                let longitude = req.body['longitude'];
                let latLon = {"type":"Point","coordinates":[longitude,latitude]}
                
                let registeredHospitals = await Hospital.find({});
                let registeredEmail = registeredHospitals.map((val)=>{return val.emailAddress});
                let registeredUsername = registeredHospitals.map((val)=>{return val.userName});
                let registeredHospitalNames = registeredHospitals.map((val)=>{return val.hospitalName});
                let locations = registeredHospitals.map((val)=>{return val.location});
                let longitudePoints = registeredHospitals.map((val)=>{return val.locationPoint.coordinates[0]});
                let latitudePoints = registeredHospitals.map((val)=>{return val.locationPoint.coordinates[1]});
                let department1 = department.split(",").map((val)=>{return val.trim()});

                let unqLocation = Array.from(new Set(locations));
                

                let userName = getUsername(registeredUsername);
                let hospitalCode = genCode("alphaNumeric",6);
                let password = hospitalCode+"1234";

                let errorBox = {};
                
                if(registeredEmail.includes(emailAddress))
                {
                    errorBox['emailAddress'] = "Email Address already exists."
                }
                if(!validator.isAlpha(hospitalName.replace(" ","")))
                {
                    errorBox['hospitalName'] = "Hospital Name cannot contain numeric characters."
                }
                if(!validator.isAlpha(personName.replace(" ","")))
                {
                    errorBox['personName'] = "Person Name cannot contain numeric characters."
                }
                if(registeredHospitalNames.includes(hospitalName) && unqLocation.includes(location) && longitudePoints.includes(longitude) && latitudePoints.includes(latitude))
                {
                    errorBox['random'] = "Same hospital name with same location is already registered. You can update information of existing hospital if needed."
                }

                if(Object.keys(errorBox).length > 0)
                {
                    return res.status(202).json({"success":false,"message":"Certain errors found during registration of hospital.","error":errorBox})
                }
                else
                {
                    bcryptjs.hash(password,10,(err,hash)=>{
                        
                        const hospital = new Hospital({
                            "hospitalName":hospitalName,
                            "location":location,
                            "emailAddress":emailAddress,
                            "mobileNumber":mobileNumber,
                            "officeNumber":officeNumber,
                            "personName":personName,
                            "designation":designation,
                            "userName":userName,
                            "password":hash,
                            "hospitalCode":hospitalCode,
                            "hospitalImage":hospitalImage,
                            "locationPoint":latLon,
                            "joinedAt":getFormattedToday(new Date()),
                            "department":department1
                        })

                        hospital.save()
                        .then((result)=>{
                            let content = {
                                "heading":"Hospital Registration Successful!!",
                                "greeting":getTimeValue()+",",
                                "message":`${hospitalName} has been added successfully in ETicketing system.`,
                                "message2":"Your username and password is :",
                                "username":userName,
                                "password":password,
                                "message3":"Change the password from the settings section.",
                                "task":"Hospital Registration"
                            }
                            sendMailMessage("Hospital E-Ticketing",emailAddress,content);
                            return res.status(200).json({"success":true,"message":"Hospital Registered Successfully!!"});
                        })
                        .catch((err)=>{
                            console.log(err)
                            return res.status(404).json({"success":false,"message":err});
                        })
                    })
                    
                }


            }
        }
        else
        {
           let customizedError = getCustomizedError(errors.array());
           return res.status(202).json({"success":false,"message":"Certain errors found during registration of hospital.","error":customizedError})
        }
    }
    catch(err)
    {
        console.log(err);
        return res.status(404).json({"success":false,"message":err});
    }
})



router.get('/fetchHospitals',auth.authorizeUser,auth.verifyAdmin,(req,res)=>{
    let hospitals = Hospital.find({}).sort({"hospitalName":1});
    hospitals.then((data)=>{
        if(data.length > 0)
        {
            return res.status(200).json({"success":true,"message":`${data.length} records.`,"data":data})
        }
        else
        {
            return res.status(202).json({"success":false,"message":`0 records.`,"data":data})
        }
    })
    .catch((err)=>{
        return res.status(404).json({"success":false,"message":err});
    })
})


router.post('/editHospitalDetails',auth.authorizeUser,auth.verifyAdmin,[
     check('hospitalName',"Hospital name cannot be left empty.").not().isEmpty(),
     check('emailAddress',"Email cannot be left empty.").not().isEmpty(),
     check('location',"Location cannot be left empty.").not().isEmpty(),
     check('mobileNumber',"Mobile Number cannot be left empty.").not().isEmpty(),
     check('officeNumber',"Office number cannot be left empty.").not().isEmpty(),
     check('personName',"Contact Person name cannot be left empty.").not().isEmpty(),
     check('designation',"Designation cannot be left empty.").not().isEmpty(),
     check('department',"Department cannot be left empty.").not().isEmpty(),
     check('latitude',"Latitude cannot be left empty.").not().isEmpty(),
     check('longitude',"Longitude be left empty.").not().isEmpty(),
     check('emailAddress','Inappropriate email address.').isEmail(),
     check('mobileNumber','Mobile number should contain only numeric characters.').isNumeric(),
     check('mobileNumber','Mobile number need to have exactly 10 characters.').isLength({"min":10,"max":10}),
     check('officeNumber','Office number should contain only numeric characters.').isNumeric(),
     check('hospitalName','Hospital name need to have atleast 8 characters.').isLength({"min":8}),
     check('latitude',"Latitude should be in numeric format.").isNumeric(),
     check('longitude',"Longitude should be in numeric format.").isNumeric()

],async(req,res)=>{
    try{
        let errors = validationResult(req);
        if(errors.isEmpty())
        {
            let hospitalId = req.body['hospitalId'];
            let hospitalName = req.body['hospitalName'].trim();
            let emailAddress = req.body['emailAddress'].trim();
            let location = req.body['location'].trim();
            let mobileNumber = req.body['mobileNumber'].trim();
            let officeNumber = req.body['officeNumber'].trim();
            let personName = req.body['personName'].trim();
            let designation = req.body['designation'].trim();
            let department = req.body['department'].trim();
            let latitude = req.body['latitude'];
            let longitude = req.body['longitude'];
            let latLon = {"type":"Point","coordinates":[longitude,latitude]};
            
    
            let hospitalInstance = await Hospital.findOne({"_id":hospitalId});
            if(hospitalInstance != null)
            {
                let otherInstance = await Hospital.find({"_id":{$ne:hospitalId}});
                let emailContainer = otherInstance.map((val)=>{return val.emailAddress});
                let hospitalNameContainer = otherInstance.map((val)=>{return val.hospitalName});
                let locations = otherInstance.map((val)=>{return val.location});
                let unqLocation = Array.from(new Set(locations));
                let longitudePoints = otherInstance.map((val)=>{return val.locationPoint.coordinates[0]});
                let latitudePoints = otherInstance.map((val)=>{return val.locationPoint.coordinates[1]});
                let department1 = department.split(",").map((val)=>{return val.trim()});

                let errorBox = {};

                if(!validator.isAlpha(hospitalName.replace(" ","")))
                {
                    errorBox['hospitalName'] = "Hospital name should not contain numeric characters."
                }
                if(!validator.isAlpha(personName.replace(" ","")))
                {
                    errorBox['personName'] = "Person name should not contain numeric characters."
                }
                if(emailContainer.includes(emailAddress))
                {
                    errorBox['emailAddress'] = "Email Address already exists." 
                }
                if(hospitalNameContainer.includes(hospitalName) && unqLocation.includes(location) && longitudePoints.includes(longitude) && latitudePoints.includes(latitude))
                {
                    errorBox['random'] = "Same hospital name with same location is already registered. You can update information of existing hospital if needed."
                }

                if(Object.keys(errorBox).length > 0)
                {
                    return res.status(202).json({"success":false,"message":"Certain errors found during updating hospital details.","error":errorBox})
                }
                else
                {
                    let query = Hospital.updateOne({"_id":hospitalId},{
                        $set:{
                            "hospitalName":hospitalName,
                            "location":location,
                            "emailAddress":emailAddress,
                            "mobileNumber":mobileNumber,
                            "officeNumber":officeNumber,
                            "personName":personName,
                            "designation":designation,
                            "department":department1,
                            "locationPoint":latLon,
                        }
                    })

                    query.then((result)=>{
                        let content = {
                            "heading":"Hospital Data Updated!!",
                            "greeting":getTimeValue()+",",
                            "message":`Details of ${hospitalName} has been updated in ETicketing system.`,
                            "message2":"Check the updated details from your dashboard.",
                            "task":"HospitalUpdate1"
                        }
                        sendMailMessage("Hospital E-Ticketing",hospitalInstance.emailAddress,content);
                        if(hospitalInstance.emailAddress != emailAddress)
                        {
                            let content = {
                                "heading":"Hospital Data Updated!!",
                                "greeting":getTimeValue()+",",
                                "message":`Details of ${hospitalName} has been updated in ETicketing system.`,
                                "message2":"This mail address has been switched to main mail address to notify hospital activities. Check other updated details from your dashboard.",
                                "task":"HospitalUpdate2"
                            }
                            sendMailMessage("Hospital E-Ticketing",emailAddress,content);
                        }
                        return res.status(200).json({"success":true,"message":"Hospital Detail updated successfully."})
                    })
                    .catch((err)=>{
                        return res.status(404).json({"success":false,"message":err});
                    })
                }
    
            }
            else
            {
                return res.status(202).json({"success":false,"message":"Hospital with given data is unavailable!!","error":{"random":"Hospital with given data is unavailable."}});
            }
        }
        else
        {
            let customizedError = getCustomizedError(errors.array());
            return res.status(202).json({"success":false,"message":"Certain errors found during updating hospital details.","error":customizedError});
        }
    }   
    catch(err)
    {
        return res.status(404).json({"success":false,"message":err});
    }
})



router.put('/editPictureOfHospital',upload.single('hospitalImage'),auth.authorizeUser,auth.verifyAdmin,(req,res)=>{
    if(req.file == undefined)
    {
        return res.status(202).json({"success":false,"message":"Inappropriate file format!!"})
    }

    let hospitalId = req.body['hospitalId'];

    let query = Hospital.findOne({"_id":hospitalId});
    query.then((data)=>{
        if(data!=null)
        {
            Hospital.updateOne({"_id":hospitalId},{$set:{"hospitalImage":req.file.path}})
            .then((result)=>{
                let content = {
                    "heading":"Hospital Image Edited!!",
                    "greeting":getTimeValue()+",",
                    "message":`Image of ${data.hospitalName} has been changed in ETicketing system.`,
                    "message2":"Check the update from your dashboard.",
                    "task":"HospitalUpdate1"
                }
                sendMailMessage("Hospital E-Ticketing",data.emailAddress,content);
                return res.status(200).json({"success":true,"message":"Hospital Image Changed."})
            })
            .catch((err)=>{
               
                return res.status(404).json({"success":false,"message":err});
            })
        }
        else
        {
            return res.status(202).json({"success":false,"message":"Cannot find the detail of the hospital."})
        }
    })
    .catch((err)=>{
        return res.status(404).json({"success":false,"message":err});
    })
})

module.exports = router;