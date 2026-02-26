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

function Cart() {
  const [cart, setCart] = useState([]);

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
        
        Swal.fire({
          title: "Supprimé",
          icon: "success",
          timer: 1000,
          showConfirmButton: false
        });
      }
    });
  };

  const total = cart.reduce(
    (sum, item) => sum + Number(item.price) * item.quantity,
    0
  );

  const handleOrder = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      Swal.fire({
        icon: "error",
        title: "Connexion requise",
        text: "Veuillez vous connecter pour passer commande.",
        confirmButtonColor: "#ada194"
      });
      return;
    }

    if (cart.length === 0) {
      Swal.fire({ icon: "info", title: "Panier vide" });
      return;
    }

    // Confirmation MessageBox before placing order
    const result = await Swal.fire({
      title: "Confirmer la commande",
      text: `Montant total : ${total.toLocaleString()} Ar. Souhaitez-vous valider ?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#0f172a",
      cancelButtonColor: "#ada194",
      confirmButtonText: "Valider la commande",
      cancelButtonText: "Vérifier encore"
    });

    if (result.isConfirmed) {
      const orderItems = cart.map(item => ({
        product_id: item.id,
        quantity: item.quantity
      }));

      try {
        await API.post(
          "/orders",
          { items: orderItems },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        Swal.fire({
          icon: "success",
          title: "Commande validée !",
          text: "Merci pour votre confiance. Nous traitons votre commande.",
          confirmButtonColor: "#ada194"
        });

        localStorage.removeItem("cart");
        setCart([]);
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Erreur",
          text: error.response?.data?.error || "Une erreur est survenue lors de la commande."
        });
      }
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
                onClick={handleOrder}
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
