// import redis from 'redis';
// const client = redis.createClient();

// export const scheduleNotification = (userId, eventId, notifyAt) => {
//   const delay = new Date(notifyAt) - Date.now();
//   if (delay > 0) {
//     client.set(`notification:${userId}:${eventId}`, 'pending', 'PX', delay);
//   }
// };

// client.on('ready', () => {
//   client.config('SET', 'notify-keyspace-events', 'Ex');
//   client.subscribe('__keyevent@0__:expired');
// });

// client.on('message', (channel, key) => {
//   if (key.startsWith('notification:')) {
//     const [_, userId, eventId] = key.split(':');
//     scheduleNotification(userId, eventId);
//   }
// });

import redis from 'redis';
import { query } from '../config/db.js';

const client = redis.createClient();

// Enhanced notification scheduling
export const scheduleNotification = (userId, eventId, notifyAt) => {
  const delay = new Date(notifyAt) - Date.now();
  if (delay > 0) {
    const key = `notification:${userId}:${eventId}`;
    client.set(key, 'pending', 'PX', delay, (err) => {
      if (err) console.error('Redis set error:', err);
    });
  }
};

// New function to schedule notifications for all interested users
export const scheduleEventNotifications = async (eventId, eventTime) => {
  try {
    // Find users interested in this event's categories
    const users = await query(
      `SELECT u.user_id FROM users u
       JOIN user_categories uc ON u.user_id = uc.user_id
       WHERE uc.category_id IN (
         SELECT category_id FROM event_categories WHERE event_id = $1
       )`,
      [eventId]
    );
    
    // Schedule notifications 1 hour before event
    const notifyTime = new Date(eventTime);
    notifyTime.setHours(notifyTime.getHours() - 1);
    
    users.rows.forEach(user => {
      scheduleNotification(user.user_id, eventId, notifyTime);
    });
  } catch (error) {
    console.error('Notification scheduling error:', error);
  }
};

// Redis event handlers
client.on('ready', () => {
  client.config('SET', 'notify-keyspace-events', 'Ex');
  client.subscribe('__keyevent@0__:expired');
});

client.on('message', async (channel, key) => {
  if (key.startsWith('notification:')) {
    const [_, userId, eventId] = key.split(':');
    await sendNotification(userId, eventId);
  }
});

// New function to actually send notifications
async function sendNotification(userId, eventId) {
  try {
    // Get event details
    const event = await query(
      `SELECT title, start_time FROM events WHERE event_id = $1`,
      [eventId]
    );
    
    // Get user's notification preferences
    const user = await query(
      `SELECT email, notification_preferences FROM users WHERE user_id = $1`,
      [userId]
    );
    
    // Here you would implement actual notification delivery
    // (email, push notification, etc.) based on user preferences
    console.log(`Notifying user ${userId} about event: ${event.rows[0].title}`);
    
  } catch (error) {
    console.error('Notification delivery error:', error);
  }
}