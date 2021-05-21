import express from 'express'
import fs from 'fs'

const app = express()

const puerto = 8080

//Array de objetos con los productos
let productsParse;

//Parseando productos.txt
try {
  //Leer archivo
  const data = fs.readFileSync(`./productos.txt`, 'utf-8')
  productsParse = JSON.parse(data)
}
catch (error) {
  console.log(`Ha ocurrido un error: ${error}`)
}

//Contadores
let items = 0
let itemRandom = 0

//Routes
//Todos los items
app.get('/items', (req, res) => {
  items++

  //Obtener un array con los nombres de los productos para luego usarlo dentro del objeto y obtener la cantidad
  const productsNames = productsParse.map(product => {
    return product.title
  })
  const products = {
    items: productsNames,
    cantidad: productsNames.length
  }
  res.send(products)
})

//Item Random
app.get('/item-random', (req, res) => {
  itemRandom++
  const random = () => {
    return Math.floor((Math.random() * ((productsParse.length - 1) - 0 + 1)) + 0);
  }
  const randomNumber = random()
  const product = {
    item:
      productsParse[randomNumber]
  }

  res.send(product)

})

//Visitas
app.get('/visitas', (req, res) => {
  const visitas = {
    visitas: {
      rutaItems: items,
      rutaRandomItem: itemRandom
    }
  }
  res.send(visitas)

})


const server = app.listen(puerto, () => {
  console.log(`Servidor inicializado en el puerto ${server.address().port}`)
})

server.on('error', error => {
  console.log(`Error en servidor: ${error}`)
})


