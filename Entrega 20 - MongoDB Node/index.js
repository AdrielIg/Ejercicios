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
/* Import users schema mongo */
const User = require('./modelos/users')

/* Faker */
const faker = require('faker');
/* Normalizer */
const { normalize, schema } = require('normalizr');
/* Cookie parser */
const cookieParser = require('cookie-parser')
const session = require('express-session')
/* mongo connect */
const MongoStore = require('connect-mongo')
const advancedOptions = { useNewUrlParser: true, useUnifiedTopology: true }
/* import atlas */
const atlasUrl = require('./Config/config.json').Mongo_Atlas
/* import passport */
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
/* Bcrypt */
const bCrypt = require('bCrypt')

//Connect database
async function connectDB() {
  await mongoose.connect(config.Mongo_Atlas, { useNewUrlParser: true, useUnifiedTopology: true });

  console.log('conexion a la base de datos realizada!');
}
connectDB()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use('/static', express.static(__dirname + '/public'));
app.use(cookieParser())
app.use(session({
  store: MongoStore.create({
    mongoUrl: atlasUrl,
    mongoOptions: advancedOptions
  }),
  secret: 'secret',
  resave: true,
  saveUninitialized: false,
  rolling: true,
  cookie: {
    maxAge: 10 * 60 * 60,
  }


}))
// Initialize Passport and restore authentication state, if any, from the
// session.
app.use(passport.initialize());
app.use(passport.session());

/* req.session.name */
let sessionName;

/* PASSPORT DECLARATION */
passport.use('login', new LocalStrategy({
  passReqToCallback: true
},
  function (req, username, password, done) {
    //Buscando nombre en base de datos
    User.findOne({ 'username': username },
      function (err, user) {
        //Si ocurre un error
        if (err)
          return done(err);
        // si el usuario no existe
        if (!user) {
          console.log('Usuario no encontrado: ' + username);
          return done(null, false, console.log('message', 'User Not found.'));
        }
        // Si usuario existe pero la contrasenia es erronea
        if (!isValidPassword(user, password)) {
          console.log('Invalid Password');
          return done(null, false, console.log('message', 'Invalid Password'));
        }
        // Contrasenia y usuario correctos
        sessionName = username
        return done(null, user);
      }
    );
  })
);
/* Compara hash */
const isValidPassword = function (user, password) {
  return bCrypt.compareSync(password, user.password);
}

passport.use('signup', new LocalStrategy({
  passReqToCallback: true
},
  function (req, username, password, done) {
    findOrCreateUser = function () {
      // busca usuario por usuario en mongo
      User.findOne({ 'username': username }, function (err, user) {
        // En caso de error
        if (err) {
          console.log('Error en SignUp: ' + err);
          return done(err);
        }
        // Si ya existe ese usuario
        if (user) {
          console.log('Este nombre de usuario ya existe');
          return done(null, false, console.log('message', 'Este usuario ya existe '));
        } else {
          //creamos nuevo usuario
          let newUser = new User();
          // pasamos los datos
          newUser.username = username;
          //hasheamos la contrasenia
          newUser.password = createHash(password);

          // guardar usuario
          newUser.save(function (err) {
            if (err) {
              console.log('Error en guardar usuario: ' + err);
              throw err;
            }
            console.log('Usario registrado exitosamente');
            return done(null, newUser);
          });
        }
      });
    }
    // Delay the execution of findOrCreateUser and execute 
    // the method in the next tick of the event loop
    process.nextTick(findOrCreateUser);
  })
)
// Generador de hash
const createHash = function (password) {
  return bCrypt.hashSync(password, bCrypt.genSaltSync(10), null);
}

/* Serializar */
passport.serializeUser(function (user, done) {
  done(null, user._id);
});
/* Deserializar */
passport.deserializeUser(function (id, done) {
  User.findById(id, function (err, user) {
    done(err, user);
  });
});


const middleWareId = async (req, res, next) => {
  const id = Number(req.params.id)
  const product = await Products.getProduct(id)
  if (product) {
    next()
  }
  else {
    res.json({ errorMiddleWare: 'No hay productos existentes con este id' })
  }

}

const auth = async (req, res, next) => {
  if (req.isAuthenticated()) {
    next()
  }
  else {
    res.redirect('/login')
  }

}

app.get('/login', (req, res) => {
  res.render('formulario')
})

app.get('/signup', (req, res) => {
  if (req.isAuthenticated()) {

    const user = req.user;
    console.log('user logueado');
    res.redirect('/')
  }

  res.render('signup')
})

app.post('/login', passport.authenticate('login', { failureRedirect: '/faillogin' }), async (req, res) => {
  try {
    res.redirect('/')
    return

  }
  catch (err) {
    console.log(err)
  }
})

app.post('/signup', passport.authenticate('signup', { failureRedirect: '/failsignup' }), (req, res) => {
  res.redirect('/login')
})

app.get('/logout', (req, res) => {
  req.logout()
  res.render('logout', { name: sessionName })
});

/* Error routes */
app.get('/faillogin', (req, res) => {
  res.render('faillogin')
})
app.get('/failsignup', (req, res) => {
  res.render('failsignup')
})


app.get('/', auth, (req, res) => {


  res.cookie('name', sessionName).sendFile('public/index.html', { root: __dirname })

})




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
app.get('/productos/vista-test', async (req, res) => {
  const n = parseInt(req.query.cant)
  let hayProds = true
  let productos;
  if (n <= 0) {

    hayProds = false
  } else if (!n) {
    productos = await Products.generateValues(10)
  }
  else {
    productos = await Products.generateValues(n)

  }



  res.render('vistas', { productos: productos, hayProductos: hayProds })
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
const obtainMsg = async () => {
  const ms = await Chat.readMessages()
  console.log(ms)
  const mensajesConId = {
    id: 'mensajes',
    mensajes: ms.map(mensaje => ({ ...mensaje.author }))
  }

  const schemaAuthor = new schema.Entity('author', {}, { idAttribute: 'email' });

  // Definimos un esquema de mensaje
  const schemaMensaje = new schema.Entity('post', {
    author: schemaAuthor
  }, { idAttribute: '_id' })

  // Definimos un esquema de posts
  const schemaMensajes = new schema.Entity('posts', {
    mensajes: [schemaMensaje]
  }, { idAttribute: 'id' })


  let mensajesConIdN = normalize(mensajesConId, schemaMensajes)

  console.log(JSON.stringify(mensajesConIdN, null, 3));
  fs.writeFileSync('./normalizado.json', JSON.stringify(mensajesConIdN, null, 3));

  /* let obj = {}
  let counter = 0

  const allmsg = ms.forEach(msj => {
    obj[counter] = msj
    counter++

  }) */
  /* console.log(ms)
  const author = new schema.Entity('author', { idAttribute: 'email' });

  const comment = new schema.Entity('text', {
    commenter: author
  })

  const normalizedData = normalize(ms, comment)
 */


}



/* obtainMsg() */

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
    const { email, text, firstName, lastName } = data
    console.log(`la data es ${JSON.stringify(data)}`)
    await Chat.addMessage(email, text, firstName, lastName)
    io.sockets.emit('messages', await Chat.readMessages())
  })

})


server.on('error', error => {
  console.log(`Error en servidor: ${error}`)
})


