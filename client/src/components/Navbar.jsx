import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ShoppingCart, LayoutDashboard, ClipboardList, 
  LogOut, User, Home, History, Package, Menu, X 
} from "lucide-react";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false); // État pour la MessageBox
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
  }, []);

  const isAdmin = currentUser && currentUser.role === "admin";
  const user = currentUser; // Utilisation du state pour la réactivité

  const confirmLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsOpen(false);
    setShowLogoutModal(false);
    navigate("/auth");
  };

  const toggleMenu = () => setIsOpen(!isOpen);

  // Styles communs : ajout de cursor-pointer
  const linkClass = "flex items-center gap-2 hover:text-[#f3e6d8] transition-colors duration-300 py-2 md:py-0 cursor-pointer";

  return (
    <motion.nav 
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="sticky top-0 z-50 bg-[#ada194] text-white p-4 shadow-lg"
    >
      {/* --- MESSAGEBOX DE DÉCONNEXION --- */}
      <AnimatePresence>
        {showLogoutModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white p-6 rounded-xl shadow-2xl max-w-sm w-full text-black mx-4"
            >
              <h3 className="text-xl font-bold mb-4">Déconnexion</h3>
              <p className="text-gray-600 mb-6">Êtes-vous sûr de vouloir vous déconnecter de votre compte Aura Privé ?</p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowLogoutModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-semibold hover:bg-gray-100 cursor-pointer transition"
                >
                  Annuler
                </button>
                <button 
                  onClick={confirmLogout}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 cursor-pointer transition"
                >
                  Déconnexion
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="container mx-auto flex justify-between items-center">
        
        {/* Logo */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5, duration: 1 }}>
          <Link to="/" className="text-black flex items-center whitespace-nowrap text-3xl font-stylish tracking-tight transition hover:opacity-60 cursor-pointer">
            <span style={{ fontFamily: 'adorable', fontSize: '1.875rem', lineHeight: '1' }}>Aura</span>
            <span className="italic font-medium ml-2" style={{ fontFamily: 'Playfair Display', lineHeight: '1' }}>Privé</span>
          </Link>
        </motion.div>

        {/* --- DESKTOP NAVIGATION --- */}
        <div className="hidden md:flex text-black space-x-6 font-medium items-center">
          {!isAdmin && (
            <Link to="/" className={linkClass}><Home size={18} /> Accueil</Link>
          )}

          {user && (
            isAdmin ? (
              <>
                <Link to="/admin" className="flex items-center gap-1 font-bold text-[#3f1117] hover:scale-105 transition cursor-pointer">
                  <LayoutDashboard size={18} /> Admin
                </Link>
                <Link to="/admin/orders" className={linkClass}><ClipboardList size={18} /> Commandes</Link>
              </>
            ) : (
              <>
                <Link to="/products" className={linkClass}><Package size={18} /> Produits</Link>
                <Link to="/cart" className={linkClass}><ShoppingCart size={18} /> Panier</Link>
                <Link to="/order" className={linkClass}><History size={18} /> Historique</Link>
              </>
            )
          )}

          {user ? (
            <div className="flex items-center gap-4">
              <span className="italic font-medium text-sm text-black" style={{ fontFamily: 'Playfair Display' }}>
                {user.name || user.username || (user.user && user.user.name) || "Aura Client"}
              </span>
              <button 
                onClick={() => setShowLogoutModal(true)} 
                className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition cursor-pointer"
              >
                <LogOut size={16} /> Déconnexion
              </button>
            </div>
          ) : (
            <Link to="/auth" className="flex items-center gap-2 px-4 py-2 rounded-md bg-[#f3e6d8] hover:bg-white text-black transition font-bold cursor-pointer">
              <User size={16} /> Connexion
            </Link>
          )}
        </div>

        {/* --- MOBILE BURGER BUTTON --- */}
        <div className="md:hidden flex items-center">
          <button onClick={toggleMenu} className="text-black focus:outline-none cursor-pointer">
            {isOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* --- MOBILE MENU --- */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden bg-[#ada194] overflow-hidden border-t border-[#bcafa1]"
          >
            <div className="flex flex-col p-4 space-y-4 text-black font-medium">
              {/* Liens mobiles avec cursor-pointer */}
              {!isAdmin && <Link to="/" onClick={toggleMenu} className={linkClass}>Accueil</Link>}
              
              {user ? (
                <>
                  <span className="italic px-2">{user.name || "Aura Client"}</span>
                  <button 
                    onClick={() => { setShowLogoutModal(true); setIsOpen(false); }} 
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-black text-white rounded-md cursor-pointer"
                  >
                    <LogOut size={18} /> Déconnexion
                  </button>
                </>
              ) : (
                <Link to="/auth" onClick={toggleMenu} className="flex items-center justify-center gap-2 px-4 py-3 bg-[#f3e6d8] text-black rounded-md font-bold cursor-pointer">
                  Connexion
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;
