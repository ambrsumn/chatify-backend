const express = require('express');
const db = require('../database/db');
require('dotenv').config();

const getMessages = async (req, res) => {
    try {
        let channelKey = req.query.channelKey;
        console.log(channelKey);

        let query = `SELECT * FROM messages WHERE channelKey = ?`;

        const messages = await new Promise((resolve, reject) => {
            db.query(query, [channelKey], (err, result) => {
                if (err) reject(err);
                resolve(result);
            })
        });

        console.log(messages);

        return res.status(200).json({
            message: 'Messages fetched successfully',
            success: true,
            data: messages
        });
    }
    catch (err) {
        return res.status(500).json({
            message: 'Internal Server Error',
            success: false
        })
    }
}

module.exports = {
    getMessages
}