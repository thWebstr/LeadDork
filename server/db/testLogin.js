import axios from 'axios';

async function testLogin() {
  try {
    const response = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'admin@leaddork.com',
      password: 'admin123'
    });
    console.log('Login successful!');
    console.log('User:', response.data.user);
    console.log('Token exists:', !!response.data.token);
  } catch (err) {
    console.error('Login failed:', err.response?.data || err.message);
  }
}

testLogin();
