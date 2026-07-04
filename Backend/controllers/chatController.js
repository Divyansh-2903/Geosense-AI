const { getChatAdvice } = require('../services/geminiAdvisorService');

module.exports = async function chatController(req, res) {
  try {
    const { reportData, chatHistory = [], message } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    if (!reportData) {
      return res.status(400).json({ error: 'Report data is required for context' });
    }

    const responseText = await getChatAdvice(reportData, chatHistory, message);
    res.json({ reply: responseText });
  } catch (error) {
    console.error('Error in chatController:', error);
    res.status(500).json({ error: error.message });
  }
};
