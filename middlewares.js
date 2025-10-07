const jwt = require("jsonwebtoken") ;
const { User , Account } = require('./db.js') ;
const {JWT_KEY} = require("./jwtSecret.js") ;

async function checkUserExistence(req,res,next) {
   const userId = req.body.userId ;
   
   const checkUserId = await User.findOne({
       userId : userId
   }) ;
   if(checkUserId) {
       res.status(404).json({
           msg : "email already taken / incorrect inputs"
       })
   }
   else {
       
       next() ;
   }
}







function auth(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer")) {
        res.status(400).json({
            msg: "no auth header"
        })
    }
    try {
 
        const token = authHeader.split(' ')[1];

        const decoded = jwt.verify(token, JWT_KEY);
        
        if (decoded) {
            req.userId = decoded ;
            next();
        }
        else {
            res.status(403).json({
                msg: "error in verifying"
            });
        }
    }
    catch (err) {
        res.status(403).json({
            msg: "global error in verifying"
        });
    }
}

















module.exports = {
    checkUserExistence , auth
}