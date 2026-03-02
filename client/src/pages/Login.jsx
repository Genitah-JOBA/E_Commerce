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
        <form onSubmit={handleLogin} className="space-y-6">
          {error && <p className="text-red-600 font-bold text-sm text-center">{error}</p>}

          <div>
            <label className="block text-sm font-semibold mb-2">Adresse Email</label>
            <input
              ref={emailRef}
              type="email"
              className={`w-full px-4 py-3 rounded-lg border outline-none ${error?.includes("email") ? 'border-red-600' : 'border-gray-300'}`}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={(e) => validateField(e, "email")} // Contrôle ici
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Mot de passe</label>
            <input
              ref={passwordRef}
              type="password"
              className={`w-full px-4 py-3 rounded-lg border outline-none ${error?.includes("password") ? 'border-red-600' : 'border-gray-300'}`}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onBlur={(e) => validateField(e, "password")} // Contrôle ici
              required
            />
          </div>

          <button type="submit" className="w-full bg-slate-900 text-white font-bold py-3 rounded-lg">
            Se connecter
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
