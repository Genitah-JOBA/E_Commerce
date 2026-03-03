import { useEffect, useState } from "react";
import API from "../api/axios";
import Swal from "sweetalert2";
import { 
  Trash2, 
  Plus, 
  Minus, 
  ShoppingCart, 
  CreditCard, 
  PackageOpen,
  ArrowLeft 
} from "lucide-react";
import { Link } from "react-router-dom";

import { useEffect, useState } from "react";
import API from "../api/axios";
import Swal from "sweetalert2";
import { 
  Trash2, 
  Plus, 
  Minus, 
  ShoppingCart, 
  CreditCard, 
  PackageOpen,
  ArrowLeft 
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

function Cart() {
  const [cart, setCart] = useState([]);
  const navigate = useNavigate();

  // On récupère l'utilisateur en haut du composant pour qu'il soit accessible partout
  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : {};

  useEffect(() => {
    const storedCart = JSON.parse(localStorage.getItem("cart")) || [];
    setCart(storedCart);
  }, []);

  const updateCart = (updatedCart) => {
    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
  };

  const increaseQty = (index) => {
    const updatedCart = [...cart];
    updatedCart[index].quantity += 1;
    updateCart(updatedCart);
  };

  const decreaseQty = (index) => {
    const updatedCart = [...cart];
    if (updatedCart[index].quantity > 1) {
      updatedCart[index].quantity -= 1;
      updateCart(updatedCart);
    } else {
      removeItem(index);
    }
  };

  const removeItem = (index) => {
    Swal.fire({
      title: "Supprimer l'article ?",
      text: "Voulez-vous retirer ce produit du panier ?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#0f172a",
      cancelButtonColor: "#ada194",
      confirmButtonText: "Oui, supprimer",
      cancelButtonText: "Annuler"
    }).then((result) => {
      if (result.isConfirmed) {
        const updatedCart = [...cart];
        updatedCart.splice(index, 1);
        updateCart(updatedCart);
      }
    });
  };

  const total = cart.reduce(
    (sum, item) => sum + Number(item.price) * item.quantity,
    0
  );

  // FONCTION UNIQUE POUR PASSER COMMANDE
    const handleCheckout = () => {
    // 1. Définition des règles de contrôle
    const validateData = (data) => {
      const nameRegex = /^[a-zA-ZÀ-ÿ\s'-]+$/;
      const phoneRegex = /^(032|033|034|037|038)\d{7}$/;
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!nameRegex.test(data.name)) return "Le nom ne doit contenir que des lettres.";
      if (!phoneRegex.test(data.phone)) return "Téléphone invalide (10 chiffres commençant par 032/33/34/37/38).";
      if (!emailRegex.test(data.email)) return "Format d'email invalide.";
      if (!data.address || !data.date || !data.time) return "Veuillez remplir tous les champs de livraison.";
      return null;
    };

    Swal.fire({
      title: 'Détails de la livraison 🚚',
      html: `
        <div class="flex flex-col gap-3 text-left">
          <div class="bg-gray-100 p-2 rounded text-center font-bold mb-2">Total : ${total.toLocaleString()} Ar</div>
          <div>
            <label class="text-xs font-bold text-gray-400">NOM COMPLET</label>
            <input id="swal-name" class="swal2-input !m-0 !w-full" value="${user.username || user.name || ''}" placeholder="Ex: Jean Dupont">
          </div>
          <div class="flex gap-2">
            <div class="w-1/2">
              <label class="text-xs font-bold text-gray-400">TÉLÉPHONE</label>
              <input id="swal-phone" class="swal2-input !m-0 !w-full" placeholder="034 XX XXX XX">
            </div>
            <div class="w-1/2">
              <label class="text-xs font-bold text-gray-400">EMAIL</label>
              <input id="swal-email" type="email" class="swal2-input !m-0 !w-full" value="${user.email || ''}">
            </div>
          </div>
          <div>
            <label class="text-xs font-bold text-gray-400">ADRESSE PRÉCISE</label>
            <input id="swal-address" class="swal2-input !m-0 !w-full" placeholder="Lot, Quartier, Ville">
          </div>
          <div class="flex gap-2">
            <div class="w-1/2">
              <label class="text-xs font-bold text-gray-400">DATE</label>
              <input id="swal-date" type="date" class="swal2-input !m-0 !w-full">
            </div>
            <div class="w-1/2">
              <label class="text-xs font-bold text-gray-400">HEURE</label>
              <input id="swal-time" type="time" class="swal2-input !m-0 !w-full">
            </div>
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Confirmer la commande',
      cancelButtonText: 'Annuler',
      confirmButtonColor: '#0f172a',
      // CURSEUR MAIN FORCÉ
      didOpen: () => {
        const confirmBtn = Swal.getConfirmButton();
        const cancelBtn = Swal.getCancelButton();
        if (confirmBtn) confirmBtn.style.cursor = 'pointer';
        if (cancelBtn) cancelBtn.style.cursor = 'pointer';
      },
      preConfirm: () => {
        const data = {
          name: document.getElementById('swal-name').value.trim(),
          phone: document.getElementById('swal-phone').value.trim(),
          email: document.getElementById('swal-email').value.trim(),
          address: document.getElementById('swal-address').value.trim(),
          date: document.getElementById('swal-date').value,
          time: document.getElementById('swal-time').value
        };

        const errorMessage = validateData(data);

        if (errorMessage) {
          // Affiche la MessageBox d'erreur par-dessus la modale (comme ton Login)
          Swal.showValidationMessage(errorMessage); 
          
          // Focus automatique sur le champ (simulé par SweetAlert2)
          return false; 
        }
        return data;
      }
    }).then((result) => {
      if (result.isConfirmed) {
        sendOrderToDatabase(result.value);
      }
    });
  };


  const sendOrderToDatabase = async (deliveryData) => {
    const token = localStorage.getItem("token");
    const orderItems = cart.map(item => ({
      product_id: item.id,
      quantity: item.quantity
    }));

    try {
      await API.post(
        "/orders",
        { items: orderItems, delivery: deliveryData },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      Swal.fire({
        icon: 'success',
        title: 'Commande validée !',
        text: 'Merci pour votre confiance. Nous traitons votre colis.',
        confirmButtonColor: '#0f172a'
      });

      localStorage.removeItem("cart");
      setCart([]);
    } catch (err) {
      Swal.fire('Erreur', err.response?.data?.message || 'Erreur lors de la commande', 'error');
    }
  };

  return (
    <div className="bg-white min-h-screen p-6 md:p-12">
      <div className="max-w-4xl mx-auto">
        
        <header className="flex items-center justify-between mb-10">
          <h2 className="text-4xl font-black text-slate-900 flex items-center gap-3">
            <ShoppingCart className="text-[#ada194]" size={36} /> Mon Panier
          </h2>
          <Link to="/products" className="text-sm font-bold text-[#ada194] flex items-center gap-1 hover:underline">
            <ArrowLeft size={16} /> Continuer les achats
          </Link>
        </header>

        {cart.length === 0 ? (
          <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
            <PackageOpen size={64} className="mx-auto text-gray-300 mb-4" />
            <p className="text-xl text-gray-500 font-medium">Votre panier est encore vide.</p>
            <Link to="/products" className="mt-6 inline-block bg-black text-white px-8 py-3 rounded-xl font-bold">
              Découvrir nos produits
            </Link>
          </div>
        ) : (
          <div className="grid gap-6">
            {/* LISTE DES PRODUITS */}
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
              {cart.map((item, index) => (
                <div key={item.id} className="flex items-center justify-between p-6 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition">
                  <div className="flex-1">
                    <h4 className="text-lg font-bold text-slate-900">{item.name}</h4>
                    <p className="text-[#ada194] font-black">{Number(item.price).toLocaleString()} Ar</p>
                  </div>

                  <div className="flex items-center gap-4 mx-8">
                    <button 
                      onClick={() => decreaseQty(index)}
                      className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center hover:bg-[#ada194] hover:text-white transition"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="font-bold text-lg w-4 text-center">{item.quantity}</span>
                    <button 
                      onClick={() => increaseQty(index)}
                      className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center hover:bg-[#ada194] hover:text-white transition"
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  <button 
                    onClick={() => removeItem(index)}
                    className="p-3 text-red-400 hover:bg-red-50 rounded-full transition"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              ))}
            </div>

            {/* RÉSUMÉ ET BOUTON COMMANDE */}
            <div className="bg-slate-900 rounded-3xl p-8 text-white flex flex-col md:flex-row items-center justify-between shadow-2xl">
              <div>
                <p className="text-slate-400 font-bold uppercase tracking-widest text-xs mb-1">Total à régler</p>
                <h3 className="text-3xl font-black">{total.toLocaleString()} Ar</h3>
              </div>
              
              <button
                onClick={handleCheckout}
                className="mt-6 md:mt-0 w-full md:w-auto bg-[#ada194] hover:bg-white hover:text-[#ada194] text-white px-10 py-4 rounded-2xl font-black transition-all flex items-center justify-center gap-3 shadow-lg active:scale-95"
              >
                <CreditCard size={20} /> PASSER COMMANDE
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Cart;
