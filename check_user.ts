import { prisma } from './src/lib/prisma'; async function main() { const u = await prisma.user.findUnique({where: {email: 'test@test.pl'}}); console.log(u); } main();
