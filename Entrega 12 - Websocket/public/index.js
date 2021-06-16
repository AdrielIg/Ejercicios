const form = document.querySelector('#form-product');
const titleInput = document.querySelector('#title');
const priceInput = document.querySelector('#price');
const thumbnailInput = document.querySelector('#thumbnail');
const productosTable = document.querySelector('.productos-container');
//chat
const formChat = document.querySelector('#form-chat')
const chat = document.querySelector('.chat')
const socket = io();

//Template Handlebars
const productoHtml = Handlebars.compile(`
  {{#if productosExisten}}
  <div class="table-responsive">
    <table class="table table-dark">
      <tr> <th>Nombre</th> <th>Precio</th> <th>Foto</th></tr>
      {{#each productos}}
          <tr> <td>{{this.title}}</td> <td>$ {{ this.price }}</td> <td><img width="50" src={{this.thumbnail}} alt="not found"></td> </tr>
      {{/each}}
    </table>
  </div>
  {{else}}
    <h3 class="alert alert-warning">No se encontraron productos</h3>
  {{/if}}
`);

//Pasar datos a template y renderizar dentro de tabla
const productosRender = productos => {
  const html = productoHtml({ productos, productosExisten: productos.length > 0 });
  productosTable.innerHTML = html;
}

//Recibir productos y manejar productos con productosRender
socket.on('productos', productosRender);

form.addEventListener('submit', event => {
  event.preventDefault();
  const title = titleInput.value;
  const price = Number(priceInput.value);
  const thumbnail = thumbnailInput.value;
  //enviar nuevo producto al servidor
  socket.emit('nuevoProducto', { title, price, thumbnail });
  form.reset();
});

//-------------Chat-------------------

const chatTemplate = Handlebars.compile(`
  {{#if hayMensajes}}
    
      {{#each messages}}
        <p class="mensaje"><span style="font-weight: bold;color: blue"; >{{this.email}}</span> <span style="color: brown">({{this.time}})</span>: <span style='color: green; font-style: italic'>{{this.text}}</span></p>
      {{/each}}
    
  {{else}}
    <h3 class="alert alert-warning">No hay mensajes, sé el primero!</h3>
  {{/if}}
`)

socket.on('messages', messages => {
  const html = chatTemplate({ messages, hayMensajes: messages.length > 0 })
  chat.innerHTML = html
})

formChat.addEventListener('submit', e => {
  e.preventDefault()
  const email = document.querySelector('#email').value
  const text = document.querySelector('#text').value
  console.log(email, text)
  socket.emit('newMessage', { email: email, time: new Date().toLocaleString(), text: text })
  formChat.reset()
})












/* const form = document.querySelector('.container')
const titleInput = document.querySelector('#title')
const priceInput = document.querySelector('#price')
const thumbnailInput = document.querySelector('#thumbnail')
const productsTable = document.querySelector('#table')
const btn = document.querySelector('.btn')
const socket = io()
 */









/* socket.on('productos', productos => {
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
 */