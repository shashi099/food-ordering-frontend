import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../services/api';

export default function Cart() {
  const [cartData, setCartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const fetchCart = async () => {
    try {
      const storedUser = localStorage.getItem('user');
      if (!storedUser) {
        navigate('/login');
        return;
      }

      const user = JSON.parse(storedUser);
      const userId = user?.id || user?.userId;

      if (!userId) {
        setError('User ID not found in session. Please log in again.');
        setLoading(false);
        return;
      }

      const response = await API.get(`/cart/user/${userId}`);
      if (response.data && response.data.data) {
        setCartData(response.data.data);
      } else {
        setCartData({ items: [], totalAmount: 0 });
      }
    } catch (err) {
      console.error('Cart fetch error:', err);
      setError('Failed to load cart items from backend.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  // ✅ Handle Quantity Update (+ / -)
  const handleUpdateQuantity = async (cartId, currentQuantity, delta) => {
    const newQuantity = currentQuantity + delta;

    // If quantity drops below 1, prompt or remove instead of throwing backend error
    if (newQuantity <= 0) {
      handleRemoveItem(cartId);
      return;
    }

    try {
      // Matches your UpdateQuantityRequest body { "quantity": value }
      await API.put(`/cart/update/${cartId}`, { quantity: newQuantity });
      // Refresh cart to show updated sub-totals and grand total
      fetchCart();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update quantity.');
    }
  };

  // ✅ Remove single item handler
  const handleRemoveItem = async (cartId) => {
    try {
      await API.delete(`/cart/remove/${cartId}`);
      fetchCart();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to remove item.');
    }
  };

  // ✅ Clear entire cart handler
  const handleClearCart = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const userId = user?.id || user?.userId;
      if (!userId) return;

      await API.delete(`/cart/clear/${userId}`);
      setCartData({ items: [], totalAmount: 0 });
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to clear cart.');
    }
  };

  if (loading) return <div style={{ textAlign: 'center', marginTop: '50px' }}>Loading cart...</div>;
  if (error) return <div style={{ textAlign: 'center', marginTop: '50px', color: 'red' }}>{error}</div>;

  return (
    <div style={{ maxWidth: '700px', margin: '30px auto', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <button onClick={() => navigate('/restaurants')} style={{ padding: '6px 12px', cursor: 'pointer' }}>
          ← Back to Restaurants
        </button>

        {cartData && cartData.items && cartData.items.length > 0 && (
          <button 
            onClick={handleClearCart}
            style={{ padding: '6px 12px', background: '#ff4757', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '13px' }}
          >
            Clear Cart 🗑️
          </button>
        )}
      </div>

      <h2>Your Shopping Cart</h2>

      {!cartData || !cartData.items || cartData.items.length === 0 ? (
        <div style={{ textAlign: 'center', marginTop: '40px' }}>
          <p style={{ color: '#666' }}>Your cart is empty.</p>
          <button 
            onClick={() => navigate('/restaurants')} 
            style={{ padding: '10px 20px', background: '#2ed573', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginTop: '10px' }}
          >
            Browse Restaurants
          </button>
        </div>
      ) : (
        <div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '20px' }}>
            {cartData.items.map((item, index) => (
              <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #eee', padding: '15px', borderRadius: '6px' }}>
                <div>
                  <h4 style={{ margin: '0 0 5px' }}>{item.foodName}</h4>
                  <p style={{ margin: '0 0 8px', color: '#666', fontSize: '14px' }}>Price: ₹{item.price} each</p>
                  
                  {/* Quantity Control Buttons */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <button 
                      onClick={() => handleUpdateQuantity(item.cartId, item.quantity, -1)}
                      style={{ width: '28px', height: '28px', background: '#f1f2f6', border: '1px solid #ddd', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                      -
                    </button>
                    <span style={{ fontWeight: 'bold', minWidth: '20px', textAlign: 'center' }}>{item.quantity}</span>
                    <button 
                      onClick={() => handleUpdateQuantity(item.cartId, item.quantity, 1)}
                      style={{ width: '28px', height: '28px', background: '#f1f2f6', border: '1px solid #ddd', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                      +
                    </button>
                  </div>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                  <strong style={{ fontSize: '16px', color: '#2f3542' }}>₹{item.subTotal}</strong>
                  <button 
                    onClick={() => handleRemoveItem(item.cartId)}
                    style={{ background: 'transparent', border: 'none', color: '#ff4757', cursor: 'pointer', fontSize: '18px', fontWeight: 'bold' }}
                    title="Remove item"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div style={{ borderTop: '2px solid #ddd', paddingTop: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3>Total Amount:</h3>
            <h3 style={{ color: '#ff4757' }}>₹{cartData.totalAmount}</h3>
          </div>

          <button 
            onClick={() => alert('Proceeding to Checkout & Order Placement next!')}
            style={{ width: '100%', marginTop: '20px', padding: '12px', background: '#2ed573', color: 'white', border: 'none', borderRadius: '6px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}
          >
            Proceed to Checkout
          </button>
        </div>
      )}
    </div>
  );
}