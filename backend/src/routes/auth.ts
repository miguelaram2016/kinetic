import { Router } from 'express';

export const authRouter = Router();

// Stub: Register
authRouter.post('/register', (req, res) => {
  const { email, name, password } = req.body;
  
  if (!email || !name || !password) {
    return res.status(400).json({ error: 'email, name, and password required' });
  }
  
  // TODO: Implement actual registration with password hashing
  res.status(201).json({
    message: 'User registered (stub)',
    user: { id: 'stub-id', email, name }
  });
});

// Stub: Login
authRouter.post('/login', (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ error: 'email and password required' });
  }
  
  // TODO: Implement actual authentication
  res.json({
    message: 'Login successful (stub)',
    token: 'stub-jwt-token',
    user: { id: 'stub-id', email }
  });
});
