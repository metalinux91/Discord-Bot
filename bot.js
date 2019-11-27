require('dotenv').config();

const Discord = require('discord.js');

const client = new Discord.Client();

function getRandomDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const day = now.getDate() + 1;

  const startDate = new Date(`${year}-${month}-${day}T${process.env.MORDE_START_HOUR}`);
  const endDate = new Date(`${year}-${month}-${day}T${process.env.MORDE_END_HOUR}`);

  const min = Math.ceil(startDate.getTime());
  const max = Math.floor(endDate.getTime());
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const morde = require('./morde')(client, getRandomDate);

global.mordeTimeout = null;

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
});

client.on('error', (err) => {
  console.error(err);
});

client.on('message', (msg) => {
  if (msg.channel.id !== process.env.MSG_CHANNEL_ID) {
    return;
  }

  if (msg.content === '!morde toggle' && msg.member.user.id === process.env.USER_ID) {
    if (global.mordeTimeout === null) {
      global.mordeTimeout = setTimeout(() => morde.realmOfDeath(), getRandomDate() - (new Date()).getTime());
      msg.channel.send('The order is given!');
    } else {
      clearInterval(global.mordeTimeout);
      global.mordeTimeout = null;
      msg.channel.send('I return to my slumber once more...');
    }
  }

  if (msg.content === '!morde status' && msg.member.user.id === process.env.USER_ID) {
    if (global.mordeTimeout === null) {
      msg.channel.send('The lord of Death rests...');
    } else {
      msg.channel.send('Desolation is coming!');
    }
  }
});

global.mordeTimeout = setTimeout(() => morde.realmOfDeath(), getRandomDate() - (new Date()).getTime());

client.login(process.env.DISCORD_TOKEN);
