import redis from 'redis';
const client = redis.createClient();

export const scheduleNotification = (userId, eventId, notifyAt) => {
  const delay = new Date(notifyAt) - Date.now();
  if (delay > 0) {
    client.set(`notification:${userId}:${eventId}`, 'pending', 'PX', delay);
  }
};

client.on('ready', () => {
  client.config('SET', 'notify-keyspace-events', 'Ex');
  client.subscribe('__keyevent@0__:expired');
});

client.on('message', (channel, key) => {
  if (key.startsWith('notification:')) {
    const [_, userId, eventId] = key.split(':');
    sendPushNotification(userId, eventId);
  }
});