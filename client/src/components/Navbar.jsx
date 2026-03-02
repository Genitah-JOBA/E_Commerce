import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ShoppingCart, LayoutDashboard, ClipboardList, 
  LogOut, User, Home, History, Package, Menu, X 
} from "lucide-react";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  
  const user = JSON.parse(localStorage.getItem("user"));
  const isAdmin = user && user.role === "admin";

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsOpen(false);
    navigate("/auth");
  };

  const toggleMenu = () => setIsOpen(!isOpen);

  // Styles communs pour les liens pour éviter la répétition
  const linkClass = "flex items-center gap-2 hover:text-[#f3e6d8] transition-colors duration-300 py-2 md:py-0";

  return (
    <motion.nav 
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="sticky top-0 z-50 bg-[#ada194] text-white p-4 shadow-lg"
    >
      <div className="container mx-auto flex justify-between items-center">
        
        {/* Logo */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5, duration: 1 }}>
          <Link to="/" className="text-black flex items-center whitespace-nowrap text-3xl font-stylish tracking-tight transition hover:opacity-60">
            <span style={{ fontFamily: 'adorable', fontSize: '1.875rem', lineHeight: '1' }}>Aura</span>
            <span className="italic font-medium ml-2" style={{ fontFamily: 'Playfair Display', lineHeight: '1' }}>Privé</span>
          </Link>
        </motion.div>

        {/* --- DESKTOP NAVIGATION --- */}
        <div className="hidden md:flex text-black space-x-6 font-medium items-center">
          {!isAdmin && (
            <Link to="/" className={linkClass}><Home size={18} /> Accueil</Link>
          )}

          {user ? (
            isAdmin ? (
              <>
                <Link to="/admin" className="flex items-center gap-1 font-bold text-[#3f1117] hover:scale-105 transition">
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
          ) : (
            null
          )}

          {/* Bouton Auth Desktop */}
          {user ? (
            <div className="flex items-center gap-4">
              <span className="italic font-medium text-sm" style={{ fontFamily: 'Playfair Display' }}>{user.name}</span>
              <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition">
                <LogOut size={16} /> Déconnexion
              </button>
            </div>
          ) : (
            <Link to="/auth" className="flex items-center gap-2 px-4 py-2 rounded-md bg-[#f3e6d8] hover:bg-white text-black transition font-bold">
              <User size={16} /> Connexion
            </Link>
          )}
        </div>

        {/* --- MOBILE BURGER BUTTON --- */}
        <div className="md:hidden flex items-center">
          <button onClick={toggleMenu} className="text-black focus:outline-none">
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
              {!isAdmin && (
                <Link to="/" onClick={toggleMenu} className={linkClass}><Home size={18} /> Accueil</Link>
              )}
              
              {user ? (
                <>
                  {isAdmin ? (
                    <>
                      <Link to="/admin" onClick={toggleMenu} className="font-bold text-[#3f1117] flex items-center gap-2"><LayoutDashboard size={18} /> Admin</Link>
                      <Link to="/admin/orders" onClick={toggleMenu} className={linkClass}><ClipboardList size={18} /> Commandes</Link>
                    </>
                  ) : (
                    <>
                      <Link to="/products" onClick={toggleMenu} className={linkClass}><Package size={18} /> Produits</Link>
                      <Link to="/cart" onClick={toggleMenu} className={linkClass}><ShoppingCart size={18} /> Panier</Link>
                      <Link to="/order" onClick={toggleMenu} className={linkClass}><History size={18} /> Historique</Link>
                    </>
                  )}
                  <hr className="border-[#bcafa1]" />
                  <div className="flex flex-col gap-3">
                    <span className="italic">{user.name}</span>
                    <button onClick={handleLogout} className="flex items-center justify-center gap-2 px-4 py-3 bg-black text-white rounded-md">
                      <LogOut size={18} /> Déconnexion
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <Link to="/products" onClick={toggleMenu} className={linkClass}>Produits</Link>
                  <Link to="/auth" onClick={toggleMenu} className="flex items-center justify-center gap-2 px-4 py-3 bg-[#f3e6d8] text-black rounded-md font-bold">
                    <User size={18} /> Connexion
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;
