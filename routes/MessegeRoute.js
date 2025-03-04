const express = require('express');
const router = express.Router();
const { getMessages } = require('../controller/MessageController');



router.get('/getUserMessages', getMessages);
module.exports = router;