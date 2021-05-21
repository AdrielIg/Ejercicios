// https://servidor-node-adriel-gomez.glitch.me/

const http = require('http')


function obtenerRandom(min, max) {
  return (Math.random() * (max - min)) + min;
}

const server = http.createServer(function (req, res) {



  const objeto = {
    id: Math.round(obtenerRandom(1, 10)),
    title: `Producto ${Math.round(obtenerRandom(1, 10))}`,
    price: obtenerRandom(0.00, 9999.99).toFixed(2),
    thumbnail: `Foto ${Math.round(obtenerRandom(1, 10))}`
  }

  res.end(JSON.stringify(objeto))
})

const PUERTO = process.env.PUERTO

server.listen(PUERTO, function () {
  console.log(`Server up on ${PUERTO}`)
})