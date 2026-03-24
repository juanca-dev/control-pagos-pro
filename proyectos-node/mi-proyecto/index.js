const express = require('express');
const fs = require('fs');
const cors = require('cors'); // ¡Súper importante para que el HTML hable con Node!
const app = express();
const PORT = 3000;
const PATH_ARCHIVO = './usuarios.json';
const path = require('path');

app.use(cors());
app.use(express.json());

// --- HELPERS ---
const leerDatos = () => {
  try {
    const data = fs.readFileSync(PATH_ARCHIVO, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
};

const guardarDatos = (data) => {
  fs.writeFileSync(PATH_ARCHIVO, JSON.stringify(data, null, 2));
};

// --- RUTAS ---

// 1. Obtener todos (GET)
app.get('/usuarios', (req, res) => {
  res.json(leerDatos());
});

// 2. Obtener uno solo por ID (GET)
app.get('/usuarios/:id', (req, res) => {
  const usuarios = leerDatos();
  const usuario = usuarios.find(u => u.id == req.params.id);
  usuario ? res.json(usuario) : res.status(404).send("No encontrado");
});

// 3. Registrar nuevo (POST)
app.post('/usuarios', (req, res) => {
  const usuarios = leerDatos();
  const nuevo = {
    id: usuarios.length > 0 ? usuarios[usuarios.length - 1].id + 1 : 1,
    dni: req.body.dni,
    nombre: req.body.nombre,
    pagos: req.body.pagos || {} // Si no vienen pagos, crea objeto vacío
  };
  usuarios.push(nuevo);
  guardarDatos(usuarios);
  res.status(201).json(nuevo);
});

// 4. Actualizar pagos o datos (PUT)
app.put('/usuarios/:id', (req, res) => {
  let usuarios = leerDatos();
  const index = usuarios.findIndex(u => u.id == req.params.id);

  if (index !== -1) {
    // Reemplazamos los datos viejos con los nuevos que vienen del body
    usuarios[index] = { ...usuarios[index], ...req.body };
    guardarDatos(usuarios);
    res.json(usuarios[index]);
  } else {
    res.status(404).send("Usuario no encontrado");
  }
});

// 5. Eliminar (DELETE)
app.delete('/usuarios/:id', (req, res) => {
  const usuarios = leerDatos();
  const nuevos = usuarios.filter(u => u.id != req.params.id);
  guardarDatos(nuevos);
  res.json({ mensaje: "Eliminado" });
});

// Esto le dice a Node que cuando alguien entre a la URL principal, 
// le envíe el archivo index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});
app.listen(PORT, () => {
  console.log(`✅ Servidor de Aportes listo en http://localhost:${PORT}`);
});