const options = require('../Config/sqlite')
const knex = require('knex')(options)



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

async function addMessage(email, text, time) {
  try {
    const newMessage = { email, text, time };
    await knex('mensajes').insert(newMessage);
  } catch (err) {
    console.error(err);
  }
}

async function readMessages() {
  try {
    const messages = await knex.select().table('mensajes');
    return messages
  } catch (err) {
    console.error(err)
  }
}
module.exports = { addMessage, readMessages }