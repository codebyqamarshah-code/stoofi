import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { connectDB } from '@/lib/db';
import { User } from '@/lib/models';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretjwtkey_eskooly_2026';

/**
 * Validates request authorization token and verifies permissions.
 * @param {Request} req
 * @param {Object} options
 * @param {boolean} [options.requireCanDelete=false] - Enforces delete prohibition for restricted accounts
 * @param {string[]} [options.allowedRoles] - If provided, restricts access to listed roles
 * @returns {Promise<{ user: Object, error: null } | { user: null, error: NextResponse }>}
 */
export async function authenticateRequest(req, options = {}) {
  try {
    await connectDB();

    // 1. Extract Bearer token from header or cookie
    let token = null;
    const authHeader = req.headers.get('authorization') || req.headers.get('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }

    if (!token && req.cookies && typeof req.cookies.get === 'function') {
      token = req.cookies.get('token')?.value;
    }

    if (!token || token === 'null' || token === 'undefined' || token.startsWith('mock_')) {
      return {
        user: null,
        error: NextResponse.json(
          { success: false, message: 'Authentication required. No valid session or token provided.' },
          { status: 401 }
        )
      };
    }

    // 2. Verify JWT signature
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (jwtErr) {
      return {
        user: null,
        error: NextResponse.json(
          { success: false, message: 'Session expired or invalid token. Please log in again.' },
          { status: 401 }
        )
      };
    }

    // 3. Retrieve user record
    const user = await User.findById(decoded.id).select('-password').lean();
    if (!user) {
      return {
        user: null,
        error: NextResponse.json(
          { success: false, message: 'Authorized user account no longer exists.' },
          { status: 401 }
        )
      };
    }

    const email = String(user.email || '').toLowerCase().trim();
    const canDelete = email !== 'pakroyalcollege@gmail.com' && user.canDelete !== false;

    // 4. Role authorization check
    if (Array.isArray(options.allowedRoles) && options.allowedRoles.length > 0) {
      const userRole = user.role || 'Student';
      if (!options.allowedRoles.includes(userRole)) {
        return {
          user: null,
          error: NextResponse.json(
            { success: false, message: `Access denied. Role '${userRole}' is not authorized for this action.` },
            { status: 403 }
          )
        };
      }
    }

    // 5. Deletion restriction check
    if (options.requireCanDelete && !canDelete) {
      return {
        user: null,
        error: NextResponse.json(
          { success: false, message: 'Delete action is restricted for this administrative account (Add & Edit only).' },
          { status: 403 }
        )
      };
    }

    return { user: { ...user, canDelete }, error: null };
  } catch (err) {
    console.error('authenticateRequest error:', err);
    return {
      user: null,
      error: NextResponse.json(
        { success: false, message: 'Internal authentication error: ' + (err.message || 'Unknown') },
        { status: 500 }
      )
    };
  }
}
