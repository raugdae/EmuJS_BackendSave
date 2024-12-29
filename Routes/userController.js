const UserModel = require('./userModel');
const jwt = require('jsonwebtoken');

class UserController{

    static async register(req,res){
        try{
            const {email, password} = req.body;

            if(!email || !password) {
                return res.status(400).json({message : 'email or password should not be empty'});
            }

            const user = await UserModel.createUser(email,password);

            const
             token = jwt.sign({userId:user.id, email:user.email},process.env.JWT_SECRET, {expiresIn : '24h'});

             res.status(201).json({
                messsge : 'User created'
             ,token});
        } catch (error) {
            return res.status(400).json({message : 'error while creating user'});
        }
    }
}