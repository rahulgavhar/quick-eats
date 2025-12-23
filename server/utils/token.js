import jwt from 'jsonwebtoken';
import ENV from '../config/env.js';

const genToken = (userId) => {
    try {
        const token = jwt.sign({userId}, ENV.JWT_SECRET, { expiresIn: '7d' });
        return token;
    }catch (error) {
        console.error('Error generating token:', error);
        throw new Error('Token generation failed');
    }
};

export default genToken;