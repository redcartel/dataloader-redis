import { app } from './gateway';
import { startSchemaReload } from './schema-loader';

app.listen(4000, () => console.log('gateway running'));

startSchemaReload();