const express = require('express');
const router = express.Router();
const petController = require('../controllers/pet.controller');
const { requireAdmin } = require('../middlewares/auth.middleware');

router.get('/', petController.getPets);
router.post('/', requireAdmin, petController.createPet);
router.post('/seed', petController.seedPets);

module.exports = router;
