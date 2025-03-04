const express = require('express');
const db = require('../database/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const nodemailer = require('nodemailer');

// Email sending function
const sendEmail = async (to, name, otp) => {
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail', // Change if using Yahoo, Outlook, etc.
            auth: {
                user: 'chatifyaapp@gmail.com', // Replace with your personal email
                pass: 'enwt jkqg puht xwvf' // Use an App Password instead of your real password
            }
        });

        let info = await transporter.sendMail({
            from: 'chatifyaapp@gmail.com',
            to: to,
            subject: 'OTP for account registration',
            text: `Hi ${name}, your otp for chatify account registration is ${otp}`,
        });

        return true;
    } catch (error) {
        // //// // console.error("Error sending email:", error);
        return false;
    }
};


const getUsers = async (req, res) => {

    try {
        let query = 'SELECT * FROM userTable';

        let users = await new Promise((resolve, reject) => {
            db.query(query, (err, result) => {

                if (err) reject(err);
                resolve(result);
            });
        });

        res.status(200).json({
            message: "User fetched successfully",
            success: true,
            data: users
        });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({
            message: 'Internal Server Error',
            error: error.message // Include error details in the response
        });
    }
}

const getPresentRoomId = async (req, res) => {
    try {
        let query = `SELECT roomId FROM userTable WHERE userId = ?`;
        let userId = req.query.userId;
        // // console.log(req.params.userId);
        let roomId = await new Promise((resolve, reject) => {
            db.query(query, [userId], (err, result) => {
                if (err) reject(err);
                resolve(result);
            });
        });
        // console.log(roomId[0].roomId);

        res.status(200).json({
            message: "Room Id fetched successfully",
            success: true,
            data: roomId[0].roomId
        });
    }
    catch (error) {
        res.status(500).json({
            message: 'Internal Server Error',
            error: error.message,
            success: false
        });
    }
}

const signUp = async (req, res) => {
    // //// // console.log(req.body);
    try {
        const { name, email, password } = req.body;
        //// // console.log(name, email, password);

        if (!name || !email || !password) {
            return res.status(200).json({
                message: "please fill all the fields",
                success: false
            });
        }

        let findUserQuery = `SELECT * FROM userTable WHERE email = ?`;
        let find = await new Promise((resolve, reject) => {
            db.query(findUserQuery, [email], (err, result) => {
                if (err) reject(err);
                resolve(result);
            });
        });

        // //// // console.log(find);

        if (find.length > 0) {
            return res.status(200).json({
                message: "User already exist",
                success: false
            });
        }

        let randomNumber = Math.floor(Math.random() * 1000000);
        // //// // console.log(randomNumber);
        //// // console.log(randomNumber);
        process.env.email_Otp = randomNumber;
        // //// // console.log(process.env.email_Otp);

        const emailSent = await sendEmail(email, name, randomNumber);

        if (!emailSent) {
            return res.status(500).json({
                message: "Error sending email",
                success: false
            });
        }

        //// // console.log("Email sent successfully");
        return res.status(200).json({
            message: "OTP sent successfully",
            success: true
        });
    }
    catch {
        res.status(500).json({
            message: 'Internal Server Error'
        })
    }
}

const login = async (req, res) => {
    try {

        const { email, password } = req.body;

        // //// // console.log(email, password);

        const findUserQuery = `SELECT * FROM userTable WHERE email = ?`;

        const user = await new Promise((resolve, reject) => {
            db.query(findUserQuery, [email], (err, result) => {
                // //// // console.log(result);
                // //// // console.log(err);
                if (err) reject(err);
                resolve(result);
            })
        });

        //// // console.log(user, email, password);

        if (user.length === 0) {
            res.status(200).json({
                message: "User not found",
                success: true
            });
        }

        let encPass = user[0].password;
        let match = await bcrypt.compare(password, encPass);
        //// // console.log(match);
        if (!match) {
            return res.status(200).json({
                message: "Invalid Password",
                success: false
            });
        }

        const token = jwt.sign(
            { email: email, name: user[0].name },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN }
        );

        // let currentDateTime = new Date().toISOString().slice(0, 19).replace('T', ' '); // Format: 'YYYY-MM-DD HH:MM:SS'

        let updateQuery = `UPDATE userTable SET is_online = true WHERE email = '${email}'`;


        //// // console.log(updateQuery);

        let updatedUser = await new Promise((resolve, reject) => {
            db.query(updateQuery, (err, result) => {
                if (err) reject(err);
                resolve(result);
            })
        });

        // //// // console.log(updatedUser);

        return res.status(200).json({
            message: "Login Successfully",
            success: true,
            token: token,
            userDetails: {
                name: user[0].name,
                email: user[0].email,
                userId: user[0].userId
            }
        });



    } catch (error) {
        //// // console.error("Login Error:", error);  // Debugging info
        res.status(500).json({
            message: 'Internal Server Error',
            error: error.message // Include error details in the response
        });
    }
}

const logout = async (req, res) => {
    try {
        let { email } = req.body;
        // // console.log(email);

        let options = {
            timeZone: "Asia/Kolkata",
            hour12: false,
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        };

        let currentDateTime = new Intl.DateTimeFormat("en-GB", options).format(new Date());
        currentDateTime = currentDateTime.replace(',', '');

        // console.log(currentDateTime);

        let query = `UPDATE userTable SET is_online = false, lastSeen = '${currentDateTime}', roomId=null WHERE email = '${email}'`;

        let updatedUser = await new Promise((resolve, reject) => {
            db.query(query, (err, result) => {
                if (err) reject(err);
                resolve(result);
            })
        });

        if (updatedUser.affectedRows === 0) {
            return res.status(200).json({
                message: "User not found",
                success: false
            });
        }

        return res.status(200).json({
            message: "Logout Successfull",
            success: true
        });
    }
    catch (error) {
        res.status(500).json({
            message: 'Internal Server Error',
            error: error.message // Include error details in the response
        });
    }
}

const verifyOtp = async (req, res) => {
    try {
        const { name, email, password, otp, } = req.body;

        //// // console.log(process.env.email_Otp, otp);

        if (+process.env.email_Otp !== +otp) {
            return res.status(200).json({
                message: "Invalid Otp",
                success: false
            });
        }

        let insertQuery = 'INSERT INTO userTable (name, email, password) VALUES (?, ?, ?)';
        let hashPassword = await bcrypt.hash(password, 10);

        let result = await new Promise((resolve, reject) => {
            db.query(insertQuery, [name, email, hashPassword], (err, result) => {
                if (err) reject(err);
                resolve(result);
            });
        });

        return res.status(200).json({
            message: "User created successfully",
            success: true,
            data: result
        });
    }
    catch {
        res.status(500).json({
            message: 'Internal Server Error'
        })
    }
}

module.exports = {
    signUp,
    verifyOtp,
    login,
    getUsers,
    logout,
    getPresentRoomId
}