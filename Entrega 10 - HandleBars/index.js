const express = require('express')
const app = express()
//Routers
const router = express.Router()


//Helperjs
const Helper = require('./Helper')

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
//url a formulario para cargar productos
app.get('/productos/cargar', (req, res) => {
  res.render('formulario')
})
app.get('/productos/vista', (req, res) => {
  res.render('index', { productos: PRODUCTOS, hayProductos: PRODUCTOS.length > 0 ? true : false })
})



//Motor de plantilla
app.set('view engine', 'ejs')
//Ubicacion de plantillas
app.set('views', './views')
//Espacio publico
app.use(express.static('public'))

//Ruta /api
app.use('/api', router)
//Ruta productos/vista



//Server
const server = app.listen(8080, () => {
  console.log(`Servidor inicializado en el puerto ${server.address().port}`)
})

server.on('error', error => {
  console.log(`Error en servidor: ${error}`)
})


