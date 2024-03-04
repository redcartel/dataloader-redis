import { config } from "common-values";
import { Prisma } from "data-resources/src/generated/prismaClient";
import { PrismaClient } from "data-resources/src/prisma-connection";

type ArrayElement<ArrayType extends readonly unknown[]> =
  ArrayType extends readonly (infer ElementType)[] ? ElementType : never;

const defaultSelect = {
  id: true,
  username: true,
  email: true,
  bio: true,
  profilePic: true,
  createdAt: true,
  updatedAt: true,
};

export function accountRepositoryFactory(
  connection: PrismaClient,
  limit?: number,
) {
  limit ??= config.backend.pageLimit;

  return {
    async accountAggregate(ids: string[]) {
      const result = await connection.account.findMany({
        select: defaultSelect,
        where: {
          id: {
            in: ids,
          },
        },
      });
      const idMap: { [key: string]: ArrayElement<typeof result> } = {};
      result.forEach((row) => (idMap[row.id] = row));
      return ids.map((id) => idMap[id]);
    },
  };
}
