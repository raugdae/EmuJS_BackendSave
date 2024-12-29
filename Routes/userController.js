const UserModel = require('./userModel');
const jwt = require('jsonwebtoken');

async function register(req, res) {
    try {
        console.log('registering function entered');
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'email or password should not be empty' });
        }

        const user = await UserModel.createUser(email, password);
        const token = jwt.sign(
            { userId: user.id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(201).json({
            message: 'User created',
            user: { id: user.id, email: user.email },
            token
        });
    } catch (error) {
        console.error('Registration error:', error);
        return res.status(500).json({ message: 'Error while creating user' });
    }
}

module.exports = { register };  // Export comme objet