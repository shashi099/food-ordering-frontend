import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../services/api';

export default function Cart() {
  const [cartData, setCartData] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const navigate = useNavigate();

  const fetchCart = async () => {
    try {
      setLoading(true);
      const user = JSON.parse(localStorage.getItem('user'));
      const userId = user?.id || user?.userId;

      if (!userId) {
        navigate('/login');
        return;
      }

      // Exact endpoint based on your structure
      const response = await API.get(`/cart/user/${userId}`);
      console.log("Cart Response:", response.data);

      // Safely extracting items based on your backend response pattern
      const fetchedItems = response.data?.data?.items || response.data?.data?.data || response.data?.items || [];
      setCartData(response.data?.data || {});
      setCartItems(fetchedItems);
    } catch (err) {
      console.error('Failed to load cart:', err);
      setError('Failed to load cart items.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  // ✅ Handle Place Order (Only requires userId as per your new OrderRequest)
  const handlePlaceOrder = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const userId = user?.id || user?.userId;

      if (!userId) {
        alert('Please login first!');
        navigate('/login');
        return;
      }

      if (cartItems.length === 0) {
        alert('Your cart is empty!');
        return;
      }

      setActionLoading(true);

      // Payload strictly matches your updated OrderRequest: private Long userId;
      const payload = { userId };

      const response = await API.post('/orders/place', payload);
      const placedOrder = response.data?.data || response.data;
      
      alert(`🎉 Order placed successfully! Order ID: ${placedOrder.orderId || 'Confirmed'}`);
      
      // Refresh cart or redirect
      setCartItems([]);
      navigate('/orders'); // Redirects user to see their active/past orders immediately

    } catch (err) {
      console.error('Failed to place order:', err.response || err);
      alert(err.response?.data?.message || 'Failed to place order. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  // ✅ Handle Clear Cart
  const handleClearCart = async () => {
    if (!window.confirm('Are you sure you want to clear your cart?')) return;

    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const userId = user?.id || user?.userId;

      if (!userId) return;

      setActionLoading(true);
      // Adjust endpoint path if your backend uses a different route for clearing (e.g., /cart/clear/{userId} or /cart/{userId})
      await API.delete(`/cart/clear/${userId}`);
      
      setCartItems([]);
      alert('Cart cleared successfully.');
    } catch (err) {
      console.error('Failed to clear cart:', err.response || err);
      alert(err.response?.data?.message || 'Failed to clear cart.');
    } finally {
      setActionLoading(false);
    }
  };

  // Calculate total amount dynamically if not provided by backend
  const calculateTotal = () => {
    if (cartData?.totalAmount !== undefined && cartData?.totalAmount !== null) {
      return cartData.totalAmount;
    }
    return cartItems.reduce((sum, item) => {
      const price = item.price || item.menuItem?.price || 0;
      const qty = item.quantity || 1;
      return sum + (price * qty);
    }, 0);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', fontFamily: 'sans-serif' }}>
        <p style={{ fontSize: '18px', color: '#666' }}>Loading your cart...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', marginTop: '50px', fontFamily: 'sans-serif' }}>
        <p style={{ color: '#ff4757', fontSize: '16px' }}>{error}</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '800px', margin: '40px auto', padding: '20px', fontFamily: 'sans-serif' }}>
      {/* Top Header & Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', borderBottom: '2px solid #f1f2f6', paddingBottom: '15px' }}>
        <div>
          <h2 style={{ margin: '0 0 5px', color: '#2f3542' }}>🛒 Your Shopping Cart</h2>
          <p style={{ margin: '0', color: '#747d8c', fontSize: '14px' }}>Review your selected dishes before checkout</p>
        </div>

        <button 
          onClick={() => navigate('/restaurants')} 
          style={{ padding: '8px 14px', background: '#f1f2f6', color: '#2f3542', border: '1px solid #ced6e0', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          ← Continue Shopping
        </button>
      </div>

      {cartItems.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', background: '#f8f9fa', borderRadius: '8px', border: '1px dashed #ced6e0' }}>
          <p style={{ color: '#747d8c', fontSize: '16px', marginBottom: '15px' }}>Your cart is currently empty.</p>
          <button 
            onClick={() => navigate('/restaurants')}
            style={{ padding: '10px 20px', background: '#1e90ff', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            Explore Restaurants 🍔
          </button>
        </div>
      ) : (
        <div>
          {/* Action Header: Clear Cart Button */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '15px' }}>
            <button 
              onClick={handleClearCart}
              disabled={actionLoading}
              style={{ padding: '6px 12px', background: 'transparent', color: '#ff4757', border: '1px solid #ff4757', borderRadius: '4px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold' }}
            >
              🗑️ Clear Cart
            </button>
          </div>

          {/* Cart Items List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '30px' }}>
            {cartItems.map((item, index) => {
              const name = item.foodName || item.menuItem?.foodName || 'Item Name Unavailable';
              const price = item.price || item.menuItem?.price || 0;
              const quantity = item.quantity || 1;
              const description = item.description || item.menuItem?.description || '';

              return (
                <div 
                  key={item.cartId || item.id || index} 
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #e1e1e1', padding: '15px 20px', borderRadius: '8px', background: 'white', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}
                >
                  <div>
                    <h4 style={{ margin: '0 0 5px', fontSize: '16px', color: '#2f3542' }}>{name}</h4>
                    {description && <p style={{ margin: '0 0 5px', color: '#747d8c', fontSize: '13px' }}>{description}</p>}
                    <span style={{ fontSize: '13px', color: '#747d8c' }}>Qty: <strong>{quantity}</strong></span>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <span style={{ color: '#ff4757', fontWeight: 'bold', fontSize: '16px' }}>₹{price * quantity}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Checkout & Bill Summary Box */}
          <div style={{ background: '#f8f9fa', padding: '25px', borderRadius: '10px', border: '1px solid #dcdde1', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ margin: '0 0 5px', color: '#747d8c', fontSize: '14px' }}>Total Amount</p>
              <h2 style={{ margin: '0', color: '#2f3542', fontSize: '24px' }}>₹{calculateTotal()}</h2>
            </div>

            <button 
              onClick={handlePlaceOrder}
              disabled={actionLoading}
              style={{ padding: '14px 28px', background: '#2ed573', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px', boxShadow: '0 4px 6px rgba(46,213,115,0.2)' }}
            >
              {actionLoading ? 'Processing...' : 'Place Order 🚀'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}