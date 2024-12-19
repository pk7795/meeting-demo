import NextAuth, { NextAuthOptions } from 'next-auth'
import GithubProvider from 'next-auth/providers/github'
import GoogleProvider from 'next-auth/providers/google'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { env, getPrisma } from '@/lib'

const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(getPrisma()),
  secret: env.NEXTAUTH_SECRET,
  providers: [
    GoogleProvider({
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    }),
    GithubProvider({
      clientId: env.GITHUB_ID,
      clientSecret: env.GITHUB_SECRET,
    }),
  ],
  callbacks: {
    // jwt: async ({ token, account, user }: any) => {
    //   console.log('-----------------jwt', { token, account, user });

    //   // Persist the OAuth access token to the token right after signin
    //   if (account) {
    //     token.accessToken = account.access_token
    //     token.id_Token = account.id_token
    //   }

    //   // Add user information to the token
    //   if (user) {
    //     token.id = user.id
    //     token.role = user.role
    //     token.status = user.status
    //   }

    //   return token
    // },
    // session: async ({ session, token }: any) => {
    //   console.log('--------------------------token', token);

    //   if (token) {
    //     session.accessToken = token.accessToken
    //     session.user.id = token.id
    //     session.user.role = token.role
    //     session.user.status = token.status
    //     session.idToken = token.id_Token
    //   }

    //   return session
    // },
    session: async ({ user, session }: any) => {
      if (user) {
        session.user.role = user.role
        session.user.status = user.status
        session.user.id = user.id
      }
      return session
    },
  },
  // session: {
  //   strategy: 'jwt',
  // },
}

export default NextAuth(authOptions)
