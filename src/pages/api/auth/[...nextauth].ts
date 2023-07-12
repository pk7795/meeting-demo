import NextAuth, { NextAuthOptions } from 'next-auth'
import GithubProvider from 'next-auth/providers/github'
import GoogleProvider from 'next-auth/providers/google'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { env, getPrisma } from '@/lib'

const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(getPrisma()),
  secret: env.NEXTAUTH_SECRET,
  providers: [
    GithubProvider({
      clientId: env.GITHUB_ID,
      clientSecret: env.GITHUB_SECRET,
    }),
    GoogleProvider({
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    session: async ({ user, session }: any) => {
      if (user) {
        session.user.role = user.role
        session.user.status = user.status
        session.user.id = user.id
      }
      return session
    },
  },
}

export default NextAuth(authOptions)
