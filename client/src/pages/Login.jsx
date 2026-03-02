import { useState, useRef } from "react";
import API from "../api/axios";
import { useNavigate } from "react-router-dom";

function Login({ onSwitch }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  
  // 1. Création de références pour cibler les inputs
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  
  const navigate = useNavigate();

  // 2. Fonction de contrôle à la sortie du champ
  const validateField = (e, type) => {
    const value = e.target.value;
    let isValid = true;

    if (type === "email") {
      // Vérification simple du format email
      isValid = value.includes("@") && value.includes(".");
    } else if (type === "password") {
      // Exemple : minimum 4 caractères
      isValid = value.length >= 4;
    }

    if (!isValid && value !== "") {
      setError(`Format ${type} invalide`);
      // 3. Force le focus à revenir dans le champ
      setTimeout(() => e.target.focus(), 0); 
    } else {
      setError(null);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post("/auth/login", { email, password });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      navigate("/admin");
    } catch (err) {
      setError("Email ou mot de passe incorrect");
      emailRef.current.focus(); // Retour au début en cas d'erreur API
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
          {/* Message d'erreur global si besoin */}
          {error && (
            <div className="text-red-700 bg-red-100 p-3 rounded-lg text-sm font-bold text-center">
              {error}
            </div>
          )}

          {/* Champ Email */}
          <div>
            <label className="block text-sm font-semibold text-black mb-2">Adresse Email</label>
            <input
              type="email"
              className={`w-full px-4 py-3 rounded-lg border outline-none transition duration-200 
                ${error ? 'border-red-600 ring-1 ring-red-600' : 'border-gray-300 focus:ring-2 focus:ring-blue-500'}`}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={(e) => validateField(e, "email")}
              required
            />
          </div>

          {/* Champ Mot de passe */}
          <div>
            <label className="block text-sm font-semibold text-black mb-2">Mot de passe</label>
            <input
              type="password"
              className={`w-full px-4 py-3 rounded-lg border outline-none transition duration-200 
                ${error ? 'border-red-600 ring-1 ring-red-600' : 'border-gray-300 focus:ring-2 focus:ring-blue-500'}`}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onBlur={(e) => validateField(e, "password")}
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-slate-900 text-white font-bold py-3 rounded-lg hover:bg-slate-800 shadow-md"
          >
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
