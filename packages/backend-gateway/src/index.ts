import { createServer } from 'http';
import { gatewayApp } from './gateway';

const server = createServer(gatewayApp);
server.listen(4000, () => console.log('gateway running'));
