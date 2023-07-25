let month = ['January','February','March','April','May','June','July','August','September',"October','November','December"]
let days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
let numbers = "0123456789";
let lowerCase = "abcdefghijklmnopqrstuvwxyz";
let overall = lowerCase + numbers + lowerCase.toUpperCase();
let alphabets = lowerCase + lowerCase.toUpperCase();

let pinBox = {
    "numeric":numbers,
    "alphaNumeric":overall,
    "alpha":alphabets
}

const getCustomizedError = (errors)=>{
    let errorBox = {};
    for(var i of errors)
    {
        if(!Object.keys(errorBox).includes(i.param))
        {
            errorBox[i.param] = i.msg
        }
        
    }
    return errorBox;
}

const digitizer = (n)=>{
    let num = n;
    if(num < 10)
    {
        num = "0"+num;
    }
    return num;
}

const getFancyDate = (date)=>{
    return `${date.getDate()} ${month[date.getMonth()]},${date.getFullYear()}`
}

const getFormattedToday = (date)=>{
    return `${date.getFullYear()}-${digitizer(date.getMonth()+1)}-${digitizer(date.getDate())}`
}

const getTimeValue = ()=>{
    let hour = new Date().getHours();
    if(hour < 12)
    {
        return "Good Morning"
    }
    else if(hour >=12 && hour < 16)
    {
        return "Good Afternoon"
    }
    else if(hour > 16){
        return "Good Evening"
    }
}

const genCode = (type,num)=>{
    let pinCode = "";
    let letterBox = pinBox[type];
    
    if(letterBox.length > 0)
    {
        if(Object.keys(pinBox).includes(type))
        {
            while(pinCode.length != num)
            {
                let index = parseInt(Math.random()*letterBox.length);
                pinCode+=letterBox[index];
                if(pinCode.length == num)
                {
                    break;
                }
            }
            return pinCode;
        }
        else
        {
            genCode("alphaNumeric",num);
        }
        
    }
    else
    {
        genCode("alphaNumeric",num)
    }

    
}


const getUsername = (data)=>{
    let username = `${new Date().getFullYear()}${digitizer(new Date().getMonth()+1)}${genCode('numeric',4)}`
    if(data.includes(username))
    {
        getUsername(data);
    }
    else
    {
        return username;
    }
}

module.exports = {getCustomizedError,getFormattedToday,getFancyDate,getTimeValue,getUsername,genCode}