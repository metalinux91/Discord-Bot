const fs = require('fs');

function getRandom(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min; // The maximum is inclusive and the minimum is inclusive
}

module.exports = function (client, getRandomDate, logger) { // eslint-disable-line func-names
  function realmOfDeath() {
    // find the voice channel with most users on it
    const server = client.guilds.get(process.env.SERVER_ID); // only act on server specified in .env
    let mostFilledChannel;
    let mostMembers = 0;

    server.channels.forEach((channel) => {
      if (channel.type === 'voice' && channel.members.size > mostMembers) {
        mostMembers = channel.members.size;
        mostFilledChannel = channel.id;
      }
    });

    // if there are no connected users, do nothing
    if (mostFilledChannel === undefined) {
      global.mordeTimeout = setTimeout(() => realmOfDeath(), getRandomDate() - (new Date()).getTime());
      return;
    }

    mostFilledChannel = server.channels.get(mostFilledChannel);

    // Get a random member
    // Turn map of members to array, filter out bots, get random index
    const randomMember = ([...mostFilledChannel.members.values()].filter((e) => !e.user.bot))[getRandom(0, mostFilledChannel.members.size - 1)];
    console.log(logger(`Gonna be moving ${randomMember.user.username}`));

    mostFilledChannel.join() // connect to channel
      .then((connection) => new Promise((resolve) => {
        // play random voice clip
        const voices = fs.readdirSync(process.env.TAUNT_VOICES_DIR);
        console.log(logger('Getting ready to play voice clip...'));
        const dispatcher = connection.playFile(`${process.env.TAUNT_VOICES_DIR}/${(voices.splice(getRandom(0, voices.length - 1), 1))[0]}`);

        // on finishing the clip, send previously selected random member to "Shadow Realms" channel specified in .env
        dispatcher.on('end', () => {
          console.log(logger('Played voice clip. About to move member...'));
          resolve(randomMember.setVoiceChannel(process.env.SHADOW_REALMS_CHANNEL_ID));
        });
      }))
      .then(() => {
        // join the "Shadow Realms channel
        const shadowRealmsChannel = client.channels.get(process.env.SHADOW_REALMS_CHANNEL_ID);
        console.log(logger('Moved member. Moving to his channel...'));
        return shadowRealmsChannel.join();
      })
      .then((connection) => {
        // play a random clip and disconnect
        const voices = fs.readdirSync(process.env.SHADOW_REALMS_VOICES_DIR);
        const dispatcher = connection.playFile(`${process.env.SHADOW_REALMS_VOICES_DIR}/${(voices.splice(getRandom(0, voices.length - 1), 1))[0]}`);
        console.log(logger('About to play voice clip...'));
        dispatcher.on('end', () => {
          console.log(logger('Played voice clip'));
          connection.disconnect();
          console.log(logger('Disconnected'));
        });

        // set new timeout
        global.mordeTimeout = setTimeout(() => realmOfDeath(), getRandomDate() - (new Date()).getTime());
      })
      .catch((err) => {
        if (err.message === 'You do not have permission to join this voice channel.') { // not allowed to join channel, set new timeout
          global.mordeTimeout = setTimeout(() => realmOfDeath(), getRandomDate() - (new Date()).getTime());
        } else { // any other error
          console.error(err);
        }
      });
  }

  return {
    realmOfDeath
  };
};
