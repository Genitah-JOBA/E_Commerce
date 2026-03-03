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

  // Récupération de l'utilisateur pour pré-remplir les champs
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

  const handleCheckout = () => {
  const token = localStorage.getItem("token");
  if (!token) {
    Swal.fire({ icon: "error", title: "Connexion requise", confirmButtonColor: "#0f172a" });
    return;
  }

  const today = new Date().toISOString().split('T')[0];

  Swal.fire({
    title: 'Détails de la livraison 🚚',
    html: `
      <div class="flex flex-col gap-3 text-left">
        <div class="bg-gray-100 p-2 rounded text-center font-bold mb-2">Total : ${total.toLocaleString()} Ar</div>
        <div>
          <label class="text-xs font-bold text-gray-400">NOM COMPLET (Lettres uniquement)</label>
          <input id="swal-name" class="swal2-input !m-0 !w-full" value="${user.username || user.name || ''}" style="cursor:text">
        </div>
        <div class="flex gap-2">
          <div class="w-1/2">
            <label class="text-xs font-bold text-gray-400">TÉLÉPHONE (10 chiffres)</label>
            <input id="swal-phone" class="swal2-input !m-0 !w-full" placeholder="034XXXXXXX" maxlength="10" style="cursor:text">
          </div>
          <div class="w-1/2">
            <label class="text-xs font-bold text-gray-400">EMAIL</label>
            <input id="swal-email" type="email" class="swal2-input !m-0 !w-full" value="${user.email || ''}" style="cursor:text">
          </div>
        </div>
        <div>
          <label class="text-xs font-bold text-gray-400">ADRESSE PRÉCISE</label>
          <input id="swal-address" class="swal2-input !m-0 !w-full" style="cursor:text">
        </div>
        <div class="flex gap-2">
          <div class="w-1/2"><label class="text-xs font-bold text-gray-400">DATE</label><input id="swal-date" type="date" class="swal2-input !m-0 !w-full"></div>
          <div class="w-1/2"><label class="text-xs font-bold text-gray-400">HEURE</label><input id="swal-time" type="time" class="swal2-input !m-0 !w-full"></div>
        </div>
      </div>
    `,
    showCancelButton: true,
    confirmButtonText: 'Confirmer',
    confirmButtonColor: '#0f172a',
    didOpen: () => {
      // Force le curseur main sur les boutons
      Swal.getConfirmButton().style.cursor = 'pointer';
      Swal.getCancelButton().style.cursor = 'pointer';

      const nameInp = document.getElementById('swal-name');
      const phoneInp = document.getElementById('swal-phone');

      // 1. BLOCAGE NOM : Supprime instantanément tout ce qui n'est pas une lettre
      nameInp.addEventListener('input', (e) => {
        const start = e.target.selectionStart;
        e.target.value = e.target.value.replace(/[^a-zA-ZÀ-ÿ\s'-]/g, "");
        e.target.setSelectionRange(start, start);
      });

      if (!data.name || !data.phone || !data.address || !data.date || !data.time) {
        Swal.showValidationMessage(`Tous les champs sont obligatoires`);
        return false;
      }

      // --- CONTRÔLE DATE PASSÉE (SÉCURITÉ) ---
      const selectedDate = new Date(data.date);
      const currentDate = new Date();
      currentDate.setHours(0, 0, 0, 0);

      if (selectedDate < currentDate) {
        Swal.showValidationMessage(`La date de livraison ne peut pas être dans le passé`);
        return false;
      }

      // 2. BLOCAGE TÉLÉPHONE : Supprime tout ce qui n'est pas un chiffre
      phoneInp.addEventListener('input', (e) => {
        e.target.value = e.target.value.replace(/\D/g, "");
      });

      // 3. FOCUS TRAP (Message Box si invalide en quittant le champ)
      const inputs = {
        name: { el: nameInp, reg: /^[a-zA-ZÀ-ÿ\s'-]+$/, msg: "Le nom ne doit contenir que des lettres." },
        phone: { el: phoneInp, reg: /^(032|033|034|037|038)\d{7}$/, msg: "Téléphone invalide (10 chiffres commençant par 032/33/34/37/38)." }
      };

      Object.values(inputs).forEach(item => {
        item.el.addEventListener('focusout', async function() {
          const val = this.value.trim();
          if (val !== "" && !item.reg.test(val)) {
            await Swal.fire({
              title: "Saisie incorrecte",
              text: item.msg,
              icon: "error",
              confirmButtonText: "Corriger",
              confirmButtonColor: "#0f172a"
            });
            setTimeout(() => item.el.focus(), 10);
          }
        });
      });
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

      if (!data.name || !data.phone || !data.address || !data.date || !data.time) {
        Swal.showValidationMessage(`Tous les champs sont obligatoires`);
        return false;
      }
      // Validation finale du téléphone avant envoi
      if (!/^(032|033|034|037|038)\d{7}$/.test(data.phone)) {
        Swal.showValidationMessage(`Préfixe téléphone invalide (032/33/34/37/38)`);
        return false;
      }
      return data;
    }
  }).then((result) => {
    if (result.isConfirmed) sendOrderToDatabase(result.value);
  });
};

  const sendOrderToDatabase = async (deliveryData) => {
    const token = localStorage.getItem("token");
    const orderItems = cart.map(item => ({ product_id: item.id, quantity: item.quantity }));

    try {
      await API.post("/orders", { items: orderItems, delivery: deliveryData }, { headers: { Authorization: `Bearer ${token}` } });
      Swal.fire({ icon: 'success', title: 'Commande validée !', text: 'Merci pour votre confiance.', confirmButtonColor: '#0f172a' });
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
            <p className="text-xl text-gray-500 font-medium">Votre panier est vide.</p>
          </div>
        ) : (
          <div className="grid gap-6">
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
              {cart.map((item, index) => (
                <div key={item.id} className="flex items-center justify-between p-6 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition">
                  <div className="flex-1">
                    <h4 className="text-lg font-bold text-slate-900">{item.name}</h4>
                    <p className="text-[#ada194] font-black">{Number(item.price).toLocaleString()} Ar</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3 bg-gray-100 px-3 py-1 rounded-full">
                      <button onClick={() => decreaseQty(index)} className="p-1 hover:text-[#ada194] transition-colors"><Minus size={16} /></button>
                      <span className="font-bold w-4 text-center">{item.quantity}</span>
                      <button onClick={() => increaseQty(index)} className="p-1 hover:text-[#ada194] transition-colors"><Plus size={16} /></button>
                    </div>
                    <button onClick={() => removeItem(index)} className="text-red-400 hover:text-red-600 transition-colors"><Trash2 size={20} /></button>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-slate-900 rounded-3xl p-8 text-white shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <span className="text-gray-400 font-medium uppercase tracking-widest">Total à régler</span>
                <span className="text-3xl font-black">{total.toLocaleString()} Ar</span>
              </div>
              <button 
                onClick={handleCheckout}
                style={{ cursor: 'pointer' }}
                className="w-full bg-white text-slate-900 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-gray-100 transition shadow-lg"
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
