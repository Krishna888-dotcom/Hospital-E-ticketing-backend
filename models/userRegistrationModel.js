const mongoose = require('mongoose');
const {ObjectId} = require('bson');


const UserRegistration = mongoose.model('UserRegistration',{
    "firstName":{"type":String,"required":true},
    "lastName":{"type":String,"required":true},
    "userName":{"type":String,"required":true,"unique":true},
    "email":{"type":String,"required":true,"unique":true},
    "phoneNumber":{"type":String,"required":true,"unique":true},
    "password":{"type":String,"required":true,"select":false},
    "dob":{"type":String,"required":true},
    "dob2":{"type":String,"required":true},
    "address":{"type":String,"required":true},
    "createdAt":{"type":String,"required":true},
    "activation":{"type":Boolean,"required":true,"default":false},
    "isOnline":{"type":Boolean,"required":true,"default":false},
    "userType":{"type":String,"required":true,"enum":['User',"Admin","Hospital"],"default":'User'},
    "gender":{"type":String,"required":true},
    "profilePicture":{"type":String,"required":true,"default":'no-photo.jpg'},
    "lastLogin":{"type":Date},
    "wishedDate":{"type":String,"required":true},
    "fancyCreation":{"type":String,"required":true}
})

module.exports = UserRegistration;