console.log("Escribe npm start en la consola para iniciar.")
require('child_process').spawn('bash', [], {
  stdio: ['inherit', 'inherit', 'inherit', 'ipc']
})