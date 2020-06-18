require('dotenv').config();

const moment = require('moment-timezone');
const Discord = require('discord.js');

moment.tz.add('Europe/Lisbon|LMT WET WEST WEMT CET CEST|A.J 0 -10 -20 -10 -20|012121212121212121212121212121212121212121212321232123212321212121212121212121212121212121212121214121212121212121212121212121212124545454212121212121212121212121212121212121212121212121212121212121212121212121212121212121|-2le00 aPX0 Sp0 LX0 1vc0 Tc0 1uM0 SM0 1vc0 Tc0 1vc0 SM0 1vc0 6600 1co0 3E00 17c0 1fA0 1a00 1io0 1a00 1io0 17c0 3I00 17c0 1cM0 1cM0 3Fc0 1cM0 1a00 1fA0 1io0 17c0 1cM0 1cM0 1a00 1fA0 1io0 1qM0 Dc0 1tA0 1cM0 1dc0 1400 gL0 IM0 s10 U00 dX0 Rc0 pd0 Rc0 gL0 Oo0 pd0 Rc0 gL0 Oo0 pd0 14o0 1cM0 1cP0 1cM0 1cM0 1cM0 1cM0 1cM0 3Co0 1fA0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1fA0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1fA0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 pvy0 1cM0 1cM0 1fA0 1cM0 1cM0 1cN0 1cL0 1cN0 1cM0 1cM0 1cM0 1cM0 1cN0 1cL0 1cM0 1fA0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1fA0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1cM0 1fA0 1o00 11A0 1o00 11A0 1o00 11A0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00 11A0 1qM0 WM0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00 11A0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00 11A0 1o00 11A0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00 11A0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00 11A0 1o00 11A0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00 11A0 1qM0 WM0 1qM0 WM0 1qM0 WM0 1qM0 11A0 1o00 11A0 1o00|27e5');

const client = new Discord.Client();

function getRandomDate() {
  const now = moment.tz(process.env.SERVER_TIMEZONE);
  const year = now.year();
  let month = now.month() + 1;
  if (month.toString().length === 1) month = `0${month}`; // if day is less than 10, prefix 0

  let day = now.hour() < parseInt(process.env.MORDE_START_HOUR.split(':')[0], 10) ? now.date() : now.date() + 1;
  if (day.toString().length === 1) day = `0${day}`; // if day is less than 10, prefix a 0

  const startDate = moment.tz(`${year}-${month}-${day}T${process.env.MORDE_START_HOUR}`, process.env.SERVER_TIMEZONE);
  const endDate = moment.tz(`${year}-${month}-${day}T${process.env.MORDE_END_HOUR}`, process.env.SERVER_TIMEZONE);

  const min = Math.ceil(startDate.valueOf());
  const max = Math.floor(endDate.valueOf());

  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const morde = require('./champions/morde')(client, getRandomDate);
const msgHandler = require('./msgHandler')(morde, getRandomDate);

global.mordeTimeout = null;

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);

  // Set timeout for Mordekaiser on bot start
  global.mordeTimeout = setTimeout(() => morde.realmOfDeath(), getRandomDate() - (new Date()).getTime());
});

client.on('error', (err) => console.error(err));

client.on('message', (msg) => msgHandler.handler(msg));

client.login(process.env.DISCORD_TOKEN);
