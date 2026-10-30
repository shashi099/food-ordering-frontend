import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../services/api';

export default function AdminRestaurantList() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // State for toggling form and tracking if we are editing
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null); // Holds ID if editing, null if creating
  
  const [formData, setFormData] = useState({
    restaurantName: '',
    restaurantAddress: '',
    restaurantImage: '',
    restaurantRating: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const navigate = useNavigate();

  const fetchRestaurants = async () => {
    try {
      setLoading(true);
      const response = await API.get('/restaurants');
      const restaurantList = response.data?.data || response.data || [];
      setRestaurants(restaurantList);
    } catch (err) {
      console.error('Failed to load restaurants:', err);
      setError('Failed to load restaurants from server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle Create (POST) or Update (PUT) Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const payload = {
        restaurantName: formData.restaurantName,
        restaurantAddress: formData.restaurantAddress,
        restaurantImage: formData.restaurantImage || '',
        rating: formData.restaurantRating ? parseFloat(formData.restaurantRating) : 0.0
      };

      if (editingId) {
        // ✅ PUT: Update existing restaurant
        await API.put(`/restaurants/${editingId}`, payload);
        alert('Restaurant Details Updated Successfully!');
      } else {
        // ✅ POST: Register new restaurant
        await API.post('/restaurants', payload);
        alert('Restaurant Added Successfully!');
      }
      
      // Reset form, close it, and refresh list
      resetForm();
      fetchRestaurants();
    } catch (err) {
      console.error('Submission failed:', err.response || err);
      alert(err.response?.data?.message || 'Operation failed.');
    } finally {
      setSubmitting(false);
    }
  };

  // ✅ Trigger Edit Mode
  const handleEditClick = (restaurant) => {
    const id = restaurant.restaurantId || restaurant.id;
    setEditingId(id);
    setFormData({
      restaurantName: restaurant.restaurantName || restaurant.restaurantName || '',
      restaurantAddress: restaurant.restaurantAddress || '',
      restaurantImage: restaurant.restaurantImage || '',
      restaurantRating: restaurant.restaurantRating !== undefined ? restaurant.restaurantRating : ''
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Reset form helper
  const resetForm = () => {
    setFormData({ restaurantName: '', restaurantAddress: '', restaurantImage: '', restaurantRating: '' });
    setEditingId(null);
    setShowForm(false);
  };

  // Handle Delete Restaurant
  const handleDelete = async (restaurant) => {
    const id = restaurant.restaurantId || restaurant.id;
    if (!id) {
      alert('Error: Restaurant ID is missing!');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this restaurant?')) {
      return;
    }

    try {
      await API.delete(`/restaurants/${id}`);
      alert('Restaurant Deleted Successfully!');
      fetchRestaurants();
    } catch (err) {
      console.error('Failed to delete restaurant:', err.response || err);
      alert(err.response?.data?.message || 'Failed to delete restaurant.');
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', fontFamily: 'sans-serif' }}>
        <p style={{ fontSize: '18px', color: '#666' }}>Loading restaurants...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '900px', margin: '40px auto', padding: '20px', fontFamily: 'sans-serif' }}>
      {/* Navbar / Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', borderBottom: '2px solid #f1f2f6', paddingBottom: '15px' }}>
        <div>
          <h2 style={{ margin: '0 0 5px', color: '#2f3542' }}>🛠️ Admin Dashboard</h2>
          <p style={{ margin: '0', color: '#747d8c', fontSize: '14px' }}>Manage all registered restaurants</p>
        </div>
        
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={() => { if (showForm) resetForm(); else setShowForm(true); }} 
            style={{ padding: '9px 16px', background: showForm ? '#a4b0be' : '#2ed573', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            {showForm ? '✕ Cancel' : '+ Add Restaurant'}
          </button>

          <button 
            onClick={() => navigate('/restaurants')} 
            style={{ padding: '9px 14px', background: '#f1f2f6', color: '#2f3542', border: '1px solid #ced6e0', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            Customer View 🍔
          </button>
        </div>
      </div>

      {/* Add / Edit Form Section */}
      {showForm && (
        <div style={{ background: '#f8f9fa', border: '1px solid #dcdde1', padding: '20px', borderRadius: '8px', marginBottom: '30px', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
          <h3 style={{ margin: '0 0 15px', color: '#2f3542' }}>
            {editingId ? `✏️ Edit Restaurant (ID: ${editingId})` : '➕ Register New Restaurant'}
          </h3>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '13px', color: '#57606f' }}>Restaurant restaurantName:</label>
              <input 
                type="text" 
                name="restaurantName" 
                placeholder="e.g. New Coffee Shop" 
                value={formData.restaurantName} 
                onChange={handleInputChange} 
                required 
                style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ced6e0', boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '13px', color: '#57606f' }}>Address:</label>
              <input 
                type="text" 
                name="restaurantAddress" 
                placeholder="e.g. High Tech City Hyderabad" 
                value={formData.restaurantAddress} 
                onChange={handleInputChange} 
                required 
                style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ced6e0', boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '13px', color: '#57606f' }}>Image URL (Optional):</label>
              <input 
                type="text" 
                name="restaurantImage" 
                placeholder="Paste Image URL" 
                value={formData.restaurantImage} 
                onChange={handleInputChange} 
                style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ced6e0', boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '13px', color: '#57606f' }}>Rating:</label>
              <input 
                type="number" 
                step="0.1" 
                max="5" 
                min="0"
                name="restaurantRating" 
                placeholder="e.g. 4.4" 
                value={formData.restaurantRating} 
                onChange={handleInputChange} 
                style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ced6e0', boxSizing: 'border-box' }}
              />
            </div>

            <button 
              type="submit" 
              disabled={submitting}
              style={{ marginTop: '5px', padding: '11px', background: editingId ? '#1e90ff' : '#2ed573', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}
            >
              {submitting ? 'Saving...' : editingId ? 'Update Restaurant Details' : 'Submit Restaurant'}
            </button>
          </form>
        </div>
      )}

      {error && <p style={{ color: '#ff4757', textAlign: 'center' }}>{error}</p>}

      {/* Restaurant Cards Grid */}
      {restaurants.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '50px', background: '#f8f9fa', borderRadius: '8px', border: '1px dashed #ced6e0' }}>
          <p style={{ color: '#747d8c', fontSize: '16px', margin: '0' }}>No restaurants found in the database.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
          {restaurants.map((r) => {
            const rId = r.restaurantId || r.id;
            return (

              

              <div 
                key={rId} 
                style={{ 
                  background: '#ffffff', 
                  border: '1px solid #e1e1e1', 
                  borderRadius: '10px', 
                  padding: '20px', 
                  boxShadow: '0 4px 6px rgba(0,0,0,0.02)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}
              >
                <div 
                  onClick={() => navigate(`/admin/restaurant/${rId}`)}
                  style={{ cursor: 'pointer' }}
                >
                  {r.restaurantImage && (
                    <img 
                      src={r.restaurantImage} 
                      alt={r.restaurantName} 
                      style={{ width: '100%', height: '140px', objectFit: 'cover', borderRadius: '6px', marginBottom: '12px' }} 
                    />
                  )}
                  <h3 style={{ margin: '0 0 8px', color: '#2f3542', fontSize: '18px', textDecoration: 'underline' }}>{r.restaurantName}</h3>
                  <p style={{ margin: '0 0 12px', color: '#747d8c', fontSize: '13px', lineHeight: '1.4' }}>{r.restaurantAddress}</p>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f2f6', paddingTop: '12px', marginTop: '10px', marginBottom: '12px' }}>
                    <span style={{ fontSize: '14px', color: '#ffa502', fontWeight: 'bold' }}>
                      ★ {r.restaurantRating !== undefined && r.restaurantRating !== null ? r.restaurantRating : 'N/A'}
                    </span>
                    
                    <span style={{ fontSize: '12px', background: '#e1ffed', color: '#2ed573', padding: '4px 8px', borderRadius: '4px', fontWeight: 'bold' }}>
                      Active
                    </span>
                  </div>

                  {/* Action Buttons: Edit & Delete */}
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button 
                      onClick={() => handleEditClick(r)}
                      style={{ flex: 1, padding: '8px', background: '#1e90ff', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}
                    >
                      Edit ✏️
                    </button>
                    <button 
                      onClick={() => handleDelete(r)}
                      style={{ flex: 1, padding: '8px', background: '#ff4757', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}
                    >
                      Delete 🗑️
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}