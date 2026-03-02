import { useState, useRef } from "react";
import API from "../api/axios";
import { useNavigate } from "react-router-dom";

function Register({ onSwitch }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  
  // Références pour le contrôle du focus
  const nameRef = useRef(null);
  const emailRef = useRef(null);
  const passRef = useRef(null);
  const confirmRef = useRef(null);
  const lastActiveField = useRef(null);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // --- FONCTION DE CONTRÔLE (MESSAGE BOX + FOCUS) ---
  const triggerError = (message, fieldRef) => {
    setError(message);
    setShowModal(true);
    lastActiveField.current = fieldRef;
  };

    const validateField = (e) => {
    const { name, value } = e.target;
    if (value === "") return;

    if (name === "name") {
      // 1. Vérification de la longueur
      if (value.trim().length < 2) {
        return triggerError("Le nom est trop court (min 2 caractères).", nameRef);
      }
      
      // 2. Vérification "Lettres uniquement" (Regex)
      // Autorise : Lettres majuscules/minuscules, Accents, Espaces, Trait d'union et Apostrophe
      const nameRegex = /^[a-zA-ZÀ-ÿ\s'-]+$/;
      if (!nameRegex.test(value)) {
        return triggerError("Le nom ne doit contenir que des lettres (pas de chiffres ou symboles).", nameRef);
      }
    } 
    else if (name === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      triggerError("Format d'email invalide.", emailRef);
    } 
    else if (name === "password" && value.length < 6) {
      triggerError("Le mot de passe doit faire au moins 6 caractères.", passRef);
    }
  };


  const closeModal = () => {
    setShowModal(false);
    setError("");
    setTimeout(() => {
      lastActiveField.current?.current?.focus();
    }, 10);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      return triggerError("Les mots de passe ne correspondent pas.", confirmRef);
    }

    try {
      const res = await API.post("/auth/register", {
        name: formData.name,
        email: formData.email,
        password: formData.password
      });
      navigate(res.data.user.role === "admin" ? "/admin" : "/");
    } catch (err) {
      triggerError(err.response?.data?.message || "Erreur d'inscription", emailRef);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-white px-4 relative">
      
      {/* --- MESSAGE BOX (MODALE) --- */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white p-6 rounded-xl shadow-2xl max-w-sm w-full border-t-4 border-red-600 text-black">
            <h3 className="text-xl font-bold text-red-600 mb-2">Erreur</h3>
            <p className="mb-6 font-medium">{error}</p>
            <button
              onClick={closeModal}
              style={{ cursor: 'pointer' }}
              className="w-full bg-slate-900 text-white py-2 rounded-lg font-bold hover:bg-slate-800 transition"
            >
              Corriger
            </button>
          </div>
        </div>
      )}

      <div className="max-w-md w-full bg-[#ada194] rounded-xl shadow-lg p-8">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-extrabold text-slate-900" style={{ fontFamily: 'adorable' }}>
            INSCRIPTION
          </h2>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-black mb-1">Nom</label>
            <input
              ref={nameRef}
              name="name"
              type="text"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 outline-none focus:ring-2 focus:ring-slate-900 transition"
              value={formData.name}
              onChange={handleChange}
              onBlur={validateField}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-black mb-1">Email</label>
            <input
              ref={emailRef}
              name="email"
              type="email"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 outline-none focus:ring-2 focus:ring-slate-900 transition"
              value={formData.email}
              onChange={handleChange}
              onBlur={validateField}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-black mb-1">Mot de passe</label>
            <input
              ref={passRef}
              name="password"
              type="password"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 outline-none focus:ring-2 focus:ring-slate-900 transition"
              value={formData.password}
              onChange={handleChange}
              onBlur={validateField}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-black mb-1">Confirmation</label>
            <input
              ref={confirmRef}
              name="confirmPassword"
              type="password"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 outline-none focus:ring-2 focus:ring-slate-900 transition"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>

          <button
            type="submit"
            style={{ cursor: 'pointer' }}
            className="w-full bg-slate-900 text-white font-bold py-3 rounded-lg mt-4 transition-all hover:bg-slate-800 shadow-md"
          >
            S'inscrire
          </button>

          <p className="text-center text-black">
            Déjà un compte ?{" "}
            <button 
              type="button"
              onClick={onSwitch} 
              style={{ cursor: 'pointer' }}
              className="text-[#3f1117] font-bold hover:underline">
              Se connecter
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Register;
