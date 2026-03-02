import { useState, useRef } from "react";
import API from "../api/axios";
import { useNavigate } from "react-router-dom";

function Login({ onSwitch }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(""); // On initialise avec une chaîne vide
  
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const navigate = useNavigate();

  const validateField = (e, type) => {
    const value = e.target.value;
    
    // Si le champ est vide, on ne bloque pas (optionnel)
    if (value === "") {
      setError("");
      return;
    }

    let errorMessage = "";
    if (type === "email") {
      const isValidEmail = value.includes("@") && value.includes(".");
      if (!isValidEmail) errorMessage = "Format email invalide (ex: nom@domaine.com)";
    } else if (type === "password") {
      if (value.length < 4) errorMessage = "Le mot de passe doit faire au moins 4 caractères";
    }

    if (errorMessage) {
      setError(errorMessage);
      // On utilise un timeout pour forcer le focus APRES le rendu de l'erreur
      setTimeout(() => {
        e.target.focus();
      }, 10);
    } else {
      setError(""); // On vide l'erreur si tout est bon
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(""); // Reset avant tentative

    try {
      const res = await API.post("/auth/login", { email, password });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      navigate("/admin");
    } catch (err) {
      // Si l'API renvoie une erreur (ex: 401), on affiche l'erreur et on bloque sur l'email
      setError("Email ou mot de passe incorrect");
      setTimeout(() => emailRef.current?.focus(), 10);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-white px-4">
      <div className="max-w-md w-full bg-[#ada194] rounded-xl shadow-lg p-8">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-extrabold text-slate-900" style={{ fontFamily: 'adorable' }}>
            CONNEXION
          </h2>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          {/* Message d'erreur : affichage SI error n'est pas vide */}
          {error && (
            <div className="bg-red-100 border-l-4 border-red-600 text-red-700 p-3 rounded shadow-sm text-sm font-bold animate-pulse">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-black mb-2">Adresse Email</label>
            <input
              ref={emailRef}
              type="email"
              placeholder="votre@email.com"
              className={`w-full px-4 py-3 rounded-lg border outline-none transition-all
                ${error && error.includes("email") ? 'border-red-600 ring-2 ring-red-100' : 'border-gray-300 focus:ring-2 focus:ring-blue-500'}`}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={(e) => validateField(e, "email")}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-black mb-2">Mot de passe</label>
            <input
              ref={passwordRef}
              type="password"
              placeholder="••••••••"
              className={`w-full px-4 py-3 rounded-lg border outline-none transition-all
                ${error && error.includes("passe") ? 'border-red-600 ring-2 ring-red-100' : 'border-gray-300 focus:ring-2 focus:ring-blue-500'}`}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onBlur={(e) => validateField(e, "password")}
              required
            />
          </div>

          <button type="submit" className="w-full bg-slate-900 text-white font-bold py-3 rounded-lg hover:bg-slate-800 shadow-md">
            Se connecter
          </button>
        </form>

        <p className="text-center text-black mt-8">
          Pas encore de compte ?{" "}
          <button type="button" onClick={onSwitch} className="text-[#3f1117] font-bold hover:underline">
            Créer un compte
          </button>
        </p>
      </div>
    </div>
  );
}

export default Login;
