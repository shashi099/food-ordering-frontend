import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../../services/api';

export default function RestaurantDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Track loading or success state per menu item ID
  const [addedStatus, setAddedStatus] = useState({});

  useEffect(() => {
    const fetchRestaurantData = async () => {
      try {
        setLoading(true);
        
        // 1. Fetch restaurant info using `id` from params
        const restaurantRes = await API.get(`/restaurants/${id}`);
        if (restaurantRes.data && restaurantRes.data.data) {
          setRestaurant(restaurantRes.data.data);
        }

        // 2. Fetch menu items using `id` (fixed from restaurantId)
        const menuRes = await API.get(`/restaurants/${id}/menu`);

        console.log("Hello", menuRes);

        if (menuRes.data && menuRes.data.data) {
          setMenuItems(menuRes.data.data);
        }
      } catch (err) {
        console.error('Error fetching restaurant details:', err);
        setError('Failed to load restaurant details or menu.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchRestaurantData();
    }
  }, [id]);

  const handleAddToCart = async (menuItemId) => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const userId = user?.id || user?.userId;

      if (!userId) {
        alert('Please login first!');
        navigate('/login');
        return;
      }

      // Payload matches AddToCartRequest
      const payload = {
        userId: userId,
        menuItemId: menuItemId,
        quantity: 1
      };

      await API.post('/cart/add', payload);

      // Set success state for this specific item
      setAddedStatus(prev => ({ ...prev, [menuItemId]: 'Added ✓' }));

      // Reset button text after 2 seconds
      setTimeout(() => {
        setAddedStatus(prev => ({ ...prev, [menuItemId]: false }));
      }, 2000);

    } catch (err) {
      setAddedStatus(prev => ({ ...prev, [menuItemId]: 'Failed ❌' }));
      setTimeout(() => {
        setAddedStatus(prev => ({ ...prev, [menuItemId]: false }));
      }, 2000);
    }
  };

  if (loading) return <div style={{ textAlign: 'center', marginTop: '50px', fontFamily: 'sans-serif' }}>Loading restaurant and menu...</div>;
  if (error) return <div style={{ textAlign: 'center', marginTop: '50px', color: 'red', fontFamily: 'sans-serif' }}>{error}</div>;

  return (
    <div style={{ maxWidth: '800px', margin: '30px auto', padding: '20px', fontFamily: 'sans-serif' }}>
      {/* Top Navigation Row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <button onClick={() => navigate('/restaurants')} style={{ padding: '6px 12px', cursor: 'pointer' }}>
          ← Back to Restaurants
        </button>
        
        <button 
          onClick={() => navigate('/cart')} 
          style={{ padding: '8px 15px', background: '#ffa502', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          🛒 Go to Cart
        </button>
      </div>

      {restaurant && (
        <div style={{ marginBottom: '30px', borderBottom: '1px solid #ddd', paddingBottom: '15px' }}>
          <h1>{restaurant.restaurantName}</h1>
          <p>{restaurant.restaurantAddress}</p>
          <p>Rating: ★ {restaurant.restaurantRating || 'N/A'}</p>
        </div>
      )}

      <h2>Menu Items</h2>
      
      
      {menuItems.length === 0 ? (
        <p style={{ color: '#666' }}>No menu items available for this restaurant yet.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {menuItems.map((item) => {
            const status = addedStatus[item.menuItemId];
            const isAdded = status === 'Added ✓';
            const isFailed = status === 'Failed ❌';

            return (
              <div key={item.menuItemId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #eee', padding: '15px', borderRadius: '6px' }}>
                <div>
                  <h4 style={{ margin: '0 0 5px' }}>{item.foodName}</h4>
                  <p style={{ margin: '0 0 5px', color: '#666', fontSize: '14px' }}>{item.description || item.item_description}</p>
                  <strong style={{ color: '#ff4757' }}>₹{item.price}</strong>
                </div>
                <button 
                  onClick={() => handleAddToCart(item.menuItemId)}
                  style={{ 
                    padding: '8px 15px', 
                    background: isAdded ? '#20bf6b' : isFailed ? '#eb4d4b' : '#2ed573', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '4px', 
                    cursor: 'pointer',
                    minWidth: '110px',
                    transition: 'background 0.3s'
                  }}
                >
                  {status || 'Add To Cart'}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}