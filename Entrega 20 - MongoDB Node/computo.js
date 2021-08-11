// proceso hijo
let obj = {};

process.on('message', num => {
  console.log(`Ejecutando ${num} veces...`);
  for (let i = 0; i < num; i++) {
    const numero = Math.floor(Math.random() * (1000 - 1 + 1) + 1)
    if (!obj[numero]) {
      obj[numero] = 1
    }
    else {
      obj[numero] += 1
    }
  }


  process.send(obj);
});