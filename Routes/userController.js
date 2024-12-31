const express = require('express');
const router = express.Router();
const pool = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

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

module.exports = router;