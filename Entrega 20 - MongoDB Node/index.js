const express = require('express')
const app = express()
const path = require("path");
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
/* FACEBOOK STRATEGY */
const FacebookStrategy = require('passport-facebook').Strategy;
const dotenv = require('dotenv');
/* Fork */
const { fork } = require('child_process');
/* cluster */
const cluster = require('cluster');
const os = require('os');
/* compression */
const compression = require('compression')
/* log4js */
const log4js = require('./log4js')
const loggerError = log4js.getLogger('err')
const loggerWarn = log4js.getLogger('warn')
const loggerConsole = log4js.getLogger('consola')
loggerError.error('Ha ocurrido un error (prueba)')
loggerConsole.info('Informacion (prueba)')
loggerWarn.warn('Advertencia!!! (prueba)')


dotenv.config();



// Variables de entorno
const PORT = process.argv[2] || 8080
const FACEBOOK_CLIENT_ID = process.argv[4] || process.env.FACEBOOK_CLIENT_ID;
const FACEBOOK_CLIENT_SECRET = process.argv[5] || process.env.FACEBOOK_CLIENT_SECRET;

//Connect database
async function connectDB() {
  await mongoose.connect(config.Mongo_Atlas, { useNewUrlParser: true, useUnifiedTopology: true });
  loggerConsole.info('conexion a la base de datos realizada!');
}
connectDB()
app.use(compression())
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
          loggerWarn.warn('Usuario no encontrado: ' + username);
          return done(null, false, console.log('message', 'User Not found.'));
        }
        // Si usuario existe pero la contrasenia es erronea
        if (!isValidPassword(user, password)) {
          loggerWarn.warn('Invalid Password');
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
          loggerWarn.warn('Este nombre de usuario ya existe');
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
            loggerConsole.info('Usario registrado exitosamente');
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

/* --------------PASSPORT FACEBOOK------------------ */
passport.use(new FacebookStrategy({
  clientID: FACEBOOK_CLIENT_ID,
  clientSecret: FACEBOOK_CLIENT_SECRET,
  callbackURL: '/auth/facebook/callback',
  profileFields: ['id', 'displayName', 'name', 'photos', 'emails'],
  scope: ['email']
}, function (accessToken, refreshToken, profile, done) {
  /* console.log(JSON.stringify(profile, null, 3)) */;
  let userProfile = profile;
  return done(null, userProfile);
}));

/* Passport Facebook */
passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (user, done) {
  done(null, user);
});


/* Passport Local */
/* Serializar */
/* passport.serializeUser(function (user, done) {
  done(null, user._id);
}); */
/* Deserializar */
/* passport.deserializeUser(function (id, done) {
  User.findById(id, function (err, user) {
    done(err, user);
  });
});
 */

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

/* ---------------------------------------------------- */

app.get('/auth/facebook', passport.authenticate('facebook'));

app.get('/auth/facebook/callback', passport.authenticate('facebook',
  {
    successRedirect: '/',
    failureRedirect: '/faillogin'
  }
));


/* ---------------------------------------------------------- */

app.get('/login', (req, res) => {
  res.render('formulario')
})

app.get('/signup', (req, res) => {
  if (req.isAuthenticated()) {

    const user = req.user;
    loggerConsole.info('user logueado');
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
    loggerConsole.error(err)
    loggerError.error(err)
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

app.get('/data', auth, (req, res) => {
  const data = req.user._json

  const dataUser = {
    name: data.name,
    email: data.email,
    pic: data.picture.data.url
  }


  res.send(dataUser)

})

app.get('/', auth, (req, res) => {


  res.sendFile('public/index.html', { root: __dirname })

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
    loggerError.error(`Ha ocurrido un error: ${err}`)
    loggerError.error(err)
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
    loggerError.error(err)
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
    loggerError.error(err)

  }
})

//Borrar un producto segun id
router.delete('/productos/borrar/:id', middleWareId, async (req, res) => {
  try {
    const id = req.params.id
    const productDeleted = await Products.deleteProduct(id)
    res.status(200).json(productDeleted)
  }
  catch (err) {
    loggerError.error(`Ha ocurrido un error: ${err}`)
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
    loggerError.error(`Ha ocurrido un error: ${err}`)
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

const folder = path.basename(__dirname)

/* info process */
app.get('/info', (req, res) => {

  const args = process.argv
  const sistema = process.platform
  const version = process.version
  const memory = process.memoryUsage()
  const path = process.cwd()
  const id = process.pid
  const carpeta = folder
  const numPro = os.cpus().length
  res.render('info', { args, sistema, version, memory, path, id, carpeta, numPro })
})
/* Random numbers */

app.get('/randoms', (req, res) => {
  const num = req.query.cant || 100000000
  try {
    const computo = fork('./computo')
    computo.send(num)
    computo.on('message', numeros => {
      loggerConsole.info(numeros)
      res.render('randoms', { numeros: numeros })
    })

  }
  catch (err) {
    loggerError.error(err)
  }

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






/* CLUSTER AND FORK */
const modo = process.argv[3] || 'fork';
console.log(process.argv[3])

if (modo === 'fork') {
  //Server
  const server = http.listen(PORT, () => {
    loggerConsole.info(`Servidor iniciado en puerto: ${server.address().port}`)
  })


  server.on('error', error => {
    loggerError.error(err)
  })

  process.on('exit', code => {
    console.log('Exit code -> ', code)
  })
}

if (modo === 'cluster') {
  if (cluster.isMaster) {
    for (let i = 0; i < os.cpus().length; i++) {
      cluster.fork();
    }

    cluster.on('exit', (worker, code, signal) => {
      console.log(`worker ${worker.process.pid} died`);
    })
  } else {
    const server = http.listen(PORT, () => {
      loggerConsole.info(
        `Servidor iniciado en puerto: ${server.address().port}.`
      );
    });

    server.on('error', (err) => {
      loggerError.error(err)
    });

    process.on('exit', code => {
      console.log('Exit code -> ', code)
    })
  }
}