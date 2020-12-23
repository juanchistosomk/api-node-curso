

// Middleware

function log(req,res,next) {
    console.log('Logging...'); 
    // continua con el siguiente middleware
    next();
 };


 module.exports=log;
