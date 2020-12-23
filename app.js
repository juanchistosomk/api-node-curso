const { json, response } = require('express');
const express = require('express');
const config = require('config');   // Configuracion entorno Desarrollo, Producción
const inicioDebug = require('debug')('app:inicio');  // entorno de Depuración
const dbDebug = require('debug')('app:bd');  // entorno de Depuración bd

const app = express();
const Joi = require('joi'); // para validaciones en el cliente
//const logger = require('./logger.js');
const morgan = require('morgan');  // Crear LOGS de las peticiones HTTP

// enviar tipo JSON
app.use(express.json()); // body
app.use(express.urlencoded({extended:true}));  // para activar formato query en url: var1=0&var2=2...
app.use(express.static('public')); // acceder a archivos de forma directa fotos archivos,etc

// Configuracion de entornos config  // cambiar entorno: export NODE_ENV=production
console.log('Aplicacion: '+ config.get('nombre'));
console.log('BdAplicacion: ' + config.get('configDB.host'));

// Uso de un Middleware de terceros, en entorno de desarrollo
// env : variable de entorno
if(app.get('env')==='development') {
app.use(morgan('tiny'));   // Crear LOGS de las peticiones HTTP
//console.log('Morgan habilitado...');
inicioDebug('Morgan habilitado...');
}

// debug Base de Datos
dbDebug('Conectando a la BD');   // set DEBUG=app.*  (para Todos)

// Middleware
/* app.use(logger); */

// Middleware
/* app.use(function(req,res,next) {
   console.log('Autenticando...');
   // continua con el siguiente middleware
   next(); 
}); */

const persona = [
    {id:1, nombre:'Juan'},
    {id:2, nombre:'Ana'},
    {id:3, nombre:'Camilo'},
    {id:4, nombre:'Andres'}
    ];

// GET peticion
//funcion callback: req (request) y res(response)
app.get('/', (req,res)=>{
 res.send("Hola mi primer API");
}); 

app.get('/api/usuarios', (req,res)=>{
    //res.send(['juan','Andres','Yeison','Manuel']);
    res.send(persona);
});

// Parametros
app.get('/api/usuario/:year/:mes/:dia', (req,res) => {
  res.send(req.params);
  //res.send(req.params.id);
});

app.get('/api/usuarios/:year/:mes/:dia', (req,res) => {
    res.send(req.query);
  });

//////////////////////////////

// Variable de entorno
// se ingresa el valor del puesto o si no toma el 3000 por defecto
const port = process.env.PORT || 3000;
app.listen(port, ()=>{
    console.log(`Escuchando puerto: ${port}`);
});





// GET peticion por HTTP
app.get('/api/usuarios/:id', (req, res) => {
 // parseInt.req.params.id   
 let user = existeUsuario(req.params.id);
 if(!user) res.status(404).send('El usuario no existe');
 res.send(user);

});

///////

/// Solicitudes POST
// npm install joi (para validaciones)

app.post('/api/usuarios', (req, res) => {

// comprueba urlencoded
/* 
let body= req.body;
console.log(body);
res.json({body:body}); */

/// Joi
const schema = Joi.object({
    nombre: Joi.string().min(2).required()
});

const {error, value} = validaUsuario(req.body.nombre);

if(!error){
    const usuario =  {
        id: persona.length + 1,
        nombre: req.body.nombre
    };
    persona.push(usuario);
    res.send(usuario); 
} else {

 // 400 bad request
 const mensaje = error.details[0].message;
 res.status(400).send(mensaje);

}
    /* // validación
    if(!req.body.nombre || req.body.nombre.length<=2){
       
        // se pone return para terminar el metodo y no continue
        return;
    }
    */
});


/// Solicitudes HTTP PUT

app.put('/api/usuarios/:id', (req, res) => {
    // Buscar si existe el objeto usuario
    let usuario = existeUsuario(req.params.id);
    if(!usuario) {
        res.status(404).send('El usuario no existe');
        return;
    }

    // si existe, valida el nombre
    /// Joi
const {error, value} = validaUsuario(req.body.nombre);
if(error){   
 // 400 bad request
 const mensaje = error.details[0].message;
 res.status(400).send(mensaje);
 return;
}

// si pasa las validaciones se actualiza
usuario.nombre=value.nombre;
res.send(usuario);

});


// Solicitud DELETE

app.delete('/api/usuarios/:id', (req, res) => {
     // Buscar si existe el objeto usuario
     let usuario = existeUsuario(req.params.id);
     if(!usuario) {
         res.status(404).send('El usuario no existe');
         return;
     }

     let index = persona.indexOf(usuario);
     persona.splice(index, 1);
     res.send(persona);

});

function existeUsuario(id){
    return(persona.find(u=>u.id===parseInt(id)) );
}

function validaUsuario(nom){
    const schema = Joi.object({
        nombre: Joi.string().min(2).required()
    });
    return (schema.validate({ nombre: nom }));
}

/* app.post(); // enviar datos,crear
app.put(); // actualizar
app.delete(); // eliminar */

