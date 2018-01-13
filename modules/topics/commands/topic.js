const Rx = require('rx');

module.exports = {
  name: 'topic',
  description: 'Open a new discussion channel',
  scope: 'text',

  args: [
    {
      name: 'channelName',
      description: 'The name of the channel to open',
      required: true,
    },
  ],

  run(context, response) {
    let topicService = context.nix.getService('topics', 'TopicService');

    let guild = context.guild;
    let channelName = context.args.channelName;

    let openCategory = topicService.getOpenTopicsCategory(guild);
    if (!openCategory) {
      response.type = 'message';
      response.content =
        "My apologies, I was not able to find the open topics category.";
      return response.send();
    }

    return Rx.Observable
      .fromPromise(context.guild.createChannel(channelName))
      .flatMap((channel) => channel.setParent(openCategory))
      .flatMap((channel) => channel.setPosition(1))
      .flatMap((channel) => {
        response.type = 'reply';
        response.content = 'I have opened the channel ' + channel.toString() + '.';
        return response.send();
      })
      .catch((error) => {
        response.type = 'message';

        if (error.name === 'DiscordAPIError') {
          if (error.message === "Missing Permissions") {
            response.content = `I'm sorry, but I do not have permission to create channels. I need the "Manage Channels" permission.`;
          }
          else if (error.message.includes("Invalid Form Body")) {
            response.content = `I'm sorry, Discord does not allow that channel name.`;
          }
          else {
            response.content = `I'm sorry, Discord returned an unexpected error when I tried to create the channel.`;
            context.nix.handleError(context, error, false);
          }
        }
        else {
          response.content = `I'm sorry, I ran into an unexpected problem.`;
          context.nix.handleError(context, error, false);
        }

        return response.send();
      });
  },
};
