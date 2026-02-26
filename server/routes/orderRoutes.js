import express from "express";
// On importe tout proprement depuis tes fichiers
import { 
  createOrder, 
  getMyOrders, 
  getAllOrders, 
  updateOrderStatus, 
  getOrderItems 
} from "../controllers/orderController.js";

import { verifyToken, verifyAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// --- ROUTES CLIENT ---
// Route pour créer une commande
router.post("/", verifyToken, createOrder);

// Route pour l'historique (ATTENTION : Bien placée avant les routes avec :id)
router.get("/my-orders", verifyToken, getMyOrders);


// --- ROUTES ADMIN ---
// Voir toutes les commandes
router.get("/admin", verifyToken, verifyAdmin, getAllOrders);

// Voir les détails d'une commande spécifique
router.get("/:id/items", verifyToken, verifyAdmin, getOrderItems);

// Modifier le statut (Livré, En cours, etc.)
router.put("/:id/status", verifyToken, verifyAdmin, updateOrderStatus);

export default router;
