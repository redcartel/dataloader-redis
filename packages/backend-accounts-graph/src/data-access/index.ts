import { PrismaClient } from "data-resources/src/prisma-connection";

const defaultSelect = {
  id: true,
  username: true,
  email: true,
  bio: true,
  profilePic: true,
  createdAt: true,
  updatedAt: true
}

export class AccountRepository {
  private connection: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.connection = prisma;
  }

  async accounts() {
    return await this.connection.account.findMany();
  }

  async accountById(id: string) {
    return await this.connection.account.findUnique({ select: defaultSelect, where: { id } });
  }

  async accountAggregate(ids: string[]) {
    const result = await this.connection.account.findMany({ select: defaultSelect, where: { id : {
      in: ids
    }}})
    return result;
  }
}
