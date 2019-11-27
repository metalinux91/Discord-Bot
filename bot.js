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

const morde = require('./champions/morde')(client, getRandomDate);
const msgHandler = require('./msgHandler')(morde, getRandomDate);

global.mordeTimeout = null;

client.on('ready', () => console.log(`Logged in as ${client.user.tag}`));

client.on('error', (err) => console.error(err));

client.on('message', (msg) => msgHandler.handler(msg));

// Set timeout for Mordekaiser on bot start
global.mordeTimeout = setTimeout(() => morde.realmOfDeath(), getRandomDate() - (new Date()).getTime());

client.login(process.env.DISCORD_TOKEN);
