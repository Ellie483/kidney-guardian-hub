// Controller function
const getTestMessage = (req, res) => {
  res.send('API is running from controller...');
};

module.exports = {
  getTestMessage,
};
