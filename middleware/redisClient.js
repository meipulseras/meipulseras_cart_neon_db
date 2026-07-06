import { createClient } from 'redis';

const redisClientInstance = createClient({
    url: process.env.REDIS_URL,
    disableOfflineQueue: true,
    socket: {
        connectTimeout: 2000,
        keepAlive: 5000,
        reconnectStrategy: (retries) => {
            if (retries >= 5) {
                return new Error('Se completó la cantidad límite de reconexiones');
            }

            return Math.min(retries * 500, 2000);
        }
    }
});

redisClientInstance.on('error', (err) => console.log('Error Cliente Redis', err));
redisClientInstance.connect().catch(console.error);

export default redisClientInstance;