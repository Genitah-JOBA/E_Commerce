import { useEffect, useState } from "react";
import API from "../api/axios";
import Swal from "sweetalert2";
import { 
  ShoppingCart, 
  Eye, 
  X, 
  CheckCircle2, 
  Package, 
  Info,
  ChevronRight,
  AlertCircle,
  Loader2
} from "lucide-react";

function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    API.get("/products")
      .then(res => {
        setProducts(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
        Swal.fire({
          icon: 'error',
          title: 'Erreur de connexion',
          text: 'Impossible de charger les produits.',
          confirmButtonColor: '#ada194'
        });
      });
  }, []);

  const showToast = (name) => {
    Swal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 2000,
      timerProgressBar: true,
      background: '#ada194',
      color: '#fff',
      iconColor: '#fff',
    }).fire({
      icon: 'success',
      title: `${name} ajouté au panier !`
    });
  };

  const addToCart = (product) => {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const existingProduct = cart.find(item => item.id === product.id);

    if (existingProduct) {
      existingProduct.quantity += 1;
    } else {
      cart.push({ ...product, quantity: 1 });
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    showToast(product.name);
  };

  if (loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center gap-4 text-slate-500 font-bold">
        <Loader2 className="animate-spin text-[#ada194]" size={40} /> 
        <p>Chargement des collections...</p>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen px-6 pb-6 relative">
      <div className="pt-10 pb-6 text-center">
        <h2 className="text-4xl font-extrabold text-black tracking-tight uppercase flex items-center justify-center gap-3">
          <Package className="text-[#ada194]" size={32} /> Nos Produits
        </h2>
      </div>

      {products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <AlertCircle size={48} strokeWidth={1} />
          <p className="mt-4 text-xl font-medium">Aucun produit disponible pour le moment.</p>
        </div>
      ) : (
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map(product => (
            <div key={product.id} className="bg-[#ada194] rounded-3xl p-4 shadow-2xl flex flex-col transition-all hover:scale-[1.02]">
              <div 
                className="w-full h-64 overflow-hidden rounded-2xl mb-4 cursor-pointer group relative"
                onClick={() => setSelectedProduct(product)}
              >
                <img src={product.image} alt={product.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <span className="text-white font-bold bg-black/50 px-4 py-2 rounded-full text-sm flex items-center gap-2">
                    <Eye size={18} /> Voir détails
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-center mb-2 px-1">
                <h3 className="text-xl font-bold text-slate-900">{product.name}</h3>
                <span className="bg-slate-900 text-[#ada194] text-[10px] font-bold px-2 py-1 rounded">
                  Stock: {product.stock}
                </span>
              </div>
              <div className="text-xl font-black text-slate-900 mb-4 px-1">{Number(product.price).toLocaleString()} Ar</div>
              
              <button 
                onClick={() => addToCart(product)} 
                className="w-full bg-slate-900 text-white font-bold py-3 rounded-xl hover:bg-slate-800 transition-all active:scale-95 shadow-md flex items-center justify-center gap-2"
              >
                <ShoppingCart size={18} /> Ajouter au panier
              </button>
            </div>
          ))}
        </div>
      )}

      {/* --- MODALE DE DÉTAILS --- */}
      {selectedProduct && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[85vh] shadow-2xl relative flex flex-col md:flex-row overflow-hidden">
            
            <button 
              onClick={() => setSelectedProduct(null)}
              className="absolute top-4 right-4 z-50 bg-black/50 text-white w-10 h-10 rounded-full flex items-center justify-center hover:bg-red-600 transition-all backdrop-blur-md"
            >
              <X size={20} />
            </button>

            <div className="md:w-1/2 w-full h-64 md:h-full bg-gray-100">
              <img src={selectedProduct.image} alt={selectedProduct.name} className="w-full h-full object-cover" />
            </div>

            <div className="md:w-1/2 w-full p-8 overflow-y-auto flex flex-col bg-white">
              <h2 className="text-3xl font-black text-slate-900 mb-2 leading-tight">{selectedProduct.name}</h2>
              <p className="text-slate-400 uppercase tracking-widest text-xs mb-6 font-bold flex items-center gap-1">
                <Info size={14} /> Référence: #{selectedProduct.id}
              </p>
              
              <div className="text-3xl font-black text-[#ada194] mb-8">{Number(selectedProduct.price).toLocaleString()} Ar</div>

              <div className="border-t border-slate-100 pt-6 mb-8">
                <h4 className="font-bold text-slate-900 mb-3 uppercase text-sm tracking-wider">Description</h4>
                <p className="text-slate-600 leading-relaxed text-sm italic">
                  {selectedProduct.description || "Cette pièce exclusive a été conçue pour apporter une touche de modernité."}
                </p>
              </div>

              <div className="flex items-center gap-4 mb-10">
                <span className={`px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-2 ${selectedProduct.stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  <CheckCircle2 size={14} />
                  {selectedProduct.stock > 0 ? `DISPONIBLE (${selectedProduct.stock})` : 'RUPTURE DE STOCK'}
                </span>
              </div>

              <div className="mt-auto pt-6">
                <button 
                  onClick={() => { 
                    addToCart(selectedProduct); 
                    setSelectedProduct(null); 
                    Swal.fire({
                        title: 'Produit ajouté !',
                        text: "Souhaitez-vous finaliser votre commande ?",
                        icon: 'success',
                        showCancelButton: true,
                        confirmButtonText: 'Voir le panier',
                        cancelButtonText: 'Boutique',
                        confirmButtonColor: '#0f172a',
                        cancelButtonColor: '#ada194'
                    }).then((result) => {
                        if (result.isConfirmed) window.location.href = "/cart";
                    });
                  }}
                  className="w-full bg-black text-white font-bold py-4 rounded-2xl hover:bg-slate-800 transition-all shadow-xl active:scale-95 flex items-center justify-center gap-2"
                >
                  <ShoppingCart size={20} /> Finaliser l'ajout <ChevronRight size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Products;
