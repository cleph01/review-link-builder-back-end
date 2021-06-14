// require JWT to verify incoming
const jwt = require("jsonwebtoken");

const secret = require("../../config/secrets");

const authMiddleware = (req, res, next) => {
    const { authorization } = req.headers;

    if (authorization) {
        jwt.verify(authorization, secret, function (error, decodedToken) {
            if (error) {
                res.status(401).json({ message: "Invalid Token" });
            } else {
                req.token = decodedToken;

                next();
            }
        });
    } else {
        res.status(400).json({ message: "No Authorization Credentials" });
    }
};

module.exports = authMiddleware;
