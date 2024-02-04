# dataloader-redis

Motivating problem is graphql federation across kubernetes pods

In early development, any and all feedback welcome.

```javascript
import DataLoaderRedis from 'dataloader-redis'

// ...

const loader = new DataLoaderRedis<KeyType, ValueType>(redisConnection, async (keys[]) => { /* ... */ }, { ttl: 60, options: { /* dataloader Options */ }})

// ... and use as you would a standard DataLoader
```