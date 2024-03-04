import { PrismaClient } from "../src/generated/prismaClient";
import { uuidv7 } from "uuidv7";

const prisma = new PrismaClient();

async function main() {
  const carter = await prisma.account.upsert({
    where: { email: "carter@example.com" },
    update: {},
    create: {
      id: "00000000-0000-0000-0000-000000000000",
      email: "carter@example.com",
      username: "carter",
    },
  });

  const mike = await prisma.account.upsert({
    where: { email: "mike@example.com" },
    update: {},
    create: {
      id: "00000000-0000-0000-0000-000000000001",
      email: "mike@example.com",
      username: "mike",
    },
  });

  const date = new Date();

  for (let i = 0; i < 400; i++) {
    date.setSeconds(date.getSeconds() - 30);
    const post = await prisma.post.create({
      data: {
        id: uuidv7(),
        // body: `Post #${i}`,
        authorId:
          Math.random() > 0.5
            ? "00000000-0000-0000-0000-000000000000"
            : "00000000-0000-0000-0000-000000000001",
        createdAt: date,
        updatedAt: date,
        body: `Post number ${i}`
      },
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })

  .catch(async (e) => {
    console.error(e);

    await prisma.$disconnect();

    process.exit(1);
  });
