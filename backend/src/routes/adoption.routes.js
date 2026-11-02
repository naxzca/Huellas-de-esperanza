const express = require('express');
const adoptionController = require('../controllers/adoption.controller');

const router = express.Router();
router.post('/', adoptionController.createAdoption);
router.get('/', adoptionController.getAdoptions);

module.exports = router;
