const jwt = require('jsonwebtoken');
const db = require('../mysql/connection');
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

  const authorize = (...allowedRoles) => {
    return async (req, res, next) => {
        const token = req.headers['authorization'];
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = decoded;
            console.log("req.user:",req.user);
            console.log("req.user.id:",req.user.id);
            if (!req.user || !req.user.id) {
                return res.status(401).json({ message: "Unauthorized: User not authenticated" });
            }
            if (!req.user.role_id || !req.user.branch_id) {
                const user = await db('users')
                    .select('role_id', 'branch_id')
                    .where({ user_id: req.user.id })
                    .first();

                if (!user) {
                    return res.status(403).json({ message: "Access denied: User not found" });
                }
                req.user.role_id = user.role_id;
                req.user.branch_id = user.branch_id;
            }

            console.log(`User ID: ${req.user.id}, Role ID: ${req.user.role_id}, Branch ID: ${req.user.branch_id}`);
            if (!allowedRoles.includes(req.user.role_id)) {
                return res.status(403).json({ message: "Access denied: Insufficient permissions" });
            }

          
            // if (req.user.branch_id !== someSpecificBranchID) {
            //     return res.status(403).json({ message: "Access denied: Incorrect branch" });
            // }
            next();
            
        } catch (error) {
            console.error("Authorization error:", error);
            res.status(500).json({ message: "Internal Server Error" });
        }
    };
};

module.exports = { authenticateUser ,authorize};
