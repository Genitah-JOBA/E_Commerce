import jwt from "jsonwebtoken";

// Middleware pour vérifier si l'utilisateur est connecté
export const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  // On vérifie la présence du header et du format "Bearer <token>"
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Accès refusé : Token manquant ou mal formé" });
  }

  const token = authHeader.split(" ")[1];

  try {
    // On décode le token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'votre_secret');
    
    // On attache les infos (id, role) à l'objet req pour les contrôleurs
    req.user = decoded; 
    next();
  } catch (error) {
    return res.status(403).json({ message: "Token invalide ou expiré" });
  }
};

// Middleware pour vérifier si l'utilisateur est un Admin
export const verifyAdmin = (req, res, next) => {
  // On s'appuie sur req.user qui a été rempli par verifyToken juste avant
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    return res.status(403).json({ message: "Accès refusé : réservé aux administrateurs" });
  }
};
