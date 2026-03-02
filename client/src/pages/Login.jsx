import { useState, useRef } from "react";
import API from "../api/axios";
import { useNavigate } from "react-router-dom";

function Login({ onSwitch }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(""); 
  const [showModal, setShowModal] = useState(false);
  
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const lastActiveField = useRef(null);
  const navigate = useNavigate();

  const triggerError = (message, fieldRef) => {
    setError(message);
    setShowModal(true);
    lastActiveField.current = fieldRef;
  };

  const validateField = (e, type) => {
    const value = e.target.value;
    if (value === "") return;

    if (type === "email") {
      const isValidEmail = value.includes("@") && value.includes(".");
      if (!isValidEmail) {
        triggerError("Format email invalide (ex: nom@domaine.com)", emailRef);
      }
    } else if (type === "password") {
      if (value.length < 4) {
        triggerError("Le mot de passe est trop court (min 4)", passwordRef);
      }
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setError("");
    setTimeout(() => {
      lastActiveField.current?.current?.focus();
    }, 10);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post("/auth/login", { email, password });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      navigate("/admin");
    } catch (err) {
      triggerError("Email ou mot de passe incorrect", emailRef);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-white px-4 relative">
      
      {/* --- MESSAGE BOX (MODALE) --- */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white p-6 rounded-xl shadow-2xl max-w-sm w-full border-t-4 border-red-600">
            <h3 className="text-xl font-bold text-red-600 mb-2">Erreur de saisie</h3>
            <p className="text-gray-700 mb-6 font-medium">{error}</p>
            <button
              onClick={closeModal}
              // AJOUT : cursor-pointer
              className="w-full bg-slate-900 text-white py-2 rounded-lg font-bold hover:bg-slate-800 transition cursor-pointer"
            >
              Corriger le champ
            </button>
          </div>
        </div>
      )}

      <div className="max-w-md w-full bg-[#ada194] rounded-xl shadow-lg p-8">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-extrabold text-slate-900" style={{ fontFamily: 'adorable' }}>
            CONNEXION
          </h2>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-black mb-2">Adresse Email</label>
            <input
              ref={emailRef}
              type="email"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 outline-none focus:ring-2 focus:ring-blue-500"
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
              className="w-full px-4 py-3 rounded-lg border border-gray-300 outline-none focus:ring-2 focus:ring-blue-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onBlur={(e) => validateField(e, "password")}
              required
            />
          </div>

          <button 
            type="submit" 
            // AJOUT : cursor-pointer
            className="w-full bg-slate-900 text-white font-bold py-3 rounded-lg hover:bg-slate-800 transition cursor-pointer"
          >
            Se connecter
          </button>
        </form>

        <p className="text-center text-black mt-8">
          Pas encore de compte ?{" "}
          <button 
            type="button" 
            onClick={onSwitch} 
            // AJOUT : cursor-pointer
            className="text-[#3f1117] font-bold hover:underline cursor-pointer"
          >
            Créer un compte
          </button>
        </p>
      </div>
    </div>
  );
}

export default Login;
