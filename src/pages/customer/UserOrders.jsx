import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../services/api';

export default function UserOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserOrders = async () => {
      try {
        setLoading(true);
        const user = JSON.parse(localStorage.getItem('user'));
        const userId = user?.id || user?.userId;

        if (!userId) {
          alert('Please login first!');
          navigate('/login');
          return;
        }

        // Calls your backend endpoint: GET /orders/user/{userId}
        const response = await API.get(`/orders/user/${userId}`);
        console.log("User Orders Response:", response.data);

        // Safely extract the list of orders from your ApiResponse wrapper
        const orderList = response.data?.data || response.data || [];
        setOrders(orderList);
      } catch (err) {
        console.error('Failed to load orders:', err);
        setError('Failed to load your order history.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserOrders();
  }, [navigate]);

  // Helper function to color-code order status badges
  const getStatusStyle = (status) => {
    switch (status?.toUpperCase()) {
      case 'DELIVERED':
      case 'COMPLETED':
        return { background: '#e1ffed', color: '#2ed573' };
      case 'PENDING':
      case 'PLACED':
        return { background: '#fff9e6', color: '#ffa502' };
      case 'CANCELLED':
        return { background: '#ffebee', color: '#ff4757' };
      default:
        return { background: '#f1f2f6', color: '#747d8c' };
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', fontFamily: 'sans-serif' }}>
        <p style={{ fontSize: '18px', color: '#666' }}>Loading your orders...</p>
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
      {/* Top Header & Navigation Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', borderBottom: '2px solid #f1f2f6', paddingBottom: '15px' }}>
        <div>
          <h2 style={{ margin: '0 0 5px', color: '#2f3542' }}>📦 My Order History</h2>
          <p style={{ margin: '0', color: '#747d8c', fontSize: '14px' }}>Track your current and past food orders</p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={() => navigate('/cart')} 
            style={{ padding: '8px 14px', background: '#f1f2f6', color: '#2f3542', border: '1px solid #ced6e0', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            🛒 Cart
          </button>
          <button 
            onClick={() => navigate('/restaurants')} 
            style={{ padding: '8px 14px', background: '#1e90ff', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            Explore 🍔
          </button>
        </div>
      </div>

      {/* Orders List / Empty State */}
      {orders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', background: '#f8f9fa', borderRadius: '8px', border: '1px dashed #ced6e0' }}>
          <p style={{ color: '#747d8c', fontSize: '16px', marginBottom: '15px' }}>You haven't placed any orders yet.</p>
          <button 
            onClick={() => navigate('/restaurants')}
            style={{ padding: '10px 20px', background: '#2ed573', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            Order Something Delicious 🍕
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {orders.map((order) => {
            const statusStyle = getStatusStyle(order.status);
            const formattedDate = order.createdAt ? new Date(order.createdAt).toLocaleString() : 'Recent';

            return (
              <div 
                key={order.orderId} 
                onClick={() => navigate(`/orders/${order.orderId}`)} // ✅ Navigates to details page
                style={{ 
                  background: 'white', 
                  border: '1px solid #e1e1e1', 
                  borderRadius: '10px', 
                  padding: '20px', 
                  boxShadow: '0 2px 5px rgba(0,0,0,0.02)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >              
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                    <h3 style={{ margin: '0', color: '#2f3542', fontSize: '18px' }}>{order.restaurantName}</h3>
                    <span style={{ fontSize: '12px', padding: '4px 10px', borderRadius: '6px', fontWeight: 'bold', ...statusStyle }}>
                      {order.status || 'PLACED'}
                    </span>
                  </div>

                  <p style={{ margin: '0 0 5px', color: '#747d8c', fontSize: '13px' }}>
                    Order ID: <strong>#{order.orderId}</strong>
                  </p>
                  <p style={{ margin: '0', color: '#a4b0be', fontSize: '12px' }}>
                    Placed on: {formattedDate}
                  </p>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <p style={{ margin: '0 0 5px', color: '#747d8c', fontSize: '13px' }}>Total Amount</p>
                  <span style={{ color: '#ff4757', fontWeight: 'bold', fontSize: '20px' }}>₹{order.totalAmount}</span>
                </div>
              </div>
              
            );
          })}
        </div>
      )}
    </div>
  );
}