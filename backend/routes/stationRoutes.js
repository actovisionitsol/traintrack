const express = require('express');
const router = express.Router();
const stationController = require('../controllers/stationController');
// const authenticateToken = require('../middleware/authMiddleware'); 
// We might want search to be public or protected? User context implies logged in app mostly.
// But let's keep it protected to be consistent, or public if needed for login page?
// The user request involves "Seat Availability" and "Live Station" which seem to require login in the current app flow.
// I'll add the auth middleware to be safe, consistent with other routes.

const authenticateToken = require('../middleware/authMiddleware');

router.get('/stations', authenticateToken, stationController.searchStations);

module.exports = router;
