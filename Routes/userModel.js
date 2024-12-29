const pool = require('../db');
const bycrpt = require('bcrypt');


    async function createUser(email,password){
        try {
            console.log('create user');
            const userExistes = await pool.query(
                'SELECT * FROM users WHERE email = $1',
                [email]
            );

            if (userExistes.rows.length > 0){
                throw new Error ('User already registred');
            }

            const saltRounds=10;
            const hashedPassword = await bycrpt.hash(password, saltRounds);

            const result = await pool.query(
                'INSERT INTO users ( email,password,lastlogin,locked) VALUES ($1, $2, CURRENT_DATE,false)  RETURNING id, email, creationdate', [email,hashedPassword]
            );
            return result.rows[0];

        }
        catch (error){
            throw error;
        }
    }


module.exports = {createUser};