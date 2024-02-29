import createPrismaMock from "prisma-mock";
import { PrismaClient } from "../prisma-connection";
import { Prisma } from "../generated/prismaClient";

export function genPrismaMock() {
  return createPrismaMock(
    {
      account: [
        {
          id: "00000000-0000-0000-0000-000000000000",
          email: "example@example.com",
          username: "example",
          bio: "bio",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: "00000000-0000-0000-0000-000000000001",
          email: "example2@example.com",
          username: "example2",
          bio: "bio",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      post: [
        {
          id: "10000000-0000-0000-0000-000000000001",
          accountId: "00000000-0000-0000-0000-000000000000",
          body: "first post!",
          createdAt: new Date(0),
          updatedAt: new Date(0),
        },
      ],
    },
    Prisma.dmmf.datamodel,
    undefined,
    {
      caseInsensitive: true,
    },
  );
}
