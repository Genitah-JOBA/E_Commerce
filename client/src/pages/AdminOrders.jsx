import { useEffect, useState } from "react";
import API from "../api/axios";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Swal from "sweetalert2";
import { 
  Package, 
  Truck, 
  CheckCircle, 
  Eye, 
  Filter, 
  ChevronLeft, 
  ChevronRight, 
  Clock 
} from "lucide-react";

function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // 🔒 Admin Protection
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user || user.role !== "admin") {
      Swal.fire({ 
        icon: "error", 
        title: "Accès refusé", 
        text: "Espace réservé à l'administration.",
        confirmButtonColor: "#0f172a" 
      });
      navigate("/");
      return;
    }
    fetchOrders();
  }, [filter, page, navigate]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await API.get(`/orders/admin?status=${filter}&page=${page}&limit=5`);
      setOrders(res.data);
    } catch (error) {
      console.error("Error fetching orders:", error);
      Swal.fire("Erreur", "Impossible de charger les commandes", "error");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    const result = await Swal.fire({
      title: "Modifier le statut ?",
      text: `Passer cette commande en : ${status.toUpperCase()} ?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#0f172a",
      cancelButtonColor: "#ada194",
      confirmButtonText: "Oui, confirmer",
      cancelButtonText: "Annuler"
    });

    if (result.isConfirmed) {
      try {
        await API.put(`/orders/${id}/status`, { status });
        Swal.fire({ icon: "success", title: "Statut mis à jour", timer: 1200, showConfirmButton: false });
        fetchOrders();
      } catch (error) { 
        Swal.fire("Erreur", "La mise à jour a échoué", "error"); 
      }
    }
  };

  const viewDetails = async (order) => {
    try {
      const res = await API.get(`/orders/${order.id}/items`);
      
      // Build HTML Table for the Items
      let itemsHTML = `
        <table style="width:100%; border-collapse: collapse; margin-top: 15px; font-family: sans-serif; text-align: left;">
          <thead>
            <tr style="border-bottom: 2px solid #f1f5f9; color: #64748b; font-size: 11px; text-transform: uppercase;">
              <th style="padding:10px;">Produit</th>
              <th style="padding:10px; text-align:center;">Qté</th>
              <th style="padding:10px; text-align:right;">Total</th>
            </tr>
          </thead>
          <tbody>
      `;

      res.data.forEach((item) => {
        itemsHTML += `
          <tr style="border-bottom: 1px solid #f8fafc; font-size: 13px;">
            <td style="padding:10px; font-weight: 600; color: #1e293b;">${item.name}</td>
            <td style="padding:10px; text-align:center; color: #64748b;">x${item.quantity}</td>
            <td style="padding:10px; text-align:right; font-weight: 700;">${Number(item.price * item.quantity).toLocaleString()} Ar</td>
          </tr>
        `;
      });

      itemsHTML += `</tbody></table>`;

      // Show SweetAlert Modal
      Swal.fire({
        title: `Détails Commande #${order.id}`,
        width: 550,
        confirmButtonColor: "#0f172a",
        confirmButtonText: "Fermer",
        html: `
          <div style="text-align:left; font-family: sans-serif;">
            <div style="background: #f8fafc; padding: 15px; border-radius: 12px; border: 1px solid #f1f5f9;">
              <p style="margin: 0; font-size: 14px; color: #64748b;"><strong>Client :</strong> ${order.name}</p>
              <p style="margin: 4px 0; font-size: 14px; color: #64748b;"><strong>Contact :</strong> ${order.email}</p>
              <p style="margin: 8px 0 0 0; font-size: 18px; color: #ada194; font-weight: 800;">
                TOTAL : ${Number(order.total).toLocaleString()} Ar
              </p>
            </div>
            ${itemsHTML}
          </div>
        `
      });
    } catch (error) {
      console.error(error);
      Swal.fire("Erreur", "Impossible de récupérer les articles.", "error");
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending": return <Clock size={14} />;
      case "shipped": return <Truck size={14} />;
      case "delivered": return <CheckCircle size={14} />;
      default: return null;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending": return "bg-amber-100 text-amber-700 border-amber-200";
      case "shipped": return "bg-blue-100 text-blue-700 border-blue-200";
      case "delivered": return "bg-green-100 text-green-700 border-green-200";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        
        {/* Header */}
        <header className="mb-10 text-center">
          <h2 className="text-4xl font-bold text-slate-900 flex items-center justify-center gap-3" style={{ fontFamily: 'Playfair Display' }}>
            <Package size={32} className="text-[#ada194]" /> Gestion des Commandes
          </h2>
          <div className="h-1 w-20 bg-[#ada194] mx-auto mt-2 rounded-full"></div>
        </header>

        {/* Filter Bar */}
        <div className="flex justify-between items-center mb-8 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <Filter size={18} className="text-gray-400" />
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Statut :</label>
            <select
              value={filter}
              onChange={(e) => { setPage(1); setFilter(e.target.value); }}
              className="bg-gray-50 border border-gray-200 rounded-lg p-2 text-sm outline-none focus:ring-2 focus:ring-[#ada194] cursor-pointer"
            >
              <option value="">Tous les statuts</option>
              <option value="pending">En attente (Pending)</option>
              <option value="shipped">Expédié (Shipped)</option>
              <option value="delivered">Livré (Delivered)</option>
            </select>
          </div>
          <span className="text-sm font-medium text-gray-400">{orders.length} commande(s) affichée(s)</span>
        </div>

        {/* Orders List */}
        {loading ? (
          <div className="flex flex-col justify-center items-center py-20 text-[#ada194]">
            <Package size={48} className="animate-bounce mb-4" />
            <p className="font-medium animate-pulse">Chargement des commandes...</p>
          </div>
        ) : (
          <AnimatePresence>
            {orders.map((order) => (
              <motion.div 
                key={order.id} 
                layout 
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }} 
                className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 mb-4 group hover:shadow-md transition-all duration-300"
              >
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <h3 className="font-bold text-lg text-slate-900 tracking-tight">Commande #{order.id}</h3>
                    <p className="text-sm text-gray-500 font-light">{order.name} • {order.email}</p>
                  </div>
                  <span className={`flex items-center gap-1.5 text-[10px] font-black tracking-widest px-4 py-1.5 rounded-full border uppercase ${getStatusColor(order.status)}`}>
                    {getStatusIcon(order.status)} {order.status}
                  </span>
                </div>

                <div className="mt-8 pt-6 border-t border-gray-50 flex flex-col md:flex-row justify-between items-center gap-6">
                  <p className="text-3xl font-extrabold text-slate-900">
                    {Number(order.total).toLocaleString()} <span className="text-sm text-[#ada194] font-normal">Ar</span>
                  </p>
                  
                  <div className="flex flex-wrap justify-center gap-3">
                    {order.status === "pending" && (
                      <button 
                        onClick={() => updateStatus(order.id, "shipped")} 
                        className="flex items-center gap-2 px-5 py-2.5 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition cursor-pointer font-bold shadow-sm active:scale-95"
                      >
                        <Truck size={14} /> EXPÉDIER
                      </button>
                    )}
                    {order.status === "shipped" && (
                      <button 
                        onClick={() => updateStatus(order.id, "delivered")} 
                        className="flex items-center gap-2 px-5 py-2.5 text-xs bg-green-600 text-white rounded-lg hover:bg-green-700 transition cursor-pointer font-bold shadow-sm active:scale-95"
                      >
                        <CheckCircle size={14} /> LIVRER
                      </button>
                    )}
                    <button 
                      onClick={() => viewDetails(order)} 
                      className="flex items-center gap-2 px-5 py-2.5 text-xs bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition cursor-pointer font-bold shadow-sm active:scale-95"
                    >
                      <Eye size={14} /> DÉTAILS
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}

        {/* Pagination Controls */}
        <div className="flex justify-center items-center gap-5 mt-12 pb-20">
          <button 
            onClick={() => setPage(page - 1)} 
            disabled={page === 1} 
            className="p-3 rounded-full border bg-white disabled:opacity-20 hover:bg-gray-100 transition shadow-sm cursor-pointer disabled:cursor-not-allowed"
          >
            <ChevronLeft size={22} />
          </button>
          <div className="bg-white px-5 py-2 rounded-full border border-gray-100 shadow-inner">
            <span className="text-xs font-black text-slate-400 uppercase tracking-widest mr-2">Page</span>
            <span className="text-lg font-bold text-slate-800">{page}</span>
          </div>
          <button 
            onClick={() => setPage(page + 1)} 
            disabled={orders.length < 5}
            className="p-3 rounded-full border bg-white hover:bg-gray-100 transition shadow-sm cursor-pointer disabled:opacity-20"
          >
            <ChevronRight size={22} />
          </button>
        </div>

      </div>
    </div>
  );
}

export default AdminOrders;
