const fs = require('fs');

function getRandom(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min; // The maximum is inclusive and the minimum is inclusive
}

module.exports = function (client, getRandomDate) { // eslint-disable-line func-names
  function realmOfDeath() {
    let mostFilledChannel;
    let mostMembers = 0;

    const server = client.guilds.get(process.env.SERVER_ID);

    server.channels.forEach((channel) => {
      if (channel.type === 'voice' && channel.members.size > mostMembers) {
        mostMembers = channel.members.size;
        mostFilledChannel = channel.id;
      }
    });

    if (mostFilledChannel === undefined) return;

    mostFilledChannel = server.channels.get(mostFilledChannel);

    const randomMember = mostFilledChannel.members.get([...mostFilledChannel.members.keys()][getRandom(0, mostFilledChannel.members.size - 1)]);

    mostFilledChannel.join()
      .then((connection) => new Promise((resolve) => {
        const voices = fs.readdirSync(process.env.TAUNT_VOICES_DIR);
        const dispatcher = connection.playFile(`${process.env.TAUNT_VOICES_DIR}/${(voices.splice(getRandom(0, voices.length - 1), 1))[0]}`);

        dispatcher.on('end', () => resolve(randomMember.setVoiceChannel(process.env.SHADOW_REALMS_CHANNEL_ID)));
      }))
      .then(() => {
        const shadowRealmsChannel = client.channels.get(process.env.SHADOW_REALMS_CHANNEL_ID);
        return shadowRealmsChannel.join();
      })
      .then((connection) => {
        const voices = fs.readdirSync(process.env.SHADOW_REALMS_VOICES_DIR);
        const dispatcher = connection.playFile(`${process.env.SHADOW_REALMS_VOICES_DIR}/${(voices.splice(getRandom(0, voices.length - 1), 1))[0]}`);
        dispatcher.on('end', () => connection.disconnect());

        global.mordeTimeout = setTimeout(() => realmOfDeath(), getRandomDate() - (new Date()).getTime());
      })
      .catch((err) => console.error(err));
  }

  return {
    realmOfDeath
  };
};
