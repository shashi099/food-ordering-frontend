import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../../services/api';

export default function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await API.post('/users/login', formData);
      
      // Since backend returns { success, message, data: { id, name, email, ... } }
      const responseBody = response.data;

      if (responseBody && responseBody.data) {
        // Save the actual user object (which contains the id needed for the cart)
        localStorage.setItem('user', JSON.stringify(responseBody.data));
        
        // Navigate to restaurant list
        navigate('/restaurants');
      } else {
        setError('Login failed: No user data returned.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password.');
    }
  };

  
  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h2>Login to Food App</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required style={{ padding: '8px' }} />
        <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} required style={{ padding: '8px' }} />
        
        <button type="submit" style={{ padding: '10px', background: '#2ed573', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Login
        </button>
      </form>
      
      <p style={{ marginTop: '15px', textAlign: 'center' }}>
        Don&apos;t have an account? <Link to="/register">Register here</Link>
      </p>
    </div>
  );
}