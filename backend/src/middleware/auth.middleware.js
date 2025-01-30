const jwt = require('jsonwebtoken');

const authenticateUser = (req, res, next) => {
    console.log("authmiddleware calles for route: ", req.path)
    const token = req.headers['authorization'];
    if (!token) {
        return res.status(401).json({ error: 'Unauthorized: Token missing' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        console.log(req.user.id);
        next();
    } catch (err) {
        console.error('Token verification failed:', err);
        res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }
};

module.exports = { authenticateUser };
