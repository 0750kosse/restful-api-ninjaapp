const express = require('express');
const router = express.Router();
const setupApiController = require('./controllers/apiController');
const setUpFrontEndController = require('./controllers/frontendController');

router.use(setupApiController());
router.use(setUpFrontEndController());

module.exports = router;