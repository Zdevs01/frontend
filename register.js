const express = require('express');
const bcrypt = require('bcrypt');
const mysql = require('mysql');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const port = 5000;

app.use(cors());
app.use(bodyParser.json());

// Connection à la base de données MySQL
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root', // Change ceci en fonction de ta config MySQL
  password: '', // Change en fonction de ta config MySQL
  database: 'nom_de_ta_base', // Remplace par le nom de ta base de données
});

db.connect((err) => {
  if (err) {
    console.error('Erreur de connexion à la base de données :', err);
    return;
  }
  console.log('Connexion à la base de données réussie');
});

// Route d'enregistrement
app.post('/register', async (req, res) => {
  const { email, password, username } = req.body;

  // Vérifier si tous les champs sont présents
  if (!email || !password || !username) {
    return res.status(400).json({ message: "Tous les champs sont requis." });
  }

  // Vérification du format de l'email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: "L'email est invalide." });
  }

  // Vérification du mot de passe (doit contenir au moins 6 caractères)
  if (password.length < 6) {
    return res.status(400).json({ message: "Le mot de passe doit contenir au moins 6 caractères." });
  }

  try {
    // Vérifier si l'utilisateur existe déjà
    const sqlCheck = 'SELECT * FROM users WHERE email = ?';
    db.query(sqlCheck, [email], async (err, results) => {
      if (err) {
        return res.status(500).json({ message: "Erreur lors de la vérification de l'email." });
      }

      if (results.length > 0) {
        return res.status(400).json({ message: "Un utilisateur avec cet email existe déjà." });
      }

      // Hash du mot de passe
      const hashedPassword = await bcrypt.hash(password, 10);

      // Insérer l'utilisateur dans la base de données
      const sqlInsert = 'INSERT INTO users (email, username, password) VALUES (?, ?, ?)';
      db.query(sqlInsert, [email, username, hashedPassword], (err, results) => {
        if (err) {
          return res.status(500).json({ message: "Erreur lors de la création de l'utilisateur." });
        }

        res.status(201).json({ message: "Utilisateur créé avec succès." });
      });
    });
  } catch (error) {
    console.error('Erreur lors de la création de l\'utilisateur :', error);
    res.status(500).json({ message: "Une erreur est survenue. Veuillez réessayer plus tard." });
  }
});

app.listen(port, () => {
  console.log(`Serveur en écoute sur le port ${port}`);
});
