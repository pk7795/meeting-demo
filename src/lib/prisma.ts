import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }
const prismaClientSingleton = () => {
  return new PrismaClient(
    // {
    //   log: [
    //     {
    //       emit: 'event',
    //       level: 'query',
    //     },
    //     {
    //       emit: 'stdout',
    //       level: 'error',
    //     },
    //     {
    //       emit: 'stdout',
    //       level: 'info',
    //     },
    //     {
    //       emit: 'stdout',
    //       level: 'warn',
    //     },
    //   ],
    // }
  )
}
export const prisma = globalForPrisma.prisma || prismaClientSingleton()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
// prisma.$on('query', (e) => {
//   console.log('Query: ' + e.query)
//   console.log('Params: ' + e.params)
//   console.log('Duration: ' + e.duration + 'ms')
// })
export const getPrisma = () => {
  return prisma
}
