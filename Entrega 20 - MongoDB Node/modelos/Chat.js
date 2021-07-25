/* const options = require('../Config/database')
const knex = require('knex')(options) */

const mongoose = require('mongoose')



/* knex.schema.hasTable('mensajes').then((exists) => {
  if (!exists) {
    return knex.schema.createTable('mensajes', (table) => {
      table.increments('id').primary();
      table.string('email', 50);
      table.string('text', 200);
      table.string('firstName', 200);
      table.string('lastName', 200);
      table.float('time');
    }).catch((err) => { console.log(err); throw err }).finally(console.log('tabla creada'))
  }
}); */

//Create Schema
const schema = mongoose.Schema({
  author: {
    email: { type: String, require: true, max: 100 },
    firstName: { type: String, require: true, max: 150 },
    lastName: { type: String, require: true, max: 150 },
    time: { type: Date, default: new Date() }
  },
  text: { type: String, require: true, max: 150 }


});

const Mensajes = mongoose.model('mensajes', schema)

async function addMessage(email, text, firstName, lastName) {
  /* try {
    const newMessage = { email, text, firstName, lastName, time };
    await knex('mensajes').insert(newMessage);
  } catch (err) {
    console.error(err);
  } */
  try {
    const newMessage = { email, firstName, lastName }
    const savedMessage = await Mensajes.create({ author: { ...newMessage }, text: text })

    console.log(newMessage)
  } catch (err) {
    console.error(err);
  }
}

async function readMessages() {
  /* try {
    const messages = await knex.select().table('mensajes');
    return messages
  } catch (err) {
    console.error(err)
  } */
  try {
    const messages = await Mensajes.find({});

    return messages
  } catch (err) {
    console.error(err)
  }
}




module.exports = { addMessage, readMessages }