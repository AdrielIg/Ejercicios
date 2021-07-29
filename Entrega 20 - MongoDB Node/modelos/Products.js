/* const options = require('../Config/database')
const knex = require("knex")(options.mysql) */
const mongoose = require('mongoose')
const faker = require('faker')



/* knex.schema.hasTable('productos').then((exists) => {
  if (!exists) {
    return knex.schema.createTable('productos', (table) => {
      table.increments('id').primary();
      table.string('title', 30);
      table.string('thumbnail', 100);
      table.float('price');
    }).catch((err) => { console.log(err); throw err })
  }
}); */

//Create Schema
const schema = mongoose.Schema({
  title: { type: String, require: true, max: 100 },
  thumbnail: { type: String, require: true, max: 200 },
  price: { type: Number, require: true }

});

const Productos = mongoose.model('products', schema)

async function getProducts() {
  try {
    const products = await Productos.find({});
    return products
  } catch (err) {
    console.log(err)
  }
  /* try {
    const products = await knex.select().table('productos');
    return products
  } catch (err) {
    console.log(err)
  } */
}

async function getProduct(id) {
  try {
    const product = await Productos.findById(id)
    return product
  } catch (err) {
    console.error(err)
  }

  /* try {
    const product = await knex('productos').where({ id: id });
    return product[0] // El primer (y unico) elemento del array de objetos

  } catch (err) {
    console.error(err)
  } */
}

async function addProduct(title, price, thumbnail) {
  try {
    const newProduct = await Productos.create({ title: title, thumbnail: thumbnail, price: price })

    return newProduct
  } catch (err) {
    console.error(err)

  }
  /* try {
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
  } */
}

async function updateProduct(id, titleChange, priceChange, thumbnailChange) {
  try {
    const { _id, title, thumbnail, price } = await Productos.findById(id)
    const updated = await Productos.updateOne({ _id: id }, { $set: { title: titleChange || title, thumbnail: thumbnailChange || thumbnail, price: priceChange || price } })

    return updated
  } catch (err) {
    console.error(err)
  }
  /* try {
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

  } */
}

async function deleteProduct(id) {
  try {
    const deletedProduct = await Productos.deleteOne({ _id: id })
    return deletedProduct
  } catch (err) {
    console.error(err)
  }
  /* try {
    console.log('FUNCION EJECUTADA')
    const deletedProduct = await knex('productos').where({ id: id });
    if (await knex('productos').where({ id: id }).del()) {
      return deletedProduct;
    } else {
      return { error: 'No hay producto para borrar' }
    }
  } catch (err) {
    console.error(err);

  } */
}

async function generateValues(n) {
  const productos = [

  ]
  for (let i = 0; i < n; i++) {

    let producto = {
      title: faker.commerce.productName(),
      price: faker.commerce.price(),
      thumbnail: faker.image.image()
    }

    productos.push(producto)

  }
  return productos
}



module.exports = { getProducts, getProduct, addProduct, updateProduct, deleteProduct, generateValues }