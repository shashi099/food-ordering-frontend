import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../../services/api';

export default function OrderDetails() {
  const { orderId } = useParams(); // Grabs the orderId from the URL path /orders/:orderId
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        setLoading(true);
        // Calls your backend endpoint: GET /orders/{orderId}
        const response = await API.get(`/orders/${orderId}`);
        console.log("Order Details Response:", response.data);

        const data = response.data?.data || response.data;
        setOrderDetails(data);
      } catch (err) {
        console.error('Failed to load order details:', err);
        setError('Failed to load order details.');
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      fetchOrderDetails();
    }
  }, [orderId]);

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
        <p style={{ fontSize: '18px', color: '#666' }}>Loading order details...</p>
      </div>
    );
  }

  if (error || !orderDetails) {
    return (
      <div style={{ textAlign: 'center', marginTop: '50px', fontFamily: 'sans-serif' }}>
        <p style={{ color: '#ff4757', fontSize: '16px' }}>{error || 'Order not found.'}</p>
        <button onClick={() => navigate('/orders')} style={{ marginTop: '15px', padding: '8px 16px', cursor: 'pointer' }}>
          Back to Orders
        </button>
      </div>
    );
  }

  const statusStyle = getStatusStyle(orderDetails.status);
  const formattedDate = orderDetails.createdAt ? new Date(orderDetails.createdAt).toLocaleString() : 'N/A';

  return (
    <div style={{ maxWidth: '800px', margin: '40px auto', padding: '20px', fontFamily: 'sans-serif' }}>
      {/* Navigation Back */}
      <button 
        onClick={() => navigate('/orders')} 
        style={{ padding: '6px 12px', marginBottom: '20px', cursor: 'pointer', background: '#f1f2f6', border: '1px solid #ced6e0', borderRadius: '4px', fontWeight: 'bold' }}
      >
        ← Back to My Orders
      </button>

      {/* Order Header Summary Card */}
      <div style={{ background: '#f8f9fa', border: '1px solid #dcdde1', borderRadius: '10px', padding: '20px', marginBottom: '30px', boxShadow: '0 2px 5px rgba(0,0,0,0.02)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
          <div>
            <h2 style={{ margin: '0 0 5px', color: '#2f3542' }}>{orderDetails.restaurantName}</h2>
            <p style={{ margin: '0', color: '#747d8c', fontSize: '14px' }}>Order ID: <strong>#{orderDetails.orderId}</strong></p>
          </div>
          <span style={{ fontSize: '13px', padding: '6px 12px', borderRadius: '6px', fontWeight: 'bold', ...statusStyle }}>
            {orderDetails.status || 'PLACED'}
          </span>
        </div>

        <div style={{ borderTop: '1px solid #e1e1e1', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', color: '#747d8c', fontSize: '13px' }}>
          <span>Placed on: {formattedDate}</span>
          <span>Total Items: <strong>{orderDetails.orderItemList?.length || 0}</strong></span>
        </div>
      </div>

      {/* Ordered Items Breakdown */}
      <h3 style={{ margin: '0 0 15px', color: '#2f3542' }}>Ordered Items</h3>
      {!orderDetails.orderItemList || orderDetails.orderItemList.length === 0 ? (
        <p style={{ color: '#747d8c' }}>No items found for this order.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '30px' }}>
          {orderDetails.orderItemList.map((item, index) => (
            <div 
              key={index} 
              style={{ background: 'white', border: '1px solid #e1e1e1', borderRadius: '8px', padding: '15px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.01)' }}
            >
              <div>
                <h4 style={{ margin: '0 0 5px', fontSize: '16px', color: '#2f3542' }}>{item.foodName}</h4>
                <p style={{ margin: '0', color: '#747d8c', fontSize: '13px' }}>
                  Price: ₹{item.price} × {item.quantity}
                </p>
              </div>

              <div style={{ textAlign: 'right' }}>
                <span style={{ color: '#2f3542', fontWeight: 'bold', fontSize: '16px' }}>₹{item.subTotal}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Bill Total Footer */}
      <div style={{ background: '#ffffff', border: '2px solid #2ed573', borderRadius: '10px', padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <span style={{ color: '#747d8c', fontSize: '14px' }}>Grand Total Paid</span>
          <h3 style={{ margin: '0', color: '#2f3542', fontSize: '22px' }}>₹{orderDetails.totalAmount}</h3>
        </div>
        
        <button 
          onClick={() => navigate('/restaurants')}
          style={{ padding: '10px 20px', background: '#2ed573', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          Order Again 🍕
        </button>
      </div>
    </div>
  );
}