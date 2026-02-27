import { useEffect, useState } from "react";
import API from "../api/axios";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Swal from "sweetalert2"; // Ajout de SweetAlert2
// Import des icônes Lucide
import { Truck, ShieldCheck, Star, Headset, ArrowRight } from "lucide-react";

function Home() {
  const [products, setProducts] = useState([]);
  const navigate = useNavigate();

  // Détection de l'état de connexion
  const user = JSON.parse(localStorage.getItem("user"));
  const isLoggedIn = !!user;

  useEffect(() => {
    fetchProducts();

    // MESSAGE DE BIENVENUE (MessageBox)
    if (isLoggedIn) {
        Swal.fire({
          title: `Ravi de vous revoir, ${user.name} ! 👋`,
          text: "Prêt à découvrir nos nouvelles pépites pour votre intérieur ?",
          icon: 'success',
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 4000,
          timerProgressBar: true,
        });
    }
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await API.get("/products");
      setProducts(res.data.slice(0, 4));
    } catch (err) { 
      console.error("Erreur lors de la récupération des produits:", err); 
    }
  };

  // Gestion du clic sur un produit avec MessageBox si non connecté
  const handleProductClick = () => {
    if (isLoggedIn) {
      navigate("/products");
    } else {
      Swal.fire({
        title: 'Collection Privée 🔒',
        text: 'Veuillez vous connecter pour voir les détails de nos pièces signature.',
        icon: 'info',
        showCancelButton: true,
        confirmButtonText: 'Se connecter',
        cancelButtonText: 'Plus tard',
        confirmButtonColor: '#0f172a',
        cancelButtonColor: '#ada194',
      }).then((result) => {
        if (result.isConfirmed) navigate("/auth");
      });
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen font-sans">

      {/* HERO SECTION */}
      <section className="relative text-center py-24 overflow-hidden">
        {/* Conteneur de l'image d'arrière-plan */}
        <div className="absolute inset-0 z-0">
          <img 
            src="/images/Maison.jpg" 
            alt="Intérieur maison" 
            className="w-full h-full object-cover scale-110" 
          />
          {/* Voile léger pour faire ressortir le texte */}
          <div className="absolute inset-0 bg-white/40"></div>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 px-6"
        >
          <h1 className="text-5xl md:text-6xl font-bold text-slate-900 tracking-tight" style={{ fontFamily: 'Playfair Display' }}>
            Sublimez votre <span className="text-[#ada194] italic" style={{ fontFamily: 'adorable' }}>Intérieur</span>
          </h1>
          <p className="mt-6 text-gray-800 text-lg md:text-xl max-w-2xl mx-auto font-medium">
            Découvrez notre collection exclusive de meubles modernes, alliant confort absolu et design intemporel.
          </p>

          <Link
            to={isLoggedIn ? "/products" : "/auth"}
            className="mt-10 inline-flex items-center gap-2 bg-slate-900 text-white px-8 py-4 rounded-full hover:bg-slate-800 transition shadow-xl hover:shadow-2xl transform hover:-translate-y-1 font-bold"
          >
            {isLoggedIn ? "Accéder à la boutique" : "Découvrir la collection"} 
            <ArrowRight size={20} />
          </Link>
        </motion.div>
      </section>

      {/* PRODUITS VEDETTE */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-3xl font-bold text-slate-900" style={{ fontFamily: 'Playfair Display' }}>Nos Pièces Signature</h2>
            <div className="h-1 w-12 bg-[#ada194] mt-2"></div>
          </div>
          <Link to="/products" className="text-sm font-bold text-[#ada194] hover:underline underline-offset-4">Voir tout</Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          {products.map((product) => (
            <motion.div
              whileHover={{ y: -10 }}
              key={product.id}
              onClick={handleProductClick}
              className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 group cursor-pointer transition-all hover:shadow-xl"
            >
              <div className="h-64 overflow-hidden">
                <img
                  src={product.image}
                  alt={product.name}
                  className="h-full w-full object-cover group-hover:scale-110 transition duration-500"
                />
              </div>
              <div className="p-6">
                <h3 className="font-semibold text-slate-800 text-lg group-hover:text-[#ada194] transition-colors">
                  {product.name}
                </h3>
                <p className="text-[#ada194] font-extrabold mt-2 text-xl">
                  {Number(product.price).toLocaleString()} Ar
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* SECTION AVANTAGES */}
      <section className="bg-white border-t border-gray-100 py-20">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-12">
          
          {[
            { icon: <Truck size={32} />, title: "Livraison Express", text: "Expédition soignée partout à Madagascar." },
            { icon: <ShieldCheck size={32} />, title: "Paiement Sécurisé", text: "Transactions protégées et cryptées." },
            { icon: <Star size={32} />, title: "Qualité Premium", text: "Matériaux nobles sélectionnés avec rigueur." },
            { icon: <Headset size={32} />, title: "Support Dédié", text: "Une équipe à votre écoute 7j/7." }
          ].map((item, index) => (
            <div key={index} className="flex flex-col items-center text-center group">
              <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center text-[#ada194] mb-6 group-hover:bg-[#ada194] group-hover:text-white transition duration-300">
                {item.icon}
              </div>
              <h3 className="font-bold text-slate-900">{item.title}</h3>
              <p className="text-gray-400 text-sm mt-2 font-light px-4">{item.text}</p>
            </div>
          ))}

        </div>
      </section>
    </div>
  );
}

export default Home;
