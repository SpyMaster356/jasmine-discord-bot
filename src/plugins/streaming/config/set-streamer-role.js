const {RoleNotFoundError} = require("chaos-core").errors;
const {of} = require('rxjs');
const {map, flatMap, catchError} = require('rxjs/operators');

module.exports = {
  name: 'setStreamerRole',
  description: `Set a role to limit who can receive the live role`,

  inputs: [
    {
      name: 'role',
      required: true,
    },
  ],

  run(context) {
    const roleService = this.chaos.getService('core', 'RoleService');
    const streamingService = this.chaos.getService('streaming', 'StreamingService');
    let guild = context.guild;

    const roleString = context.inputs.role;
    if (!roleString) {
      return of({
        status: 400,
        content: `A role to watch is required`,
      });
    }

    return of('').pipe(
      flatMap(() => roleService.findRole(guild, roleString)),
      flatMap((role) => streamingService.setStreamerRole(guild, role)),
      map((streamerRole) => ({
        status: 200,
        content: `I will now only give the live role to users with the ${streamerRole.name} role`,
      })),
      catchError((error) => {
        if (error instanceof RoleNotFoundError) {
          return of({
            status: 400,
            content: `The role '${roleString}' could not be found.`,
          });
        }
      }),
    );
  },
};