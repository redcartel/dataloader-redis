# Dataloader-redis

Motivating problem is graphql federation across kubernetes pods

```javascript
import DataloaderRedis from 'dataloader-redis'

// ...

const loader = new DataLoaderRedis<KeyType, ValueType>(redisConnection, async (keys[]) => { /* ... */ }, { ttl: 60, options: { /* dataloader Options */ }})

// ... and use as you would a standard DataLoader
```