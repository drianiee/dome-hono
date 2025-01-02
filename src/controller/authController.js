import jwt from 'jsonwebtoken';
import { validateLogin } from '../validators/loginValidator';
import {
  loginUser,
  changePassword as changePasswordService,
  requestPasswordReset,
  resetPassword as resetPasswordService,
} from '../services/userService';

export const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    validateLogin({ username, password });

    const user = await loginUser(username, password);

    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        name: user.name,
        id_roles: user.id_roles,
      },
      process.env.JWT_SECRET,
      { expiresIn: '12h' }
    );

    res.status(200).json({
      message: 'Login successful',
      token,
    });
  } catch (error) {
    console.error('Error during login:', error.message);
    res.status(400).json({ error: error.message });
  }
};

export const validateToken = async (req, res) => {
  try {
    const user = req.user;

    const convertToGMT7 = (timestamp) => {
      const date = new Date(timestamp * 1000);
      return new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Asia/Jakarta',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }).format(date);
    };

    const tokenCreatedIn = convertToGMT7(user.iat);
    const tokenExpiredIn = convertToGMT7(user.exp);

    res.json({
      message: 'Token is valid',
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        token_created_in: tokenCreatedIn,
        token_expired_in: tokenExpiredIn,
      },
    });
  } catch (error) {
    console.error('Error validating token:', error);
    res.status(500).json({ error: 'Error validating token' });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { old_password, new_password } = req.body;

    if (!old_password || !new_password) {
      return res.status(400).json({ error: 'Old password and new password are required' });
    }

    if (new_password.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters long' });
    }

    const userId = req.user.id;

    const response = await changePasswordService(userId, old_password, new_password);

    res.status(200).json(response);
  } catch (error) {
    console.error('Error during password change:', error.message);
    res.status(400).json({ error: error.message });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { username } = req.body;
    await requestPasswordReset(username);
    res.json({ message: 'Password reset email sent' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const resetPasswordForm = (req, res) => {
  const { token } = req.params;
  const { username } = req.query;

  if (!username) {
    return res.status(400).send('Username is required');
  }

  res.send(`
    <form action="/reset/${token}" method="POST">
        <input type="hidden" name="token" value="${token}" />
        <input type="hidden" name="username" value="${username}" />
        <label for="newPassword">New Password:</label>
        <input type="password" name="newPassword" required />
        <button type="submit">Reset Password</button>
    </form>
  `);
};

export const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { newPassword, username } = req.body;

  try {
    if (!token || !newPassword || !username) {
      return res.status(400).json({ error: 'Token, username, and new password are required' });
    }

    await resetPasswordService(token, newPassword, username);
    res.status(200).send('Congratulations! Your password has been successfully reset.');
  } catch (error) {
    res.status(400).send(error.message);
  }
};
