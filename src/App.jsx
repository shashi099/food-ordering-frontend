import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/customer/Login';
import Register from './pages/customer/Register';
import RestaurantList from './pages/customer/RestaurantList';
import RestaurantDetails from './pages/customer/RestaurantDetails';
import Cart from './pages/customer/Cart';
import AdminRestaurantList from './pages/admin/AdminRestaurantList'; // 👈 Updated import filename
import AdminRestaurantDetails from './pages/admin/AdminRestaurantDetails';
import UserOrders from './pages/customer/UserOrders';
import OrderDetails from './pages/customer/OrderDetails';
 

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/restaurants" element={<RestaurantList />} />
        <Route path="/restaurant/:id" element={<RestaurantDetails />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/admin/restaurants" element={<AdminRestaurantList />} /> {/* 👈 Updated component */}
        {/* Admin Restaurant Details Menu Management */}
        <Route path="/admin/restaurant/:id" element={<AdminRestaurantDetails />} />
        <Route path="/orders" element={<UserOrders />} />

        <Route path="/orders/:orderId" element={<OrderDetails />} />
      </Routes>
    </Router>
  );
}

export default App;