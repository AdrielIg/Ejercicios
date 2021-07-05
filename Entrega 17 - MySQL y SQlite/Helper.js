class Helper {
  constructor(products) {
    this.products = products
  }
  //Listar productos
  listar() {
    return this.products
  }
  //Filtrar productos por ID
  listarById(id) {
    return this.products.filter(product => product.id === id)
  }
  //Listar producto agregado, agreganole ID siendo
  //La longitud de PRODUCTOS + 1
  listarProductoAgregado(productAgregado) {
    return { ...productAgregado, id: this.products[this.products.length - 1].id + 1 }
  }
  //Borrar items por ID

  borrarItems(id) {
    const productos = this.products.filter(product => product.id != id)
    this.products.splice(0, this.products.length, ...productos)
  }


  mostrarItemBorrado(id) {
    return this.products.filter(product => product.id === id)
  }

  actualizarItem(id, title, price, img) {
    const product = this.products.find(item => item.id === id)
    product.title = title ? title : product.title
    product.price = price ? price : product.price
    product.thumbnail = img ? img : product.thumbnail

    return product
  }

}

module.exports = Helper