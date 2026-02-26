import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Login from "../pages/Login";
import Register from "../pages/Register";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-white overflow-hidden">
      <AnimatePresence mode="wait">
        {isLogin ? (
          <motion.div
            key="login"
            initial={{ x: -500, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -500, opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            {/* On passe la fonction onSwitch ici */}
            <Login onSwitch={() => setIsLogin(false)} />
          </motion.div>
        ) : (
          <motion.div
            key="register"
            initial={{ x: 500, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 500, opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            {/* On passe la fonction onSwitch ici */}
            <Register onSwitch={() => setIsLogin(true)} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
