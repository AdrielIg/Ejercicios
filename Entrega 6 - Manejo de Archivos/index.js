const fs = require('fs')

class Archivo {
  constructor(file) {
    this.file = file
  }

  //Metodo leer
  async leer() {
    try {
      const data = await fs.promises.readFile(`./${this.file}.txt`, 'utf-8')
      console.log(JSON.parse(data))
    }
    catch (err) {
      console.log([])
    }
  }

  //Metodo guardar, agrega un producto
  async guardar(name, price, urlImg) {
    try {
      const data = await fs.promises.readFile(`./${this.file}.txt`, 'utf-8', (error, contenido) => {
        try {
          return contenido
        }
        catch (error) {
          console.log('Ocurrio un error', error)
        }
      }
      )
      //Parseamos la data
      const products = JSON.parse(data)
      //Creamos el objeto del nuevo producto
      const product = {
        title: name,
        price: price,
        thumbnail: urlImg,
        id: products.length + 1
      }
      //Integramos el prodcuto al array de objetos
      products.push(product)
      //Sobreescribimos el archivo con los producto preexistentes y los nuevos
      fs.writeFile(`./${this.file}.txt`, JSON.stringify(products, null, '\t'), error => {
        if (error) {
          console.log('No se pudo guardar en el archivo')
        }
        else {
          console.log('Archivo guardado correctamente')
        }
      })
    }

    //Si ocurre un error al utilizar el metodo guardar
    catch (err) {
      console.log(err)
    }
  }
  //Metodo para borrar el archivo
  async borrar() {
    try {
      await fs.promises.unlink(`./${this.file}.txt`)
      console.log('Archivo borrado correctamente')
    }
    catch (error) {
      console.log('Ocurrio un error!', error.message)
    }


  }


}

const utiles = new Archivo('productos')

//Pruebas
utiles.leer()
/* utiles.guardar('Lapiz', 20.68, 'img-lapiz-example.com') */
/* utiles.borrar() */
