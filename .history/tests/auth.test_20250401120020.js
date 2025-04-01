const request = require('supertest');
const app = require('../app');
const db = require('../config/db');

describe('Auth Controller', () => {
  beforeEach(async () => {
    await db.query('DELETE FROM users');
  });

  test('Register new user', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      });
    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty('userId');
  });
});