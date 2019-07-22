const {of, throwError} = require('rxjs');
const {tap, toArray} = require('rxjs/operators');
const Collection = require('discord.js').Collection;
const ConfigAction = require('chaos-core').ConfigAction;

const StreamingService = require('../services/streaming-service');
const {RoleNotFoundError} = require('../lib/errors');

describe('!config streaming removeStreamerRole', function () {
  beforeEach(function () {
    this.role = {id: 'role-00001', name: 'testRole'};
    this.jasmine = stubJasmine();

    this.streamingService = sinon.createStubInstance(StreamingService);
    this.jasmine.stubService('streaming', 'StreamingService', this.streamingService);

    this.removeStreamerRole = new ConfigAction(this.jasmine, require('./remove-streamer-role'));
  });

  describe('properties', function () {
    it('has the correct name', function () {
      expect(this.removeStreamerRole.name).to.eq('removeStreamerRole');
    });

    it('has no inputs', function () {
      expect(this.removeStreamerRole.inputs).to.be.empty;
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

      this.streamingService.removeStreamerRole.returns(of(this.role));
    });

    it('removes the streamer role from the guild', function (done) {
      this.removeStreamerRole.run(this.context).pipe(
        toArray(),
        tap(() => expect(this.streamingService.removeStreamerRole).to.have.been.calledWith(this.guild)),
      ).subscribe(() => done(), (error) => done(error));
    });

    it('returns a success message', function (done) {
      this.removeStreamerRole.run(this.context).pipe(
        toArray(),
        tap((emitted) => expect(emitted).to.deep.eq([
          {
            status: 200,
            content: `I will no longer limit adding the live role to users with the role ${this.role.name}`,
          },
        ])),
      ).subscribe(() => done(), (error) => done(error));
    });

    context('when there was no previous streamer role', function () {
      beforeEach(function () {
        this.streamingService.removeStreamerRole.returns(throwError(new RoleNotFoundError('The role could not be found')));
      });

      it('gives a user readable error', function (done) {
        this.removeStreamerRole.run(this.context).pipe(
          toArray(),
          tap((emitted) => expect(emitted).to.deep.eq([
            {
              status: 400,
              content: `No streamer role was set.`,
            },
          ])),
        ).subscribe(() => done(), (error) => done(error));
      });
    });
  });
});