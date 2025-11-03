import { createClient } from 'redis';

const redisClientInstance = createClient({
    url: process.env.REDIS_URL,
    socket: {
        reconnectStrategy: (retries) => {
            if(retries >= 10) {
                return new Error('Se completó la cantidad límite de reconexiones');
            }

            return Math.min(retries * 100, 5000);
        }
    }
});

redisClientInstance.on('error', (err) => console.log('Error Cliente Redis', err));
redisClientInstance.connect().catch(console.error);

export default redisClientInstance;