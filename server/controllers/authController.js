import pool from "../config/db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

//REGISTER
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // 1. Vérification si l'utilisateur existe (Hautement recommandé)
    // On précise "public.users" pour être certain de la table
    const userExist = await pool.query("SELECT * FROM public.users WHERE email = $1", [email]);
    if (userExist.rows.length > 0) {
      return res.status(400).json({ message: "Cet email est déjà utilisé" });
    }

    // 2. Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Insertion (On force le schéma public)
    // IMPORTANT: Vérifie que ta table a bien les colonnes 'name' et 'role'
    const result = await pool.query(
      "INSERT INTO public.users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role",
      [name, email, hashedPassword, 'user']
    );

    const newUser = result.rows[0];

    // 4. Générer le token
    // On s'assure que JWT_SECRET est bien chargé
    const token = jwt.sign(
      { id: newUser.id, name: newUser.name, role: newUser.role },
      process.env.JWT_SECRET || 'fallback_secret_key', 
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: "Utilisateur créé avec succès",
      token,
      user: newUser,
    });

  } catch (error) {
    // CE LOG EST ESSENTIEL : Il te dira si une colonne manque dans SQL
    console.error("ERREUR REGISTRE SQL:", error.message);
    
    // On renvoie le message d'erreur précis au frontend pour le debug
    res.status(500).json({ 
      message: "Erreur serveur : " + error.message 
    });
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