import { useState } from "react";
import API from "../api/axios";
import { useNavigate, Link } from "react-router-dom";
import AuthPage from "../components/AuthPage";

function Login({ onSwitch }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post("/auth/login", { email, password });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      navigate("/admin");
    } catch (error) {
      alert("Email ou mot de passe incorrect");
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-white px-4 overflow-hidden display-none w-full">
      <div className="max-w-md w-full bg-[#ada194] rounded-xl shadow-lg p-8">
        {/* En-tête */}
        <div className="text-center mb-10">
          <h2 className="text-3xl font-extrabold text-slate-900" 
            style={{ fontFamily: 'adorable', fontSize: '1.875rem', lineHeight: '1' }}>
            CONNEXION
          </h2>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          {/* Champ Email */}
          <div>
            <label className="block text-sm font-semibold text-black mb-2">Adresse Email</label>
            <input
              type="email"
              placeholder="votre@email.com"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition duration-200"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* Champ Mot de passe */}
          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm font-semibold text-black">Mot de passe</label>
            </div>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition duration-200"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {/* Bouton de soumission */}
          <button
            type="submit"
            className="w-full bg-slate-900 text-white font-bold py-3 rounded-lg hover:bg-slate-800 transform transition active:scale-[0.98] shadow-md"
          >
            Se connecter
          </button>
        </form>

        {/* Lien d'inscription */}
        <p className="text-center text-black mt-8">
          Pas encore de compte ?{" "}
          <button
            type="button"
            onClick={onSwitch} 
            className="text-[#3f1117] font-bold hover:underline"
          >
            Créer un compte
          </button>
        </p>
      </div>
    </div>
  );
}

export default Login;
