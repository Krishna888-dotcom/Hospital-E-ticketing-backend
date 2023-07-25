const mongoose = require('mongoose');
const {ObjectId} = require('bson');

const Hospital = mongoose.model('Hospital',{
    "hospitalName":{"type":String,"required":true},
    "location":{"type":String,"required":true},
    "emailAddress":{"type":String,"required":true,"unique":true},
    "mobileNumber":{"type":String,"required":true},
    "officeNumber":{"type":String,"required":true},
    "personName":{"type":String,"required":true},
    "designation":{"type":String,"required":true},
    "userName":{"type":String,"required":true,"unique":true},
    "password":{"type":String,"required":true},
    "hospitalCode":{"type":String,"required":true},
    "joinedAt":{"type":String,"required":true},
    "hospitalImage":{"type":String,"required":true,"default":"no-img.png"},
    "department":{"type":[String],"required":true,"default":[]},
    "locationPoint":{
        "type":{
            "type":String,
            "default":"Point",
            "required":true
        },
        "coordinates":{
            "type":[Number],
            "required":true,
            "default":[],
            "index":"2dsphere"
        }
    }

})

module.exports = Hospital;