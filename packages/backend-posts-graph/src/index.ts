import { usersServer } from "./server";

usersServer.listen(4002, () => {
  console.log(`Posts service running at port 4002`);
});
