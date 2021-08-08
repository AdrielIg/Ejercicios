const form = document.querySelector('#form-product');
const titleInput = document.querySelector('#title');
const priceInput = document.querySelector('#price');
const thumbnailInput = document.querySelector('#thumbnail');
const productosTable = document.querySelector('.productos-container');
//chat
const formChat = document.querySelector('#form-chat')
const chat = document.querySelector('.chat')
const socket = io();
//welcome
const welcome = document.querySelector('.welcome')
socket.on('sessionName', name => {
  console.log(name)
})

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
        <p class="mensaje"><span style="font-weight: bold;color: blue"; >{{this.author.email}}</span>
        <span style="font-weight: bold;color: red";>{{this.author.firstName}} </span> <span style="color: brown">({{this.author.time}})</span>: <span style='color: green; font-style: italic'>{{this.text}}</span></p>
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
  const firstName = document.querySelector('#first-name').value
  const lastName = document.querySelector('#last-name').value

  socket.emit('newMessage', { email: email, text: text, firstName: firstName, lastName: lastName })
  formChat.reset()
})


/* ------------------Cookies ----------------------- */

const welcomeTemplate = Handlebars.compile(`
  {{#if name}}
  <div class="wrapper-logout" style= "background: lightgreen; text-align: center; padding: 1rem 2rem">
  <div class="wrapper-data">
    <h3 style="font-size: 2rem; "> Bienvenido {{name}}</h3>
    <h3 style="font-size: 2rem; "> Emial: {{email}}</h3>
    <img src={{pic}} alt="profile facebook">
  </div>
    <a href='/logout' class="logout">Logout</a>
  </div>
  {{else}}
    <h3 class="alert alert-warning"  style="text-align: center">No tienes permiso para acceder!</h3>
  {{/if}}
`)
/* To obtain cookie name */
/* function getCookie(name) {
  var nameEQ = name + "=";
  var ca = document.cookie.split(';');
  for (var i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
}

const cookieName = getCookie('name') */




/* if (!cookieName) {
  window.location = '/login'
  const auth = document.querySelector('.auth')
  auth.style.display = 'none'

} */

async function fetchText() {
  let response = await fetch('/data');
  let data = await response.json();
  const { name, email, pic } = data


  const welcomeHTML = welcomeTemplate({ name: name, email: email, pic: pic })
  welcome.innerHTML = welcomeHTML
}

fetchText()





function inactivityTime() {
  let time;

  // events
  window.onload = resetTime;
  window.onclick = resetTime;
  window.onkeypress = resetTime;
  window.ontouchstart = resetTime;
  window.onmousemove = resetTime;
  window.onmousedown = resetTime;
  window.addEventListener('scroll', resetTime, true);

  function logout() {
    window.location = '/logout'
  }

  function resetTime() {
    clearTimeout(time);
    time = setTimeout(logout, 6000 * 10);
  }

};

// run the function
inactivityTime();



