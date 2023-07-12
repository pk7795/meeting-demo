import { PrismaClient } from '@prisma/client'

let prismaInstance: PrismaClient | undefined

export const getPrisma = () => {
    if (!prismaInstance) {
        prismaInstance = new PrismaClient()
    }
    return prismaInstance
}
