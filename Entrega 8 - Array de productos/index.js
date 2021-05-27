const express = require('express')
const app = express()
const Helper = require('./Helper')


app.use(express.json())
app.use(express.urlencoded({ extended: true }))

//Productos
const PRODUCTOS = [{
  title: 'Lapiz',
  price: 58,
  thumbnail: 'urlImg',
  id: 1
},
{
  title: 'Goma',
  price: 28,
  thumbnail: 'urlImg',
  id: 2
}
]

const HelperClass = new Helper(PRODUCTOS)

//Listar Productos
app.get('/api/productos/listar', (req, res) => {
  try {
    if (PRODUCTOS.length === 0) {
      res.json({ error: 'No hay productos cargados' })
    }
    else {
      const productsData = HelperClass.listar()
      res.status(200).json(productsData)
    }
  }
  catch (err) {
    console.log(`Ha ocurrido un error: ${err}`)
  }
})

//Listar Productos por ID
app.get('/api/productos/listar/:id', (req, res) => {
  const productId = Number(req.params.id)
  try {
    if (productId > PRODUCTOS.length || productId <= 0) {
      res.send({ error: 'Producto no encontrado' })
    }
    else {
      const productFiltered = HelperClass.listarById(productId)
      res.status(200).json(productFiltered)
    }
  }
  catch (err) {
    console.log(`Ha ocurrido un error: ${err}`)
  }
})

//Almacenar Producto
// Recibiendo datos desde el body
app.post('/api/productos/guardar', (req, res) => {
  try {
    //Agregamos id
    const productAgregado = HelperClass.listarProductoAgregado(req.body, PRODUCTOS)
    //Agregamos el producto a los PRODUCTOS
    PRODUCTOS.push(productAgregado)
    res.status(200).json(productAgregado)
  }
  catch (err) {
    console.log(`Ha ocurrido un error: ${err}`)
  }
})


//Server
const server = app.listen(8080, () => {
  console.log(`Servidor inicializado en el puerto ${server.address().port}`)
})

server.on('error', error => {
  console.log(`Error en servidor: ${error}`)
})


