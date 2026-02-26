import { useEffect, useState } from "react";
import API from "../api/axios";
import { 
  Package, Calendar, Clock, ChevronDown, ChevronUp, 
  ShoppingBag, CheckCircle2, XCircle, Truck 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

function OrdersHistory() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      const token = localStorage.getItem("token");
      try {
        const res = await API.get("/orders/my-orders", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setOrders(res.data);
      } catch (err) {
        console.error("Erreur API :", err.response?.data || err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const toggleOrder = (id) => {
    setExpandedOrder(expandedOrder === id ? null : id);
  };

  // --- LA FONCTION QUI MANQUAIT ---
  const getStatusIcon = (status) => {
    switch (status) {
      case 'Livré': return <CheckCircle2 size={16} className="text-green-500" />;
      case 'Annulé': return <XCircle size={16} className="text-red-500" />;
      default: return <Clock size={16} className="text-amber-500" />;
    }
  };

  if (loading) return <div className="p-20 text-center font-bold text-gray-400">Chargement...</div>;

  return (
    <div className="bg-white min-h-screen p-6 md:p-12">
      <div className="max-w-4xl mx-auto">
        <header className="mb-12">
          <h2 className="text-4xl font-black text-slate-900 flex items-center gap-3">
            <Package className="text-[#ada194]" size={36} /> Mes Commandes
          </h2>
        </header>

        {orders.length === 0 ? (
          <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
            <ShoppingBag size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">Aucune commande trouvée.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="border border-gray-100 rounded-3xl overflow-hidden shadow-sm">
                <div onClick={() => toggleOrder(order.id)} className="p-6 bg-white flex items-center justify-between cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className="bg-gray-100 p-3 rounded-2xl text-[#ada194]"><Truck size={24} /></div>
                    <div>
                      <p className="text-xs font-bold text-gray-400">COMMANDE #{order.id}</p>
                      <p className="text-sm text-slate-600 font-medium"><Calendar size={14} className="inline mr-1" /> {new Date(order.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-lg font-black text-slate-900">{Number(order.total).toLocaleString()} Ar</p>
                      <span className="flex items-center justify-end gap-1 text-[10px] font-bold uppercase">
                        {getStatusIcon(order.status)} {order.status || 'En cours'}
                      </span>
                    </div>
                    {expandedOrder === order.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </div>
                </div>

                <AnimatePresence>
                  {expandedOrder === order.id && (
                    <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="bg-gray-50 overflow-hidden">
                      <div className="p-6 border-t border-gray-100">
                        <h4 className="text-xs font-black uppercase text-gray-400 mb-4">Articles</h4>
                        <div className="space-y-3">
                          {order.items && order.items.map((item, idx) => (
                            <div key={idx} className="flex justify-between bg-white p-3 rounded-xl shadow-sm">
                              <span className="font-bold text-sm">{item.name} <span className="text-[#ada194]">x{item.quantity}</span></span>
                              <span className="font-medium text-sm">{(item.price * item.quantity).toLocaleString()} Ar</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default OrdersHistory;
