import { Request, Response } from 'express';
import { UserRepository } from '../repositories/UserRepository';
import { hashPassword, comparePassword, generateToken } from '../utils/auth';

export class AuthController {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  register = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, password } = req.body;

      // Check if user already exists
      const existingUser = await this.userRepository.findByEmail(email);
      if (existingUser) {
        res.status(409).json({
          error: {
            message: 'User with this email already exists'
          }
        });
        return;
      }

      // Hash password
      const passwordHash = await hashPassword(password);

      // Create user
      const user = await this.userRepository.create({
        email,
        password_hash: passwordHash
      });

      // Generate token
      const token = generateToken(user);

      res.status(201).json({
        message: 'User registered successfully',
        data: {
          user: {
            id: user.id,
            email: user.email,
            created_at: user.created_at
          },
          token
        }
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({
        error: {
          message: 'Internal server error during registration'
        }
      });
    }
  };

  login = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, password } = req.body;

      // Find user by email
      const user = await this.userRepository.findByEmail(email);
      if (!user) {
        res.status(401).json({
          error: {
            message: 'Invalid email or password'
          }
        });
        return;
      }

      // Verify password
      const isValidPassword = await comparePassword(password, user.password_hash);
      if (!isValidPassword) {
        res.status(401).json({
          error: {
            message: 'Invalid email or password'
          }
        });
        return;
      }

      // Generate token
      const userResponse = {
        id: user.id,
        email: user.email,
        created_at: user.created_at,
        updated_at: user.updated_at
      };
      const token = generateToken(userResponse);

      res.json({
        message: 'Login successful',
        data: {
          user: {
            id: user.id,
            email: user.email,
            created_at: user.created_at
          },
          token
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        error: {
          message: 'Internal server error during login'
        }
      });
    }
  };

  me = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = (req as any).user.id;
      const user = await this.userRepository.findById(userId);

      if (!user) {
        res.status(404).json({
          error: {
            message: 'User not found'
          }
        });
        return;
      }

      res.json({
        data: {
          user: {
            id: user.id,
            email: user.email,
            created_at: user.created_at
          }
        }
      });
    } catch (error) {
      console.error('Get user error:', error);
      res.status(500).json({
        error: {
          message: 'Internal server error'
        }
      });
    }
  };
}