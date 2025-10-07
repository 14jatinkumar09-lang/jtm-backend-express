const zod = require('zod') ;

const userZodSchema = zod.object({
    userId : zod.string() ,
    password : zod.string() ,
    firstName : zod.string() ,
    lastName : zod.string()
})

const updateUserDetailSchema = zod.object({
    password:zod.string() ,
    firstName : zod.string() ,
    lastName : zod.string()
})




module.exports = {
    userZodSchema ,
    updateUserDetailSchema
}