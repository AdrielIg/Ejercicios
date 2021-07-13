const options = require('../Config/sqlite')
const knex = require('knex')(options)
/* const mongoose = require('mongoose') */



knex.schema.hasTable('mensajes').then((exists) => {
  if (!exists) {
    return knex.schema.createTable('mensajes', (table) => {
      table.increments('id').primary();
      table.string('email', 50);
      table.string('text', 200);
      table.float('time');
    }).catch((err) => { console.log(err); throw err }).finally(console.log('tabla creada'))
  }
});

/* //Create Schema
const schema = mongoose.Schema({
  email: { type: String, require: true, max: 100 },
  text: { type: String, require: true, max: 150 },
  time: { type: Date, default: new Date() }

}); */

/* const Mensajes = mongoose.model('mensajes', schema) */

async function addMessage(email, text, time) {
  try {
    const newMessage = { email, text, time };
    await knex('mensajes').insert(newMessage);
  } catch (err) {
    console.error(err);
  }
  /* try {
    const newMessage = { email, text, time }
    const savedMessage = await Mensajes.create(newMessage)
    console.log(savedMessage)
  } catch (err) {
    console.error(err);
  } */
}

async function readMessages() {
  try {
    const messages = await knex.select().table('mensajes');
    return messages
  } catch (err) {
    console.error(err)
  }
  /* try {
    const messages = await Mensajes.find({});
    return messages
  } catch (err) {
    console.error(err)
  } */
}
module.exports = { addMessage, readMessages }