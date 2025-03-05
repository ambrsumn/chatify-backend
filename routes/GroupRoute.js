const express = require('express');
const router = express.Router();
const { manageGroup } = require('../controller/GroupController');
const { authGuard } = require('../auth/Authguard');

router.post('/creategroup', authGuard, manageGroup);

module.exports = router;