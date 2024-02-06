# dataloader-redis

Motivating problem is data aggregation layer caching for a schema-stitched graphql microservices backend deployed to kubernetes.

In early development, works with a test project, actual tests coming soon.

Any and all feedback welcome.

```javascript
import DataLoaderRedis from 'dataloader-redis'

// ...

const loader = new DataLoaderRedis<KeyType, ValueType>(redisConnection, async (keys : KeyType[]) => { /* ... */ }, { ttl: 60, options: { /* dataloader Options */ }})

// ... and use as you would a standard DataLoader
```