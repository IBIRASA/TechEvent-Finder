import { query } from '../../config/db.js';
import { faker } from '@faker-js/faker';

export const seedDatabase = async (userCount = 10, eventsPerUser = 3) => {
  // Clear existing data
  await query('TRUNCATE users, events, user_categories, event_categories RESTART IDENTITY CASCADE');

  // Seed users
  for (let i = 0; i < userCount; i++) {
    const [user] = await query(
      `INSERT INTO users (username, email, password_hash) 
       VALUES ($1, $2, $3) RETURNING id`,
      [
        faker.internet.userName(),
        faker.internet.email(),
        '$2a$10$fakehashedpassword' // In real app, use bcrypt
      ]
    );

    // Seed events for each user
    for (let j = 0; j < eventsPerUser; j++) {
      await query(
        `INSERT INTO events (title, description, location, creator_id)
         VALUES ($1, $2, ST_SetSRID(ST_MakePoint($3, $4), 4326), $5)`,
        [
          faker.lorem.words(3),
          faker.lorem.paragraph(),
          faker.location.longitude(),
          faker.location.latitude(),
          user.id
        ]
      );
    }
  }
};