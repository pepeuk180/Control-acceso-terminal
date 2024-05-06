//invocamos express , dotenv
const express = require('express');
const app = express();
const dotenv = require('dotenv');
const bcryptjs = require('bcryptjs');
const session = require('express-session')
const connection = require('./database/db')

// seteamos urlencoded para capturar los datos del formulario
app.use(express.urlencoded({extended:false}));
app.use(express.json());

//direcciónar a las variables del entorno
dotenv.config({path:'./env/.env'});

//directorio public
app.use('/resources',express.static('public'));
app.use('/resources',express.static(__dirname+'/public'));

//motor de plantillas
app.set('view engine', 'ejs');

app.use(session({
    secret:'secret',
    resave: true,
    saveUninitialized: true,

}))

//routes
app.get('/',(req ,res)=>{
    res.render('index',{msg:'Esto es un mensaje desde node'});
})

app.get('/login',(req ,res)=>{
    res.render('login');
})

app.get('/register',(req ,res)=>{
    res.render('register');
})

//Registración
app.post('/register',async (req,res)=>{
    const name = req.body.name;
    const lname = req.body.lname;
    const email = req.body.email;
    const adress = req.body.address;
    const ci = req.body.ci;
    const cel = req.body.cel;
    const cargo = req.body.cargo;
    let passwordHash = await bcryptjs.hash (ci,8);
    connection.query('Insert into empleados SET ?',{ci_empleados: ci, nombre_empleado:name, apellido_empleado:lname, direccion:adress, celular:cel, cargo:cargo, contraseña:passwordHash, correo:email}, async(error,results)=>{
        if(error){
            console.log(error);
        }else{
            res.render('register',{   
                alert:true,
                alertTitle:'Registración',
                alertMessage: 'Registro Exitoso!',
                alertIcon:'success',
                showConfirmButtom:false,
                timer:1500,
                ruta:''
            })
        }
    })
})

//Autenticaciones 
app.post('/auth', async(req,res)=>{
    const user = req.body.email;
    const pass = req.body.password;
    let passwordHash = await bcryptjs.hash(pass,8);
    if (user && pass) {
      connection.query('Select * from empleados where correo = ?',[user],async(error,results)=>{
        if(results.length==0 || !(await bcryptjs.compare(pass,results[0].contraseña))){
            res.render('login',{
                alert: true,
                alertTitle: "Error",
                alertMessage: "Ususario y contraseñas incorrectas",
                alertIcon: "error",
                showConfirmButtom: true,
                timer: false,
                ruta:'login'
            });
        }else{
            req.session.loggedin=true;
            req.session.name = results[0].nombre_empleado;
            res.render('login',{
                alert: true,
                alertTitle: "Inicio de Sesión correcto",
                alertMessage: "Usuario autenticado",
                alertIcon: "success",
                showConfirmButtom: false,
                timer: 1500,
                ruta:''
            });
        }
      })  
    }else{
        res.render('login',{
            alert: true,
            alertTitle: "Advertencia",
            alertMessage: "Por favor ingrese el usuario y la contraseña",
            alertIcon: "warning",
            showConfirmButtom: true,
            timer: false,
            ruta:'login'
        });
    }
})

//Autentificación para todas las paginas
app.get('/',(req,res)=>{
    if(req.session.loggedin){
        res.render('index',{
            login:true,
            name: req.session.name
        });       
    }else{
        res.render('index',{
            
        })
    }
})


app.listen(3000, (req, res)=>{
    console.log('Server running in http://localhost:3000');
})