const express = require('express');
const router = express.Router();
const trainController = require('../controllers/trainController');
const authenticateToken = require('../middleware/authMiddleware');

router.get('/train-details', authenticateToken, trainController.getTrainDetails);
router.get('/train-info', authenticateToken, trainController.getTrainInfo);
router.get('/loco-position', authenticateToken, trainController.getLocoPosition);
router.get('/coach-composition', authenticateToken, trainController.getCoachComposition);
console.log("Registering /delay-analysis route");
router.get('/delay-analysis', authenticateToken, trainController.getDelayAnalysis);
router.get('/live-status', authenticateToken, trainController.getLiveTrainStatus);
router.get('/seat-availability', authenticateToken, trainController.getSeatAvailability);
router.get('/live-station', authenticateToken, trainController.getLiveStation);
router.get('/train-suggestions', authenticateToken, trainController.getTrainSuggestions);

module.exports = router;
