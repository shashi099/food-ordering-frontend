import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../../services/api';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    address: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      // ⚠️ Adjust endpoint if your Spring Boot controller path differs (e.g., /api/users/register)
      await API.post('/users/register', formData);
      setSuccess('Registration successful! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h2>Register for Food App</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {success && <p style={{ color: 'green' }}>{success}</p>}
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <input type="text" name="name" placeholder="Full Name" value={formData.name} onChange={handleChange} required style={{ padding: '8px' }} />
        <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required style={{ padding: '8px' }} />
        <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} required style={{ padding: '8px' }} />
        <input type="text" name="phone" placeholder="Phone Number" value={formData.phone} onChange={handleChange} required style={{ padding: '8px' }} />
         
        <button type="submit" style={{ padding: '10px', background: '#ff4757', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Register
        </button>
      </form>
      
      <p style={{ marginTop: '15px', textAlign: 'center' }}>
        Already have an account? <Link to="/login">Login here</Link>
      </p>
    </div>
  );
}