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
  listarProductoAgregado(productAgregado, productosTotales) {
    return { ...productAgregado, id: productosTotales.length + 1 }
  }


}

module.exports = Helper