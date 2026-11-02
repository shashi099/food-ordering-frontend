import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../services/api';

export default function RestaurantList() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const response = await API.get('/restaurants');
        // Extract the list from the ApiResponse wrapper (response.data.data)
        if (response.data && response.data.data) {
          setRestaurants(response.data.data);
        } else {
          setRestaurants([]);
        }
      } catch (err) {
        setError('Failed to fetch restaurants. Please check your backend.');
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurants();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/login');
  };

  if (loading) return <div style={{ textAlign: 'center', marginTop: '50px' }}>Loading restaurants...</div>;
  if (error) return <div style={{ textAlign: 'center', marginTop: '50px', color: 'red'}}> {error} </div>;

  return (
    <div style={{ maxWidth: '1000px', margin: '30px auto', padding: '20px' }}>
      {/* Top Header Row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Available Restaurants</h2>
        
        {/* Buttons Group */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <div style={{ display: 'flex', gap: '10px' }}>
        {/* ✅ My Orders Button */}
        <button 
          onClick={() => navigate('/orders')} 
          style={{ padding: '8px 14px', background: '#f1f2f6', color: '#2f3542', border: '1px solid #ced6e0', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          📦 My Orders
        </button>

        {/* Cart Button */}
        <button 
          onClick={() => navigate('/cart')} 
          style={{ padding: '8px 14px', background: '#ffa502', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          🛒 Cart
        </button>
      </div>
          
          <button 
            onClick={handleLogout} 
            style={{ padding: '8px 12px', background: '#ff4757', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            Logout
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
        {restaurants.map((restaurant) => (
          <div 
            key={restaurant.restaurantId} 
            onClick={() => navigate(`/restaurant/${restaurant.restaurantId}`)}
            style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '15px', cursor: 'pointer', background: '#fff', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}
          >
            {restaurant.restaurantImage && (
              <img src={restaurant.restaurantImage} alt={restaurant.restaurantName} style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '4px' }} />
            )}
            <h3 style={{ margin: '10px 0 5px' }}>{restaurant.restaurantName}</h3>
            <p style={{ color: '#666', fontSize: '14px', margin: '0 0 10px' }}>{restaurant.restaurantAddress}</p>
            <span style={{ background: '#2ed573', color: 'white', padding: '3px 8px', borderRadius: '4px', fontSize: '12px' }}>
              ★ {restaurant.restaurantRating || 'N/A'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}