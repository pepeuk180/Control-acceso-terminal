//conexion a la base datos
const mysql = require ('mysql2');
const connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "control_access"
  });

connection.connect((error)=>{
    if(error){
        console.log('Error en la conexion, es: '+error);
        return;
    }
    console.log('¡Conectado con la base de datos!')
})

module.exports = connection;