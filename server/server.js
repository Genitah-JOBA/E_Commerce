import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js";
import { verifyToken } from "./middleware/authMiddleware.js";
import productRoutes from "./routes/productRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";

// 1. Configurer les variables d'environnement d'abord
dotenv.config();

// 2. Initialiser l'application
const app = express();

// 3. Middlewares (La configuration de base)
app.use(cors({
  origin: "https://auraprivefrontend.vercel.app", // L'URL de ton site Vercel
  credentials: true
}));
app.use(express.json()); // Indispensable pour lire le JSON envoyé par le client

// 4. Tes Routes (Après l'initialisation de app)
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);

app.get("/", (req, res) => {
  res.send("API E-commerce Maison fonctionne 🚀");
});

// 5. Lancement du serveur
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`✅ Serveur lancé sur le port ${PORT}`);
  console.log(`🚀 Connecté à PostgreSQL`);
});

app.get("/api/protected", verifyToken, (req, res) => {
  res.json({
    message: "Accès autorisé 🔐",
    user: req.user,
  });
});
