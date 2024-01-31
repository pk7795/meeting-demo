import { NextApiRequest, NextApiResponse } from 'next'
import { getPrisma } from '@/lib'

export default async function handler(request: NextApiRequest, response: NextApiResponse) {
  const prisma = getPrisma()
  await prisma.user.findFirst()
  // do nothing
  return response.json({ status: 'ok' })
}
