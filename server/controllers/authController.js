import pool from "../config/db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

//REGISTER
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // 1. Vérifier si l'utilisateur existe déjà (Optionnel mais recommandé)
    const userExist = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (userExist.rows.length > 0) {
      return res.status(400).json({ message: "Cet email est déjà utilisé" });
    }

    // 2. Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Insérer l'utilisateur (on ajoute 'role' avec une valeur par défaut 'user' si besoin)
    const result = await pool.query(
      "INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING *",
      [name, email, hashedPassword, 'user'] // 'user' par défaut
    );

    const newUser = result.rows[0];
    delete newUser.password; // Sécurité

    // 4. Générer le token pour connecter l'utilisateur immédiatement
    const token = jwt.sign(
      { id: newUser.id, name: newUser.name, role: newUser.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // 5. Envoyer la réponse
    res.status(201).json({
      message: "Utilisateur créé avec succès",
      token, // On envoie le token ici aussi !
      user: newUser,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur lors de l'inscription au serveur" });
  }
};

//CONNEXION
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ message: "Utilisateur introuvable" });
    }

    const user = result.rows[0];

    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(400).json({ message: "Mot de passe incorrect" });
    }
    delete user.password;

    const token = jwt.sign(
      { id: user.id, name: user.name, role: user.role }, // Les données du user
      process.env.JWT_SECRET,                  // Votre clé secrète du .env
      { expiresIn: '24h' }                     // Durée de validité
    );

    res.json({
      message: "Connexion réussie",
      token,
      user,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};