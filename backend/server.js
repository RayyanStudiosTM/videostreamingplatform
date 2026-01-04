const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Backend running ✅' });
});

app.post('/api/auth/admin/login', (req, res) => {
  const { email, password } = req.body;

  if (email === 'admin@admin.com' && password === '123456') {
    return res.json({
      token: 'demo-token',
      user: { email, role: 'admin', isAdmin: true }
    });
  }

  res.status(401).json({ error: 'Invalid credentials' });
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`✅ Backend running on http://localhost:${PORT}`);
});
