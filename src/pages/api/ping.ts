import { getPrisma } from '@/lib'
import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(request: NextApiRequest, response: NextApiResponse) {
  const prisma = getPrisma()
  await prisma.user.findFirst()
  // do nothing
  return response.json({ status: 'ok' })
}
