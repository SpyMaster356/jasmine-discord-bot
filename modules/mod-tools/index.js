const {DATAKEYS} = require('./utility');

module.exports = {
  name: 'modTools',
  permissions: ['mod'],
  defaultData: [
    {
      keyword: DATAKEYS.MOD_LOG_CHANNEL,
      data: null,
    },
  ],
  services: [
    require('./services/mod-log-service'),
  ],
  configActions: [
    require('./config/enableModLog'),
    require('./config/disableModLog'),
  ],
  commands: [
    require('./commands/warn.js'),
    require('./commands/ban.js'),
    require('./commands/unban.js'),
  ],
};
