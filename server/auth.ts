import express from 'express';
import { storage } from './storage';
import bcrypt from 'bcryptjs';
import { insertUserSchema } from '@shared/schema';

const router = express.Router();

// Регистрация
router.post('/register', async (req, res) => {
  try {
    const { username, password } = insertUserSchema.parse(req.body);
    
    // Проверяем, существует ли пользователь
    const existingUser = await storage.getUserByUsername(username);
    if (existingUser) {
      return res.status(400).json({ message: 'Пользователь уже существует' });
    }

    // Создаём пользователя
    const user = await storage.createUser({
      username,
      password: password,
      tokensUsed: 0,        // ← добавь
      tokensLimit: 1000000,    // ← добавь
      plan: 'free' as const // ← добавь
    });

    // Создаём сессию
    req.session.userId = user.id;
    
    res.json({ 
      user: { 
        id: user.id, 
        username: user.username, 
        role: user.role,
        tokensUsed: user.tokensUsed,        // ← исправлено
        tokensLimit: user.tokensLimit,      // ← исправлено
        plan: user.plan
      } 
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(400).json({ message: 'Ошибка регистрации' });
  }
});

// Вход
router.post('/login', async (req, res) => {
  try {
    const { username, password } = insertUserSchema.parse(req.body);
    
    const user = await storage.getUserByUsername(username);
    if (!user) {
      return res.status(401).json({ message: 'Неверное имя пользователя или пароль' });
    }

    // Проверяем пароль
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Неверное имя пользователя или пароль' });
    }

    // Создаём сессию
    req.session.userId = user.id;
    
    res.json({ 
      user: { 
        id: user.id, 
        username: user.username, 
        role: user.role,
        tokensUsed: user.tokensUsed,        // ← исправлено
        tokensLimit: user.tokensLimit,      // ← исправлено
        plan: user.plan
      } 
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(400).json({ message: 'Ошибка входа' });
  }
});

// Выход
router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: 'Ошибка выхода' });
    }
    res.clearCookie('connect.sid');
    res.json({ message: 'Выход выполнен' });
  });
});

// Получение текущего пользователя
router.get('/me', async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: 'Не авторизован' });
  }

  const user = await storage.getUser(req.session.userId);
  if (!user) {
    return res.status(404).json({ message: 'Пользователь не найден' });
  }

  res.json({ 
    user: { 
      id: user.id, 
      username: user.username, 
      role: user.role,
      tokensUsed: user.tokensUsed,          // ← исправлено
      tokensLimit: user.tokensLimit,        // ← исправлено
      plan: user.plan,
      lastActivity: user.lastActivity       // ← можно добавить для отображения в UI
    } 
  });
});

export { router as authRouter };










// // server/auth.ts
// import express from 'express';
// import { storage } from './storage';
// import bcrypt from 'bcryptjs';
// import { insertUserSchema } from '@shared/schema';

// const router = express.Router();

// // Регистрация
// router.post('/register', async (req, res) => {
//   try {
//     const { username, password } = insertUserSchema.parse(req.body);
    
//     // Проверяем, существует ли пользователь
//     const existingUser = await storage.getUserByUsername(username);
//     if (existingUser) {
//       return res.status(400).json({ message: 'Пользователь уже существует' });
//     }

//     // Создаём пользователя
//     const user = await storage.createUser({
//       username,
//       password: password, // Пароль автоматически хешируется в storage
//     });

//     // Создаём сессию
//     req.session.userId = user.id;
    
//     res.json({ 
//       user: { 
//         id: user.id, 
//         username: user.username, 
//         role: user.role,
//         tokens: user.tokens,
//         plan: user.plan
//       } 
//     });
//   } catch (error) {
//     console.error('Registration error:', error);
//     res.status(400).json({ message: 'Ошибка регистрации' });
//   }
// });

// // Вход
// router.post('/login', async (req, res) => {
//   try {
//     const { username, password } = insertUserSchema.parse(req.body);
    
//     const user = await storage.getUserByUsername(username);
//     if (!user) {
//       return res.status(401).json({ message: 'Неверное имя пользователя или пароль' });
//     }

//     // Проверяем пароль
//     const isValidPassword = await bcrypt.compare(password, user.password);
//     if (!isValidPassword) {
//       return res.status(401).json({ message: 'Неверное имя пользователя или пароль' });
//     }

//     // Создаём сессию
//     req.session.userId = user.id;
    
//     res.json({ 
//       user: { 
//         id: user.id, 
//         username: user.username, 
//         role: user.role,
//         tokens: user.tokens,
//         plan: user.plan
//       } 
//     });
//   } catch (error) {
//     console.error('Login error:', error);
//     res.status(400).json({ message: 'Ошибка входа' });
//   }
// });

// // Выход
// router.post('/logout', (req, res) => {
//   req.session.destroy((err) => {
//     if (err) {
//       return res.status(500).json({ message: 'Ошибка выхода' });
//     }
//     res.clearCookie('connect.sid');
//     res.json({ message: 'Выход выполнен' });
//   });
// });

// // Получение текущего пользователя
// router.get('/me', async (req, res) => {
//   if (!req.session.userId) {
//     return res.status(401).json({ message: 'Не авторизован' });
//   }

//   const user = await storage.getUser(req.session.userId);
//   if (!user) {
//     return res.status(404).json({ message: 'Пользователь не найден' });
//   }

//   res.json({ 
//     user: { 
//       id: user.id, 
//       username: user.username, 
//       role: user.role,
//       tokens: user.tokens,
//       plan: user.plan
//     } 
//   });
// });

// export { router as authRouter };