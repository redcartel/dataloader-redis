import DataLoaderRedis from "src/";
import { createClient } from "redis";

const loader = new DataLoaderRedis(createClient(), async (keys) => {
    return keys.map(key => new Promise((res) => setTimeout(()=>res(key))));
})

// ...