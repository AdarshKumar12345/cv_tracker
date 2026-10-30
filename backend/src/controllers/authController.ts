import { Request, Response } from 'express';
import { User } from '../models/User';
import { AuthenticatedRequest } from '../types';
import { generateTokens, verifyRefreshToken } from '../utils/jwt';

const isProd = process.env.NODE_ENV === 'production';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: isProd,
  sameSite: isProd ? ('none' as const) : ('lax' as const),
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, targetRole } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(409).json({
        success: false,
        message: 'An account with this email address already exists.',
      });
      return;
    }

    const user = await User.create({
      name,
      email,
      password,
      targetRole: targetRole || '',
    });

    const payload = {
      userId: user._id.toString(),
      email: user.email,
      name: user.name,
    };

    const { accessToken, refreshToken } = generateTokens(payload);

    res.cookie('refreshToken', refreshToken, COOKIE_OPTIONS);

    res.status(201).json({
      success: true,
      message: 'Account registered successfully',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          targetRole: user.targetRole,
          bio: user.bio,
          themePreference: user.themePreference,
        },
        accessToken,
        refreshToken,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
      return;
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
      return;
    }

    const payload = {
      userId: user._id.toString(),
      email: user.email,
      name: user.name,
    };

    const { accessToken, refreshToken } = generateTokens(payload);

    res.cookie('refreshToken', refreshToken, COOKIE_OPTIONS);

    res.json({
      success: true,
      message: 'Logged in successfully',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          targetRole: user.targetRole,
          bio: user.bio,
          themePreference: user.themePreference,
        },
        accessToken,
        refreshToken,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const logout = async (_req: Request, res: Response): Promise<void> => {
  res.clearCookie('refreshToken', COOKIE_OPTIONS);
  res.json({ success: true, message: 'Logged out successfully' });
};

export const refreshToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const token =
      req.cookies?.refreshToken ||
      req.body?.refreshToken ||
      (req.headers['x-refresh-token'] as string);

    if (!token) {
      res.status(401).json({ success: false, message: 'No refresh token provided' });
      return;
    }

    const decoded = verifyRefreshToken(token);
    const user = await User.findById(decoded.userId);
    if (!user) {
      res.status(401).json({ success: false, message: 'User not found' });
      return;
    }

    const payload = {
      userId: user._id.toString(),
      email: user.email,
      name: user.name,
    };

    const { accessToken, refreshToken: newRefreshToken } = generateTokens(payload);
    res.cookie('refreshToken', newRefreshToken, COOKIE_OPTIONS);

    res.json({
      success: true,
      data: {
        accessToken,
        refreshToken: newRefreshToken,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          targetRole: user.targetRole,
          bio: user.bio,
          themePreference: user.themePreference,
        },
      },
    });
  } catch (err) {
    res.status(401).json({ success: false, message: 'Invalid refresh token' });
  }
};

export const getMe = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user?.userId);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    res.json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        targetRole: user.targetRole,
        bio: user.bio,
        themePreference: user.themePreference,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateProfile = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const user = await User.findById(req.user?.userId).select('+password');
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    const { name, targetRole, bio, themePreference, currentPassword, newPassword } =
      req.body;

    if (name) user.name = name;
    if (targetRole !== undefined) user.targetRole = targetRole;
    if (bio !== undefined) user.bio = bio;
    if (themePreference) user.themePreference = themePreference;

    if (newPassword) {
      if (!currentPassword) {
        res.status(400).json({
          success: false,
          message: 'Current password is required to set a new password',
        });
        return;
      }
      const isMatch = await user.comparePassword(currentPassword);
      if (!isMatch) {
        res.status(400).json({
          success: false,
          message: 'Current password does not match',
        });
        return;
      }
      user.password = newPassword;
    }

    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        targetRole: user.targetRole,
        bio: user.bio,
        themePreference: user.themePreference,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};
