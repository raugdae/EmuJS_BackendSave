const jwt = require('jsonwebtoken');

const authMiddleware = (req, res,next) =>{
    try {

        //console.log('entering middleware');
        const token = req.headers.authorization?.split(' ')[1];

        if(!token){
            console.log('No Token returning 401');
            return res.status(401).json({message:'Authentication required'});
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        req.user=decoded;

        next();
        

    }catch (error){
        return res.status(401).json({message :'Invalid token'});
    }
}

module.exports = authMiddleware;