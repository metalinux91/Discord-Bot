const fs = require('fs');

function getRandom(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min; // The maximum is inclusive and the minimum is inclusive
}

module.exports = function (client, getRandomDate) { // eslint-disable-line func-names
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

    // If Pires is connected to the most filled channel, choose him. Otherwise, get a random member
    let randomMember;
    if ([...mostFilledChannel.members.keys()].find((member) => member === process.env.PIRES_ID) !== undefined) {
      randomMember = mostFilledChannel.members.get(process.env.PIRES_ID);
    } else {
      randomMember = mostFilledChannel.members.get([...mostFilledChannel.members.keys()][getRandom(0, mostFilledChannel.members.size - 1)]);
    }

    mostFilledChannel.join() // connect to channel
      .then((connection) => new Promise((resolve) => {
        // play random voice clip
        const voices = fs.readdirSync(process.env.TAUNT_VOICES_DIR);
        const dispatcher = connection.playFile(`${process.env.TAUNT_VOICES_DIR}/${(voices.splice(getRandom(0, voices.length - 1), 1))[0]}`);

        // on finishing the clip, send previously selected random member to "Shadow Realms" channel specified in .env
        dispatcher.on('end', () => resolve(randomMember.setVoiceChannel(process.env.SHADOW_REALMS_CHANNEL_ID)));
      }))
      .then(() => {
        // join the "Shadow Realms channel
        const shadowRealmsChannel = client.channels.get(process.env.SHADOW_REALMS_CHANNEL_ID);
        return shadowRealmsChannel.join();
      })
      .then((connection) => {
        // play a random clip and disconnect
        const voices = fs.readdirSync(process.env.SHADOW_REALMS_VOICES_DIR);
        const dispatcher = connection.playFile(`${process.env.SHADOW_REALMS_VOICES_DIR}/${(voices.splice(getRandom(0, voices.length - 1), 1))[0]}`);
        dispatcher.on('end', () => connection.disconnect());

        // set new timeout
        global.mordeTimeout = setTimeout(() => realmOfDeath(), getRandomDate() - (new Date()).getTime());
      })
      .catch((err) => console.error(err));
  }

  return {
    realmOfDeath
  };
};
