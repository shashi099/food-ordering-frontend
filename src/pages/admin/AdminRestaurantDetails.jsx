import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../../services/api';

export default function AdminRestaurantDetails() {
  const { id } = useParams(); // Restaurant ID from URL
  const [restaurant, setRestaurant] = useState(null);
  const [menuItems, setMenuItems] = useState([]); // ✅ Added separate state for menu items list
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Form state for adding a new menu item to this restaurant
  const [showMenuForm, setShowMenuForm] = useState(false);
  const [menuFormData, setMenuFormData] = useState({
    foodName: '',
    price: '',
    description: '',
    foodImage: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const navigate = useNavigate();

  const fetchRestaurantDetails = async () => {
    try {
      setLoading(true);

      // 1. Fetch restaurant info
      const restaurantRes = await API.get(`/restaurants/${id}`);
      setRestaurant(restaurantRes.data?.data || restaurantRes.data);

      // 2. ✅ Fetch menu items using your explicit backend endpoint
      const menuRes = await API.get(`/restaurants/${id}/menu`);
      setMenuItems(menuRes.data?.data || menuRes.data || []);

      // console.log("Hello Shashi", menuRes.data);
      

    } catch (err) {
      console.error('Failed to fetch restaurant details or menu:', err);
      setError('Failed to load restaurant details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchRestaurantDetails();
    }
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setMenuFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handler to add a new menu item for this restaurant
  const handleAddMenuItem = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const payload = {
        restaurantId: id,
        foodName: menuFormData.foodName,
        price: parseFloat(menuFormData.price),
        description: menuFormData.description,
        foodImage: menuFormData.foodImage
      };

      await API.post(`/restaurants/${id}/menu`, payload);
      alert('Menu Item Added Successfully!');
      
      // Reset form, close it, and refresh data
      setMenuFormData({ foodName: '', price: '', description: '', foodImage: '' });
      setShowMenuForm(false);
      fetchRestaurantDetails();
    } catch (err) {
      console.error('Failed to add menu item:', err.response || err);
      alert(err.response?.data?.message || 'Failed to add menu item.');
    } finally {
      setSubmitting(false);
    }
  };

  // Handler to delete a menu item using your new REST structure
  const handleDeleteMenuItem = async (menuItemId) => {
    if (!window.confirm('Are you sure you want to delete this menu item?')) return;

    try {
      // ✅ Matches backend endpoint: @DeleteMapping("restaurants/{restaurantId}/{menuItemId}")
      await API.delete(`/restaurants/${id}/${menuItemId}`);
      
      alert('Menu Item Deleted Successfully!');
      fetchRestaurantDetails(); // Refresh the menu list
    } catch (err) {
      console.error('Failed to delete menu item:', err.response || err);
      alert(err.response?.data?.message || 'Failed to delete menu item.');
    }
  };

  if (loading) return <div style={{ textAlign: 'center', marginTop: '50px' }}>Loading admin restaurant view...</div>;
  if (error) return <div style={{ textAlign: 'center', marginTop: '50px', color: 'red' }}>{error}</div>;
  if (!restaurant) return <div style={{ textAlign: 'center', marginTop: '50px' }}>Restaurant not found.</div>;

  return (
    <div style={{ maxWidth: '900px', margin: '30px auto', padding: '20px', fontFamily: 'sans-serif' }}>
      <button 
        onClick={() => navigate('/admin/restaurants')} 
        style={{ padding: '6px 12px', marginBottom: '20px', cursor: 'pointer', background: '#f1f2f6', border: '1px solid #ccc', borderRadius: '4px' }}
      >
        ← Back to Admin Restaurants
      </button>

      {/* Restaurant Header */}
      <div style={{ background: '#f8f9fa', padding: '20px', borderRadius: '8px', border: '1px solid #ddd', marginBottom: '30px' }}>
        {restaurant.restaurantImage && (
          <img 
            src={restaurant.restaurantImage} 
            alt={restaurant.restaurantName} 
            style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '6px', marginBottom: '15px' }} 
          />
        )}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ margin: '0 0 5px', color: '#2f3542' }}>{restaurant.restaurantName}</h1>
            <p style={{ margin: '0 0 5px', color: '#666', fontSize: '14px' }}>{restaurant.restaurantAddress}</p>
            <span style={{ fontSize: '13px', color: '#ffa502', fontWeight: 'bold' }}>
              ★ {restaurant.restaurantRating !== undefined ? restaurant.restaurantRating : 'N/A'}
            </span>
          </div>

          <button 
            onClick={() => setShowMenuForm(!showMenuForm)}
            style={{ padding: '10px 16px', background: '#2ed573', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            {showMenuForm ? '✕ Cancel' : '+ Add Menu Item'}
          </button>
        </div>
      </div>

      {/* Add Menu Item Form Toggle */}
      {showMenuForm && (
        <div style={{ background: '#fff', border: '1px solid #dcdde1', padding: '20px', borderRadius: '8px', marginBottom: '30px', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
          <h3 style={{ margin: '0 0 15px', color: '#2f3542' }}>Add New Dish to Menu</h3>
          <form onSubmit={handleAddMenuItem} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <input 
              type="text" 
              name="foodName" 
              placeholder="Food Name (e.g. Chicken Biryani)" 
              value={menuFormData.foodName} 
              onChange={handleInputChange} 
              required 
              style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
            />
            <input 
              type="number" 
              step="1" 
              name="price" 
              placeholder="Price in ₹ (e.g. 250)" 
              value={menuFormData.price} 
              onChange={handleInputChange} 
              required 
              style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
            />
            <input 
              type="text" 
              name="description" 
              placeholder="Description (Optional)" 
              value={menuFormData.description} 
              onChange={handleInputChange} 
              style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
            />
            <input 
              type="text" 
              name="foodImage" 
              placeholder="Food Image URL (Optional)" 
              value={menuFormData.foodImage} 
              onChange={handleInputChange} 
              style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
            />
            <button 
              type="submit" 
              disabled={submitting}
              style={{ padding: '10px', background: '#1e90ff', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}
            >
              {submitting ? 'Saving Dish...' : 'Save Menu Item'}
            </button>
          </form>
        </div>
      )}

      {/* Menu Management Section */}
      <h2>Restaurant Menu Management</h2>
      {menuItems.length === 0 ? (
        <p style={{ color: '#666' }}>No menu items found for this restaurant. Add one above!</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {menuItems.map((item, index) => {
            const menuItemId = item.menuItemId || item.id;
            
            return (
              <div 
                key={menuItemId || index} 
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #eee', padding: '15px', borderRadius: '6px', background: 'white' }}
              >
                <div>
                  <h4 style={{ margin: '0 0 5px', fontSize: '16px' }}>{item.foodName || item.name}</h4>
                  <p style={{ margin: '0 0 3px', color: '#666', fontSize: '13px' }}>{item.description}</p>
                  <span style={{ color: '#ff4757', fontWeight: 'bold' }}>₹{item.price}</span>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button 
                    onClick={() => handleDeleteMenuItem(menuItemId)}
                    style={{ padding: '6px 12px', background: '#ff4757', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
                  >
                    Delete Dish 🗑️
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}