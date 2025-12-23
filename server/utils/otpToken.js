import jwt from 'jsonwebtoken';
import ENV from '../config/env.js';

const genOtpToken = (userId) => {
    try {
        const token = jwt.sign({userId}, ENV.JWT_SECRET, { expiresIn: '1h' });
        return token;
    }catch (error) {
        console.error('Error generating token:', error);
        throw new Error('Token generation failed');
    }
};

export default genOtpToken;