const form = document.querySelector('.container')
const titleInput = document.querySelector('#title')
const priceInput = document.querySelector('#price')
const thumbnailInput = document.querySelector('#thumbnail')
const productsTable = document.querySelector('#table')
const btn = document.querySelector('.btn')
const socket = io()








socket.on('productos', productos => {
  const table = document.getElementById('table')


  productos.forEach(product => {
    //Crear fila

    const tr = document.createElement('tr')

    //Aniadir a esa fila las caracteristicas del producto
    tr.innerHTML = `<td>${product.title}</td>` + `<td>$${product.price}</td>` + `<td><img width="50" src='${product.thumbnail}'  alt=${product.thumbnail ? product.title : 'img not found'}></td>`

    //Sumarlas a la table
    table.appendChild(tr)
  });
})

socket.on('producto', producto => {
  const table = document.querySelector('table')
  const tr = document.createElement('tr')
  console.log(producto)
  //Aniadir a esa fila las caracteristicas del producto
  tr.innerHTML = `<td>${producto.title}</td>` + `<td>$${producto.price}</td>` + `<td><img width="50" src='${producto.thumbnail}'  alt=${producto.thumbnail ? producto.title : 'img not found'}></td>`

  //Sumarlas a la table
  table.appendChild(tr)

})




form.addEventListener('submit', (e) => {
  e.preventDefault()
  const title = titleInput.value
  const price = priceInput.value
  const thumbnail = thumbnailInput.value

  socket.emit('nuevoProducto', { title, price, thumbnail })
  form.reset()
})
