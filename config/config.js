const Path = require('path');

const privateConfig = require('./private.js');

module.exports = {
  ownerUserId: privateConfig.ownerUserId,
  loginToken: privateConfig.loginToken,

  dataSource: {
    type: 'disk',
    dataDir: Path.join(__dirname, '../data'),
  },

  broadcastTokens: privateConfig.broadcastTokens,
};
