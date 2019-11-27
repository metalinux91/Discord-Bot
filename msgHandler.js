const {
  MORDE,
  TOGGLE_COMMAND,
  STATUS_COMMAND,
  MORDE_TOGGLE_ON,
  MORDE_TOGGLE_OFF,
  MORDE_STATUS_OFF,
  MORDE_STATUS_ON
} = require('./constants.js');

module.exports = function (morde, getRandomDate) { // eslint-disable-line func-names
  function handler(msg) {
    if (msg.channel.id !== process.env.MSG_CHANNEL_ID) return; // don't act unless message is sent in desired channel

    const prefix = msg.content.substring(0, 1);
    const content = msg.content.substring(1);

    if (prefix !== process.env.BOT_PREFIX) return;

    const [champion, command] = content.split(' ');

    switch (champion) {
      case MORDE:
        if (command === TOGGLE_COMMAND) { // toggle timeout on or off
          const roles = [...msg.member.roles.keys()]; // user roles in server
          const allowedToggleRoles = JSON.parse(process.env.ALLOWED_MORDE_TOGGLE_ROLES); // allowed roles in server

          // check if user is authorized to toggle
          let authorized = false;
          for (let i = 0; i < allowedToggleRoles.length; i += 1) {
            if (roles.find((role) => role === allowedToggleRoles[i]) !== undefined) {
              authorized = true;
              break;
            }
          }

          if (!authorized) return;

          if (global.mordeTimeout === null) {
            global.mordeTimeout = setTimeout(() => morde.realmOfDeath(), getRandomDate() - (new Date()).getTime());
            msg.channel.send(MORDE_TOGGLE_ON);
          } else {
            clearInterval(global.mordeTimeout);
            global.mordeTimeout = null;
            msg.channel.send(MORDE_TOGGLE_OFF);
          }
        } else if (command === STATUS_COMMAND) { // print a message informing of status
          global.mordeTimeout === null ? msg.channel.send(MORDE_STATUS_OFF) : msg.channel.send(MORDE_STATUS_ON); // eslint-disable-line no-unused-expressions
        }

        break;
      default:
    }
  }

  return { handler };
};
