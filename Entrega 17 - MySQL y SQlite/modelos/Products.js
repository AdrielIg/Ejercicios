const options = require('../Config/database')
const knex = require("knex")(options.mysql)



knex.schema.hasTable('productos').then((exists) => {
  if (!exists) {
    return knex.schema.createTable('productos', (table) => {
      table.increments('id').primary();
      table.string('title', 30);
      table.string('thumbnail', 100);
      table.float('price');
    }).catch((err) => { console.log(err); throw err })
  }
});

async function getProducts() {
  try {
    const products = await knex.select().table('productos');
    return products
  } catch (err) {
    console.log(err)
  }
}

async function getProduct(id) {
  try {
    const product = await knex('productos').where({ id: id });
    return product[0] // El primer (y unico) elemento del array de objetos

  } catch (err) {
    console.error(err)
  }
}

async function addProduct(title, price, thumbnail) {
  try {
    const newProduct = { title, price, thumbnail };
    const id = await knex('productos').insert(newProduct);
    if (id) {
      return {
        ...newProduct,
        id,
      };
    } else {
      return
    }
  } catch (err) {
    console.error(err);
  }
}

async function updateProduct(id, title, price, thumbnail) {
  try {
    const newProduct = { title, price, thumbnail };
    if (
      await knex('productos')
        .where('id', id)
        .update({ ...newProduct })
    ) {
      return {
        ...newProduct,
        id,
      };
    } else {
      return
    }
  } catch (err) {
    console.error(err);

  }
}

async function deleteProduct(id) {
  try {
    console.log('FUNCION EJECUTADA')
    const deletedProduct = await knex('productos').where({ id: id });
    if (await knex('productos').where({ id: id }).del()) {
      return deletedProduct;
    } else {
      return { error: 'No hay producto para borrar' }
    }
  } catch (err) {
    console.error(err);

  }
}

console.log('holi')

module.exports = { getProducts, getProduct, addProduct, updateProduct, deleteProduct }