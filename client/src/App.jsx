import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Products from "./pages/Products";
import Navbar from "./components/Navbar";
import Cart from "./pages/Cart";
import AuthPage from "./components/AuthPage";
import AdminDashboard from "./pages/AdminDashboard" ;
import AdminOrders from "./pages/AdminOrders";
import OrdersHistory from "./pages/OrdersHistory";

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<Products />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path = "/admin" element = { <AdminDashboard /> } />
        <Route path="/admin/orders" element={<AdminOrders />} />
        <Route path="/order" element={<OrdersHistory />} />
      </Routes>
    </Router>
  );
}

export default App;