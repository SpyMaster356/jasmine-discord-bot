const {tap} = require('rxjs/operators');
const ChaosCore = require('chaos-core');
const Path = require('path');

const packageJson = require('./package');

const defaultConfig = {
  ownerUserId: null,
  loginToken: null,

  logger: {
    level: 'info',
  },

  dataSource: {
    type: 'disk',
    dataDir: Path.join(__dirname, 'data'),
  },

  plugins: [
    "auto-role",
    require('./plugins/mod-tools'),
    require('./plugins/ow-info'),
    require('./plugins/ow-mains'),
    require('./plugins/streaming'),
    require('./plugins/topics'),
  ],

  broadcastTokens: {},
  networkModLogToken: null,
};

class Jasmine extends ChaosCore {
  constructor(config) {
    super({
      ...defaultConfig,
      ...config,
    });

    if (!this.config.owmnServerId) {
      throw new Error("owmnServerId is required");
    }
  }

  listen() {
    return super.listen().pipe(
      tap(() => this.discord.user.setPresence({
        game: {
          name: `v${packageJson.version}`,
        },
      })),
    );
  }
}

module.exports = Jasmine;
