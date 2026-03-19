'use strict';

/**
 * jwtHelper.js
 *
 * Mint signed JWTs for test users without touching the database.
 * The TEST_SECRET must match what the app factory sets in JWT_SECRET.
 */

const jwt = require('jsonwebtoken');

const TEST_SECRET = 'test-secret-do-not-use-in-prod';
const EXPIRES     = '1h';

/**
 * @param {object} payload  - { id, email, role, name }
 * @returns {string} signed JWT
 */
function mintToken(payload) {
    return jwt.sign(payload, TEST_SECRET, { expiresIn: EXPIRES });
}

const ADMIN_TOKEN = mintToken({ id: 'admin-id-1', email: 'admin@test.law', role: 'admin',   name: 'Admin User'  });
const USER_TOKEN  = mintToken({ id: 'user-id-1',  email: 'user@test.law',  role: 'user',    name: 'Regular User' });
// An "Admin" (capital A) token – will be denied when RBAC_STRICT_ADMIN=true
const OLD_ADMIN_TOKEN = mintToken({ id: 'old-admin-id', email: 'oldadmin@test.law', role: 'Admin', name: 'Old Admin' });

module.exports = { mintToken, ADMIN_TOKEN, USER_TOKEN, OLD_ADMIN_TOKEN, TEST_SECRET };
