import { PrismaClient } from "./prisma-connection";

const prisma = new PrismaClient();

async function main() {
    const allAccounts = await prisma.account.findMany();
    console.log(allAccounts);
}

main().then(() => {
    prisma.$disconnect();
    process.exit(1);
})