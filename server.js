const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");
const bcrypt = require("bcrypt");

const app = express();
const PORT = 5000;

// Middleware
app.use(express.json());
app.use(cors());

// Connexion MySQL sécurisée
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "Durane2000",
    database: "mulemaap_db",
    multipleStatements: false, // Sécurité contre les injections SQL
});

db.connect((err) => {
    if (err) {
        console.error("❌ Erreur de connexion MySQL:", err);
        process.exit(1);
    }
    console.log("✅ Connecté à la base de données MySQL.");
});

// Debugging : Voir les requêtes reçues
app.use((req, res, next) => {
    console.log(`[${req.method}] ${req.url} - Body:`, req.body);
    next();
});

// ✅ ROUTE REGISTER
app.post("/register", (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ message: "Tous les champs sont requis." });
    }

    // Vérifier si l'email existe déjà
    db.query("SELECT * FROM users WHERE email = ?", [email], (err, results) => {
        if (err) {
            console.error("❌ Erreur de vérification d'email:", err);
            return res.status(500).json({ message: "Erreur serveur." });
        }
        if (results.length > 0) {
            return res.status(400).json({ message: "Cet email est déjà utilisé." });
        }

        // Hacher le mot de passe et insérer l'utilisateur
        bcrypt.hash(password, 10, (err, hashedPassword) => {
            if (err) {
                console.error("❌ Erreur de hachage du mot de passe:", err);
                return res.status(500).json({ message: "Erreur serveur." });
            }

            const sql = "INSERT INTO users (username, email, password) VALUES (?, ?, ?)";
            db.query(sql, [username, email, hashedPassword], (err, result) => {
                if (err) {
                    console.error("❌ Erreur d'insertion:", err);
                    return res.status(500).json({ message: "Erreur serveur." });
                }
                res.status(201).json({ message: "Utilisateur créé avec succès !" });
            });
        });
    });
});

// ✅ ROUTE LOGIN
app.post("/login", (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Email et mot de passe requis." });
    }

    // Vérifier si l'utilisateur existe
    db.query("SELECT * FROM users WHERE email = ?", [email], (err, results) => {
        if (err) {
            console.error("❌ Erreur de vérification d'email:", err);
            return res.status(500).json({ message: "Erreur serveur." });
        }

        if (results.length === 0) {
            return res.status(401).json({ message: "Email ou mot de passe incorrect." });
        }

        const user = results[0];

        // Vérification du mot de passe
        bcrypt.compare(password, user.password, (err, isPasswordValid) => {
            if (err) {
                console.error("❌ Erreur de comparaison du mot de passe:", err);
                return res.status(500).json({ message: "Erreur serveur." });
            }

            if (!isPasswordValid) {
                return res.status(401).json({ message: "Email ou mot de passe incorrect." });
            }

            res.json({ message: "Connexion réussie", user: { id: user.id, username: user.username, email: user.email } });
        });
    });
});

// ✅ Lancement du serveur
app.listen(PORT, "0.0.0.0", () => {
    console.log(`✅ Serveur démarré sur http://localhost:${PORT}`);
});
