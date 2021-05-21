/**
 * Plantilla base para el desafio entregable de Javascript asincrono
 * 
 * Desarrollar una función que permita recorrer un texto que se le pase como parámetro 
 * y muestre cada una de sus palabras en un tiempo estipulado. 
 * Al finalizar debe ejecutar una función que se le pasa como callback.
 * 
 * Realizar tres llamadas a la función con porciones de texto que tienen que ser 
 * representados en forma ordenada. Inicialmente todas las palabras del primero, 
 * luego las del segundo y finalmente las del tercero.
 * 
 * Hacer configurable el tiempo de representación de palabras mediante un parámetro opcional.
 * Si este no se define será cada un segundo.
 * 
 * Al finalizar el la operación completa debe imprimir: ‘proceso completo’ y también mostrar
 * la cantidad de palabras totales
 * Aclaracion: no usar variables globales y clases y ejecutar con NodeJS (no tsc)
 */

// funcion de espera
const esperar = ret => { for (let i = 0; i < ret * 3e6; i++); }

// muestra las palabras en orden a partir de un texto
const mostrarPalabras = (texto, tiempo, cantidadPalabras, callback) => {
  // completar con la logica requerida

  let palabras = texto.split(" ")
  let totalAmount = cantidadPalabras

  for (let i = 0; i < palabras.length; i++) {
    console.log(palabras[i])
    if (tiempo === null) {
      esperar(100)
    } else {
      esperar(tiempo)
    }


  }
  totalAmount += palabras.length


  callback(null, totalAmount)





}

let texto1 = 'primer texto';
let texto2 = 'curso backend de coderhouse';
let texto3 = 'probando llamadas asincronas en nodejs';


mostrarPalabras(texto1, 200, 0, (error, totalPalabras) => {
  mostrarPalabras(texto2, null, totalPalabras, (error, totalPalabras) => {
    mostrarPalabras(texto3, 600, totalPalabras, (error, totalPalabras) => {
      console.log('Proceso completo, cantidad de palabras:', totalPalabras);
    });
  });
});


