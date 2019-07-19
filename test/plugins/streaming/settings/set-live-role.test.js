const {of} = require('rxjs');
const {tap, toArray} = require('rxjs/operators');
const Collection = require('discord.js').Collection;
const ConfigAction = require('chaos-core').ConfigAction;

const StreamingService = require('../../../../plugins/streaming/services/streaming-service');

describe('!config streaming setLiveRole', function () {
  beforeEach(function () {
    this.jasmine = stubJasmine();

    this.streamingService = sinon.createStubInstance(StreamingService);
    this.jasmine.stubService('streaming', 'StreamingService', this.streamingService);

    this.setLiveRole = new ConfigAction(this.jasmine, require('../../../../plugins/streaming/config/set-live-role'));
  });

  describe('properties', function () {
    it('has the correct name', function () {
      expect(this.setLiveRole.name).to.eq('setLiveRole');
    });

    it('has a required rule input', function () {
      expect(this.setLiveRole.inputs).to.containSubset([{name: 'role', required: true}]);
    });
  });

  describe('#run', function () {
    beforeEach(function () {
      this.guild = {
        id: 'guild-00001',
        roles: new Collection(),
      };

      this.context = {
        inputs: {},
        guild: this.guild,
      };
    });

    context('when role is missing', function () {
      beforeEach(function () {
        delete this.context.inputs.role;
      });

      it('returns a user readable error', function (done) {
        this.setLiveRole.run(this.context).pipe(
          toArray(),
          tap((emitted) => expect(emitted).to.deep.eq([
            {status: 400, content: `A role is to assign users is required`},
          ])),
        ).subscribe(() => done(), (error) => done(error));
      });
    });

    context('when the role can not be found', function () {
      beforeEach(function () {
        this.context.inputs.role = "role-not-found";
      });

      it('returns a user readable error', function (done) {
        this.setLiveRole.run(this.context).pipe(
          toArray(),
          tap((emitted) => expect(emitted).to.deep.eq([
            {status: 400, content: `The role 'role-not-found' could not be found.`},
          ])),
        ).subscribe(() => done(), (error) => done(error));
      });
    });

    context('when the role exists', function () {
      let roleId = '55500001';
      let roleName = 'testRole';

      beforeEach(function () {
        this.role = {
          id: roleId,
          name: roleName,
        };
        this.guild.roles.set(this.role.id, this.role);
      });

      Object.entries({
        'when a role is given as a mention': `<@${roleId}>`,
        'when a role is given as a mention (with &)': `<@&${roleId}>`,
        'when a role is given as an id': roleId,
        'when a role is given as a name': roleName,
      }).forEach(([contextMsg, value]) => {
        context(contextMsg, function () {
          beforeEach(function () {
            this.context.inputs.role = value;
            this.streamingService.setLiveRole.returns(of(this.role));
          });

          it('sets the live role to the correct role', function (done) {
            this.setLiveRole.run(this.context).pipe(
              toArray(),
              tap(() => expect(this.streamingService.setLiveRole).to.have.been.calledWith(this.guild, this.role)),
            ).subscribe(() => done(), (error) => done(error));
          });

          it('returns a success message', function (done) {
            this.setLiveRole.run(this.context).pipe(
              toArray(),
              tap((emitted) => expect(emitted).to.deep.eq([
                {status: 200, content: `Live streamers will now be given the ${this.role.name} role.`},
              ])),
            ).subscribe(() => done(), (error) => done(error));
          });
        });
      });
    });
  });
});
