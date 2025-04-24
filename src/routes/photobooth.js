const express = require('express');
const router = express.Router();

router.post('/session', (req, res) => {
  // Mock session creation
  res.json({ sessionId: 'mock-session-123' });
});

module.exports = router;