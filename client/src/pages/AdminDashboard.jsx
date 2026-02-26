import { useEffect, useState } from "react";
import API from "../api/axios";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Swal from 'sweetalert2';
// IMPORT DES ICÔNES
import { PlusCircle, Image as ImageIcon, Trash2, Package, Tag, AlignLeft, BarChart3, AlertCircle } from "lucide-react";

function AdminDashboard() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({ name: "", description: "", price: "", stock: "", image: "" });
  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user || user.role !== "admin") {
      // Message d'alerte si un non-admin essaie d'accéder
      Swal.fire({
        icon: 'error',
        title: 'Accès refusé',
        text: 'Vous devez être administrateur pour voir cette page.',
        confirmButtonColor: '#0f172a'
      });
      navigate("/");
      return;
    }
    fetchProducts();
  }, [navigate]);

  const fetchProducts = async () => {
    try {
      const res = await API.get("/products");
      setProducts(res.data);
    } catch (err) { 
      console.error(err);
      Swal.fire('Erreur', 'Impossible de charger les produits', 'error');
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Simulation de l'upload vers ton dossier public/images
      setForm({ ...form, image: `/images/${file.name}` });
      
      // Petit message de confirmation visuelle (Toast)
      Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 2000,
      }).fire({
        icon: 'success',
        title: 'Image sélectionnée'
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // VALIDATIONS AVEC MESSAGEBOX (Swal)
    if (!form.image) {
      return Swal.fire({ icon: 'warning', title: 'Image manquante', text: 'Veuillez choisir une image pour le produit.', confirmButtonColor: '#ada194' });
    }

    if (isNaN(form.price) || form.price <= 0) {
      return Swal.fire({ icon: 'error', title: 'Prix invalide', text: 'Le prix doit être un nombre positif.' });
    }

    try {
      await API.post("/products", form);
      
      // Message de succès
      Swal.fire({ 
        icon: 'success', 
        title: 'Produit ajouté !', 
        text: `${form.name} est maintenant dans le catalogue.`,
        timer: 2500, 
        showConfirmButton: false,
        background: '#fff',
        iconColor: '#ada194'
      });

      fetchProducts();
      setForm({ name: "", description: "", price: "", stock: "", image: "" });
    } catch (err) { 
      Swal.fire('Erreur serveur', "Le serveur n'a pas pu enregistrer le produit.", 'error'); 
    }
  };

  const handleDelete = async (id) => {
    // MessageBox de confirmation
    const result = await Swal.fire({
      title: 'Supprimer ce produit ?',
      text: "Cette action est définitive et le produit disparaîtra de la boutique.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#ada194',
      confirmButtonText: 'Oui, supprimer',
      cancelButtonText: 'Annuler'
    });

    if (result.isConfirmed) {
      try {
        await API.delete(`/products/${id}`);
        fetchProducts();
        Swal.fire({
          title: 'Supprimé !',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false
        });
      } catch (err) {
        Swal.fire('Erreur', 'Impossible de supprimer ce produit.', 'error');
      }
    }
  };

  const getIcon = (name) => {
    switch(name) {
      case 'name': return <Tag size={14} className="text-gray-400" />;
      case 'description': return <AlignLeft size={14} className="text-gray-400" />;
      case 'price': return <Package size={14} className="text-gray-400" />;
      case 'stock': return <BarChart3 size={14} className="text-gray-400" />;
      default: return null;
    }
  };

  // ... (garder les imports et la logique inchangés jusqu'au return)

  return (
    // Suppression du 'fixed' et 'h-screen' qui posent problème sur mobile
    <div className="min-h-screen bg-gray-50 flex flex-col w-full pb-10">
      
      {/* Container principal adapté au responsive */}
      <div className="flex flex-col lg:flex-row max-w-7xl mx-auto w-full px-4 sm:px-6 gap-8 pt-6 md:pt-10">
        
        {/* --- FORMULAIRE (GAUCHE sur Desktop, HAUT sur Mobile) --- */}
        <aside className="w-full lg:w-1/3 flex-shrink-0">
          <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-lg border border-gray-100 sticky top-24">
            <h3 className="text-xl text-center font-semibold mb-6 text-slate-800 uppercase tracking-tight flex items-center justify-center gap-2" style={{ fontFamily: 'Playfair Display' }}>
              <PlusCircle size={20} className="text-[#ada194]" /> AJOUTER UN PRODUIT
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
                {['name', 'description', 'price', 'stock'].map((field) => (
                  <div key={field} className={field === 'description' ? 'sm:col-span-2 lg:col-span-1' : ''}>
                    <label className="flex items-center gap-1 text-xs font-bold uppercase text-black mb-1 ml-1">
                      {getIcon(field)} {field === 'price' ? 'Prix (Ar)' : field}
                    </label>
                    <input
                      name={field}
                      type={field === 'price' || field === 'stock' ? 'number' : 'text'}
                      placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                      value={form[field]}
                      onChange={handleChange}
                      className="w-full px-4 py-3 sm:py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#ada194] outline-none transition text-sm"
                      required
                    />
                  </div>
                ))}
              </div>

              <div>
                <label className="flex items-center gap-1 text-xs font-bold uppercase text-black mb-1 ml-1">
                  <ImageIcon size={14} className="text-gray-400" /> Image du produit
                </label>
                <label className="flex items-center justify-center w-full h-14 sm:h-12 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-[#ada194] hover:bg-gray-50 transition duration-200 gap-2 overflow-hidden px-2">
                  <ImageIcon size={18} className="text-gray-400" />
                  <span className="text-sm font-medium text-gray-500 truncate">
                    {form.image ? form.image.split('/').pop() : "Choisir une image"}
                  </span>
                  <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                </label>
              </div>

              <button type="submit" className="w-full bg-slate-900 text-white py-4 sm:py-3 rounded-lg font-bold hover:bg-slate-800 transition shadow-md flex items-center justify-center gap-2 mt-4 active:scale-95">
                <PlusCircle size={18} /> Publier le produit
              </button>
            </form>
          </div>
        </aside>

        {/* --- LISTE DES PRODUITS (DROITE sur Desktop, BAS sur Mobile) --- */}
        <main className="flex-1">
          <header className="text-center mb-8 lg:mb-10 mt-6 lg:mt-0">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900" style={{ fontFamily: 'adorable' }}>
              Dashboard Admin
            </h2>
            <div className="h-1 w-20 bg-[#ada194] mx-auto mt-2 rounded-full"></div>
            <p className="text-gray-400 text-sm mt-2">Gérez votre inventaire et vos prix</p>
          </header>

          <h3 className="text-xl font-semibold mb-6 text-slate-800 flex items-center gap-2" style={{ fontFamily: 'Playfair Display' }}>
            <Package size={22} className="text-[#ada194]" /> Catalogue ({products.length})
          </h3>
          
          {/* Grille responsive : 1 col sur mobile, 2 cols sur XL */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-4">
            {products.length === 0 ? (
              <div className="col-span-full py-20 text-center text-gray-400 flex flex-col items-center gap-2 bg-white rounded-2xl border border-dashed border-gray-200">
                <AlertCircle size={40} strokeWidth={1} />
                <p>Aucun produit en ligne pour le moment.</p>
              </div>
            ) : (
              products.map((product) => (
                <motion.div 
                  layout
                  key={product._id} 
                  className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition"
                >
                  <img 
                    src={product.image} 
                    alt={product.name} 
                    className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg bg-gray-100" 
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-slate-800 truncate">{product.name}</h4>
                    <p className="text-xs text-gray-500 line-clamp-1">{product.description}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-sm font-bold text-[#ada194]">{product.price} Ar</span>
                      <span className="text-[10px] bg-gray-100 px-2 py-0.5 rounded-full text-gray-600">Stock: {product.stock}</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleDelete(product._id)}
                    className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full transition"
                  >
                    <Trash2 size={18} />
                  </button>
                </motion.div>
              ))
            )}
          </div>
        </main>

      </div>
    </div>
  );
}

export default AdminDashboard;
