const express = require('express');
const router = express.Router();
const { getAllTreatments, seedTreatments } = require('../controllers/treatmentController');

router.get('/', getAllTreatments);
router.post('/seed', seedTreatments);

module.exports = router;
