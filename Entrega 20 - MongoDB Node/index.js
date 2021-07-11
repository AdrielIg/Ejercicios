const express = require('express')
const app = express()
//socket
const http = require('http').Server(app)
const io = require('socket.io')(http)
//Routers
const router = express.Router()

//hanldebars
const hanldebars = require('express-handlebars')
//Helperjs
const Helper = require('./Helper')
//fs
const fs = require('fs')
//Model chat
const Chat = require('./modelos/Chat')
//Model Product
const Products = require('./modelos/Products')

//Mongoose
const mongoose = require('mongoose')
//Config
const config = require('./Config/config.json')

//Connect database
async function connectDB() {
  await mongoose.connect(config.MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true });

  console.log('conexion a la base de datos realizada!');
}
connectDB()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use('/static', express.static(__dirname + '/public'));


//Productos
let PRODUCTOS = [{
  title: 'Lapiz',
  price: 58,
  thumbnail: 'https://cdn3.iconfinder.com/data/icons/education-209/64/pencil-pen-stationery-school-128.png',
  id: 1
},
{
  title: 'Regla',
  price: 28,
  thumbnail: 'https://cdn3.iconfinder.com/data/icons/education-209/64/ruler-triangle-stationary-school-128.png',
  id: 2
}
]


const HelperClass = new Helper(PRODUCTOS)

const middleWareId = async (req, res, next) => {
  const id = Number(req.params.id)
  const product = Products.getProduct(id)
  if (product) {
    next()
  }
  else {
    res.json({ errorMiddleWare: 'No hay productos existentes con este id' })
  }

}

//Listar Productos


router.get('/productos/listar', async (req, res) => {
  try {
    const productos = await Products.getProducts()
    if (!productos.length) {
      res.json({ error: 'No hay productos cargados' })
    }
    else {
      res.json(productos)
    }

  }
  catch (err) {
    console.log(`Ha ocurrido un error: ${err}`)
  }
})
//Listar Productos por ID
router.get('/productos/listar/:id', middleWareId, async (req, res) => {
  const productId = req.params.id
  try {
    const product = await Products.getProduct(productId)
    if (!product) {
      res.json({ error: 'No se encontro ningun producto' })
    }
    else {
      res.status(200).json(product)
    }
  }
  catch (err) {
    console.log(`Ha ocurrido un error: ${err}`)
  }
})

//Almacenar Producto
// Recibiendo datos desde el body
router.post('/productos/guardar', async (req, res) => {
  try {
    //Agregamos id
    const { title, price, thumbnail } = req.body

    await Products.addProduct(title, price, thumbnail)

    res.status(200).redirect('/productos/cargar')

  }
  catch (err) {
    console.log(`Ha ocurrido un error: ${err}`)

  }
})

//Borrar un producto segun id
router.delete('/productos/borrar/:id', middleWareId, async (req, res) => {
  try {
    const id = req.params.id
    console.log('borrar')
    const productDeleted = await Products.deleteProduct(id)
    res.status(200).json(productDeleted)
  }
  catch (err) {
    console.log(`Ha ocurrido un error: ${err}`)
  }
})


//Actualizar producto por Id
router.put('/productos/actualizar/:id', middleWareId, async (req, res) => {
  try {
    const id = req.params.id
    const { title, price, thumbnail } = req.body
    const product = await Products.updateProduct(id, title, price, thumbnail)
    res.send(product)
  }
  catch (err) {
    console.log(`Ha ocurrido un error: ${err}`)
  }
})
//url a vista de productos
app.get('/productos/vista', (req, res) => {
  res.render('vistas', { productos: PRODUCTOS, hayProductos: PRODUCTOS.length > 0 ? true : false })
})

//Handlebars
app.engine(
  'hbs',
  hanldebars({
    extname: '.hbs',
    defaultLayout: 'index.hbs',
    layoutsDir: __dirname + '/views/layouts',
    partialsDir: __dirname + '/views/partials'

  })
)


//Motor de plantilla
app.set('view engine', 'hbs')
//Ubicacion de plantillas
app.set('views', './views')
//Espacio publico
app.use(express.static('./public'))

//Ruta /api
app.use('/api', router)
//Ruta productos/vista




//Server
const server = http.listen(8080, () => {
  console.log(`Servidor inicializado en el puerto ${server.address().port}`)
})




//Socket

io.on('connection', async (socket) => {
  console.log(`nuevo cliente: ${socket.id}`)
  socket.emit('productos', await Products.getProducts())
  socket.emit('messages', await Chat.readMessages())

  socket.on('nuevoProducto', async (data) => {
    const { title, price, thumbnail } = data

    const product = await Products.addProduct(title, price, thumbnail)

    //Enviar todos los productos a los sockets para
    //que handlebars rerenderice
    io.sockets.emit('productos', await Products.getProducts())

  })

  /* socket.on('newMessage', data => {
    messages.push(data)

    io.sockets.emit('messages', messages)

    //Guardar mensajes en mensajes.txt

    fs.appendFile('./messages.txt', JSON.stringify(data), function (err) {
      if (err) {
        console.log(`Error al guardar mensaje: ${err}`)
      }

    })
  }) */

  socket.on('newMessage', async (data) => {
    const { email, text, time } = data
    await Chat.addMessage(email, text, time)
    io.sockets.emit('messages', await Chat.readMessages())
  })

})


server.on('error', error => {
  console.log(`Error en servidor: ${error}`)
})


