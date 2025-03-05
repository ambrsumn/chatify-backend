const express = require('express');
const db = require('../database/db');
require('dotenv').config();


const manageGroup = async (req, res) => {
    try {
        let { groupName, createdBy, adminName, groupMembers } = req.body;
        console.log(groupName, createdBy, groupMembers);

        let createGroupQuery = `INSERT INTO chatGroups (groupName, adminId) VALUES (?, ?)`;
        let createdGroup = await new Promise((resolve, reject) => {
            db.query(createGroupQuery, [groupName, createdBy], (err, result) => {
                if (err) reject(err);
                resolve(result);
            });
        });

        console.log(createdGroup.insertId);
        let groupRoomId = `${groupName}-${createdGroup.insertId}`;

        db.query(`UPDATE chatGroups SET groupRoomId = ? WHERE groupId = ?`, [groupRoomId, createdGroup.insertId], (err, result) => {
            if (err) {
                console.log(err);
                res.status(500).json({
                    success: false,
                    message: err
                });
            }
        });

        let addAdminQuery = `INSERT INTO groupMembers (groupId, memberId, is_admin) VALUES (?, ?, ?)`;

        let params = [createdGroup.insertId, createdBy, true];

        let addAdmin = await new Promise((resolve, reject) => {
            db.query(addAdminQuery, params, (err, result) => {
                if (err) reject(err);
                resolve(result);
            });
        });

        for (let i = 0; i < groupMembers.length; i++) {
            let sendInvitationQuery = `INSERT INTO invitations (groupName, senderId, senderName, currentStatus, groupId, receiverId) VALUES (?, ?, ?, ?, ?, ?)`;

            let params = [groupName, createdBy, adminName, 'pending', createdGroup.insertId, groupMembers[i]];
            db.query(sendInvitationQuery, params, (err, result) => {
                if (err) reject(err);
                // resolve(result);
            });
        }

        return res.status(200).json({
            message: 'Group created successfully and all members are invited',
            success: true,
            data: createdGroup
        });


    }
    catch (err) {
        res.status(500).json({
            message: err,
            success: false,
            error: err
        })
    }
}

module.exports = {
    manageGroup
}