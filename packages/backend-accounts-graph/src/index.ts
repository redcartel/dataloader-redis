import { usersServer } from './server';

usersServer.listen(4001, () => {
  console.log(`Accounts service running at port 4001`);
});