import { useState } from "react";
import API from "../api/axios";
import { useNavigate } from "react-router-dom";
import AuthPage from "../components/AuthPage";

function Register({ onSwitch }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Gestion unique des inputs
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    // --- CONTRÔLES DES CHAMPS ---
    if (formData.name.trim().length < 2) {
      return setError("Le nom est trop court.");
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      return setError("Format d'email invalide.");
    }

    if (formData.password.length < 6) {
      return setError("Le mot de passe doit faire au moins 6 caractères.");
    }

    if (formData.password !== formData.confirmPassword) {
      return setError("Les mots de passe ne correspondent pas.");
    }

    try {
      // Note: Utilisation de /auth/register pour l'inscription
      const res = await API.post("/auth/register", {
        name: formData.name,
        email: formData.email,
        password: formData.password
      });
      
      if (res.data.user.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de l'inscription");
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-white px-4">
      <div className="max-w-md w-full bg-[#ada194] rounded-xl shadow-lg p-8">
        
        <div className="text-center mb-4">
          <h2 className="inline-block transition-transform duration-300 hover:scale-110 text-3xl font-extrabold text-slate-900" 
            style={{ fontFamily: 'adorable' }}>
            INSCRIPTION
          </h2>
          {error && <p className="bg-red-100 text-red-700 p-2 rounded mt-4 text-sm font-bold">{error}</p>}
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          {/* Nom */}
          <div>
            <label className="block text-sm font-semibold text-black mb-1">Nom</label>
            <input
              name="name"
              type="text"
              placeholder="Votre nom"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-slate-900 outline-none transition"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-semibold text-black mb-1">Adresse Email</label>
            <input
              name="email"
              type="email"
              placeholder="votre@email.com"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-slate-900 outline-none transition"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          {/* Mot de passe */}
          <div>
            <label className="block text-sm font-semibold text-black mb-1">Mot de passe (minimum 6)</label>
            <input
              name="password"
              type="password"
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-slate-900 outline-none transition"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          {/* Confirmation */}
          <div>
            <label className="block text-sm font-semibold text-black mb-1">Confirmer le mot de passe</label>
            <input
              name="confirmPassword"
              type="password"
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-slate-900 outline-none transition"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>

          {/* Bouton avec effet bombé */}
          <button
            type="submit"
            className="w-full bg-slate-900 text-white font-bold py-3 rounded-lg mt-4 transition-all duration-300 hover:scale-[1.03] hover:bg-slate-800 active:scale-[0.98] shadow-md"
          >
            S'inscrire
          </button>

          <p className="text-center text-black">
            Déjà un compte ?{" "}
            <button 
              type="button"
              onClick={onSwitch} 
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
