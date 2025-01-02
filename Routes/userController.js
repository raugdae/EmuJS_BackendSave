const express = require('express');
const router = express.Router();
const pool = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const crypto = require('node:crypto');

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_SERVER,
    port: process.env.MAIL_PORT,
    secure: process.env.SMTP_SECURE,
    auth: {
        user:process.env.MAIL_USER,
        pass: process.env.MAIL_PASSWORD
    } 
    
})

// Route pour l'enregistrement
router.post('/register', async (req, res) => {
    try {
        console.log('registering function entered');
        const { email, password, username } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'email or password should not be empty' });
        }

        // Vérifie si l'utilisateur existe
        const userExists = await pool.query(
            'SELECT * FROM users WHERE email = $1',
            [email]
        );

        if (userExists.rows.length > 0) {
            return res.status(409).json({ message: 'User already exists' });
        }

        // Hash le mot de passe
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Insère le nouvel utilisateur
        const result = await pool.query(
            `INSERT INTO users (
                email, 
                password, 
                lastlogin,
                locked,
                nickname
            ) VALUES ($1, $2, CURRENT_DATE, false,$3) 
            RETURNING id, email`,
            [email, hashedPassword, username]
        );

        const user = result.rows[0];

        // Crée le token
        const token = jwt.sign(
            { userId: user.id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(201).json({
            message: 'User created successfully',
            user: {
                id: user.id,
                email: user.email
            },
            token
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Error while creating user' });
    }
});

router.post('/login', async (req,res) => {
    console.log("Entering login function");
    try {
        const { email, password } = req.body;
        const userExist = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

        const updateLoginDate = 'UPDATE users SET lastlogin = CURRENT_TIMESTAMP WHERE id = $1';
        
        if (userExist.rows.length === 0) {
            return res.status(403).json({message: 'User not found'});
        }
        
        const selectedUser = userExist.rows[0];
        console.log(selectedUser);
        
        const validPassword = await bcrypt.compare(password, selectedUser.password);
        if (!validPassword) {
            return res.status(403).json({message: 'Wrong credentials'});
        }
        else{
            pool.query(updateLoginDate,[selectedUser.id]);
        }
        
        const token = jwt.sign(
            { userId: selectedUser.id }, 
            process.env.JWT_SECRET, 
            {expiresIn: '24h'}
        );
        
        return res.json({
            message: 'Login successful',
            token,
            user: {
                id: selectedUser.id,
                email: selectedUser.email
            }
        });
    }
    catch (error) {
        console.error('login error : ', error);
        return res.status(500).json({message: 'Error during login'});
    }
});

router.post('/resetpassword', async (req,res) =>{

    const {userMail} = req.body;

    try{

        const cryptedToken = crypto.randomBytes(32).toString('hex');
        const tokenExpiration = new Date(Date.now() + 360000);

        const resetToken = jwt.sign(
            {
                userMail: userMail,
                cryptedToken: cryptedToken,
                type:'password_reset'
            },
            process.env.JWT_SECRET,
            {expiresIn : '1h'}
        );

        await pool.query('UPDATE users SET token_reset = $1, token_reset_expiration = $2 WHERE email = $3',[resetToken,tokenExpiration,userMail]);

        const resetLink = `${process.env.API_ADDRESS}:${process.env.API_LISTENING_PORT}/updatepassword?token=${resetToken}`;

        const mailContent = {
            from: `"RaugEmu No-Reply" ${process.env.MAIL_USER}`,
            to : userMail,
            subject : "Reset your password to RaugEmu",
            text : `Copy paste this link in your browser to reset your password ${resetLink}`,
            html: `<p> follow this link to reset your password</p> 
            <a href="${resetLink}">Reset my password</a>
            <p> This link will expire in 1 hour!</p>`
        }

        
        const mailStatus = await transporter.sendMail(mailContent);
        console.log("Mail sent successfully"+mailStatus.messageId);
        res.json({message : 'Reset instruction sent by mail'});

    }
    catch(err){
        console.log("Error while sending mail", err);
        res.status(500).json({message : 'Error on password reset'});
    }

});

router.post('/updatepassword', async(req,res) => {

    const {token,newPassword} = req.body;

    try {

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const {userMail, resetToken} = decoded;


        const result = await pool.query(`SELECT * FROM users 
                                            WHERE email = $1 AND token_reset = $2 AND token_reset_expiration > NOW()`,
                                        [userMail, resetToken]);


        if (result.rows.length === 0){
            return res.status(400).json({message : 'Token invalide ou expiré'});
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        const passchanged = await pool.query(`UPDATE users SET password = $1 WHERE email = $2`, [hashedPassword,userMail]);

        res.status(200).json(message,'Password updated successfully');


    }
    catch (err){
        if (err.name ==='TokenExpiredError'){
            return res.statut(400).json({message : 'Reset link expired'});
        }
        if (err.name === 'JsonWebTokenError'){
            return res.status(400).json({message: 'Reset link is not valid'});
        }
        console.error('Error :', err);
        res.status(500).json('Server internal error',err);
    }


});


module.exports = router;