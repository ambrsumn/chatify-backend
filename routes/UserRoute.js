const express = require('express');
const router = express.Router();
const { signUp, verifyOtp, login, getUsers, logout, getPresentRoomId } = require('../controller/UserController');
const { authGuard } = require('../auth/Authguard');


router.post('/register', signUp);
router.post('/verifyOtp', verifyOtp);
router.post('/login', login);
router.post('/logout', authGuard, logout);

router.get('/getUsers', authGuard, getUsers);
router.get('/getroomId', authGuard, getPresentRoomId);
// router.get('/getUsers', getUsers);
module.exports = router;