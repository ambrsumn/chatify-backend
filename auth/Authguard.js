const express = require('express');
const jwt = require('jsonwebtoken');
const env = require('dotenv');
env.config();

const authGuard = (req, res, next) => {
    const token = req.headers.authorization && req.headers.authorization.split(' ')[1];
    // // // console.log(req.header)
    // // console.log(token);

    if (!token) {
        return res.status(403).json({
            sucess: false,
            message: 'No Token Found'
        });
    }


    jwt.verify(token, process.env.JWT_SECRET, (err, details) => {
        if (err) {

            if (err.name === 'TokenExpiredError') {
                return res.status(401).json({
                    success: false,
                    message: "Token expired"
                })
            }
            // // console.log(err);
            return res.status(401).json({
                success: false,
                message: "Invalid token"
            })
        }
        // // console.log(details);
        req.body.user = details;
        next();
    });
}

module.exports = { authGuard };