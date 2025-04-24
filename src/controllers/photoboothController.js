exports.startSession = async (req, res) => {
  try {
    // Mock starting a photobooth session
    const session = {
      id: 'session_' + Date.now(),
      status: 'READY'
    };

    res.json({
      success: true,
      session
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to start session'
    });
  }
};

exports.getPhotoResult = async (req, res) => {
  const { sessionId } = req.params;

  // Mock photo result
  const result = {
    sessionId,
    photos: [
      'mock_photo_1.jpg',
      'mock_photo_2.jpg',
      'mock_photo_3.jpg'
    ],
    timestamp: new Date()
  };

  res.json({
    success: true,
    result
  });
};