const form = document.querySelector('#form-product');
const titleInput = document.querySelector('#title');
const priceInput = document.querySelector('#price');
const thumbnailInput = document.querySelector('#thumbnail');
const productosTable = document.querySelector('.productos-container');
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