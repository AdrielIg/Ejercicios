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
//Mensajes
const messages = []

const HelperClass = new Helper(PRODUCTOS)

const middleWareId = (req, res, next) => {
  const id = Number(req.params.id)
  const product = PRODUCTOS.find(item => item.id === id)
  if (product) {
    next()
  }
  else {
    res.json({ errorMiddleWare: 'No hay productos existentes con este id' })
  }

}

//Listar Productos


router.get('/productos/listar', (req, res) => {
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
router.get('/productos/listar/:id', middleWareId, (req, res) => {
  const productId = Number(req.params.id)
  try {
    const productFiltered = HelperClass.listarById(productId)
    res.status(200).json(productFiltered)
  }
  catch (err) {
    console.log(`Ha ocurrido un error: ${err}`)
  }
})

//Almacenar Producto
// Recibiendo datos desde el body
router.post('/productos/guardar', (req, res) => {
  try {
    //Agregamos id
    const productAgregado = HelperClass.listarProductoAgregado(req.body)
    //Agregamos el producto a los PRODUCTOS
    PRODUCTOS.push(productAgregado)
    /* res.status(200).json(productAgregado) */
    res.status(200).redirect('/productos/cargar')

  }
  catch (err) {
    console.log(`Ha ocurrido un error: ${err}`)
  }
})

//Borrar un producto segun id
router.delete('/productos/borrar/:id', middleWareId, (req, res) => {
  try {
    const id = Number(req.params.id)
    const itemDeleted = HelperClass.mostrarItemBorrado(id)
    //Borrar producto
    HelperClass.borrarItems(id)
    res.status(200).send(itemDeleted)
  }
  catch (err) {
    console.log(`Ha ocurrido un error: ${err}`)
  }
})


//Actualizar producto por Id
router.put('/productos/actualizar/:id', middleWareId, (req, res) => {
  try {
    const id = Number(req.params.id)
    const { title, price, thumbnail } = req.body
    const product = HelperClass.actualizarItem(id, title, price, thumbnail)
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

io.on('connection', socket => {
  console.log(`nuevo cliente: ${socket.id}`)
  socket.emit('productos', PRODUCTOS)
  socket.emit('messages', messages)

  socket.on('nuevoProducto', data => {
    //Agregar Id a producto e insertarlo en PRODUCTOS
    const product = HelperClass.listarProductoAgregado(data)
    PRODUCTOS.push(product)
    //Enviar todos los productos a los sockets para
    //que handlebars rerenderice
    io.sockets.emit('productos', PRODUCTOS)

  })

  socket.on('newMessage', data => {
    messages.push(data)

    io.sockets.emit('messages', messages)

    //Guardar mensajes en mensajes.txt

    fs.appendFile('./messages.txt', JSON.stringify(data), function (err) {
      if (err) {
        console.log(`Error al guardar mensaje: ${err}`)
      }

    })
  })

})


server.on('error', error => {
  console.log(`Error en servidor: ${error}`)
})


