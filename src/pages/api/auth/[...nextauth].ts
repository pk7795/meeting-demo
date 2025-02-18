import NextAuth, { NextAuthOptions } from 'next-auth'
// import GithubProvider from 'next-auth/providers/github'
import GoogleProvider from 'next-auth/providers/google'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { env, getPrisma } from '@/lib'
import axios from 'axios'
const CHAT_API_URL = `${env.ERMIS_CHAT_API}/uss/v1/wallets/google_login`;
const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(getPrisma()),
  secret: env.NEXTAUTH_SECRET,
  // debug: true,
  providers: [
    GoogleProvider({
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          prompt: 'consent',
          access_type: "offline",
          scope: [
            'openid',
            'email',
            'profile',
            'https://www.googleapis.com/auth/calendar',
            'https://www.googleapis.com/auth/calendar.events',
            'https://www.googleapis.com/auth/userinfo.email'
          ].join(' '),
        },
      },
    }),
    // GithubProvider({
    //   clientId: env.GITHUB_ID,
    //   clientSecret: env.GITHUB_SECRET,
    // }),
  ],
  events: {
    async signIn({ user, account }) {
      console.log('signIn: ', user, account);
      // if (account?.refresh_token) {
      //   // Log the incoming token
      //   console.log('Incoming refresh token:', {
      //     length: account.refresh_token.length,
      //     exists: !!account.refresh_token
      //   });

      //   // Try to save directly using Prisma
      //   try {
      //     await getPrisma().account.upsert({
      //       where: {
      //         provider_providerAccountId: {
      //           provider: 'google',
      //           providerAccountId: account.providerAccountId,
      //         },
      //       },
      //       update: {
      //         refresh_token: account.refresh_token,
      //         access_token: account.access_token,
      //         expires_at: account.expires_at,
      //         token_type: account.token_type,
      //         scope: account.scope,
      //         id_token: account.id_token,
      //       },
      //       create: {
      //         userId: user.id,
      //         type: account.type,
      //         provider: account.provider,
      //         providerAccountId: account.providerAccountId,
      //         refresh_token: account.refresh_token,
      //         access_token: account.access_token,
      //         expires_at: account.expires_at,
      //         token_type: account.token_type,
      //         scope: account.scope,
      //         id_token: account.id_token,
      //       },
      //     });

      //     // Verify the save
      //     const savedAccount = await getPrisma().account.findFirst({
      //       where: {
      //         provider: 'google',
      //         providerAccountId: account.providerAccountId
      //       },
      //       select: {
      //         refresh_token: true,
      //         id: true
      //       }
      //     });
      //     console.log('Database Operation Result:', {
      //       saved: !!savedAccount,
      //       hasRefreshToken: !!savedAccount?.refresh_token,
      //       accountId: savedAccount?.id
      //     });
      //   } catch (error) {
      //     console.error('Error saving account:', error);
      //   }
      // }
      if (account?.provider === "google" && account.id_token) {
        try {
          const response = await axios.post(CHAT_API_URL, {
            token: account.id_token,
            apikey: env.ERMIS_CHAT_API_KEY,
          });

          const existingChatToken = await getPrisma().chatToken.findFirst({
            where: {
              gUserId: user.id,
            },
          });
          if (existingChatToken) {
            await getPrisma().chatToken.update({
              where: {
                id: existingChatToken.id,
              },
              data: {
                userId: response.data.user_id,
                projectId: response.data.project_id,
                accessToken: response.data.token,
                refreshToken: response.data.refresh_token,
              },
            });
          } else {
            // Nếu không tìm thấy ChatToken, tạo mới
            await getPrisma().chatToken.create({
              data: {
                gUserId: user.id,
                userId: response.data.user_id,
                projectId: response.data.project_id,
                accessToken: response.data.token,
                refreshToken: response.data.refresh_token,
              },
            });
          }
        } catch (error) {
          console.error("Error syncing chat tokens:", error);
        }
      }
    },
  },
  callbacks: {
    session: async ({ user, session, token, account }: any) => {
      if (user) {
        session.user.role = user.role
        session.user.status = user.status
        session.user.id = user.id
      }
      console.log('session from nextauth: ', session, "user: ", user, "token: ", token, "account: ", account);

      // if (token) {
      //   session.accessToken = token.accessToken
      //   session.refreshToken = token.refreshToken
      //   session.user = {
      //     ...session.user,
      //     ...token.user
      //   }
      // }
      if (!session.chat) {
        session.chat = {
          userId: '',
          accessToken: '',
          projectId: ''
        }
      }

      const existingChatToken = await getPrisma().chatToken.findFirst({
        where: {
          gUserId: user.id,
        },
      });

      if (existingChatToken) {
        session.chat.accessToken = existingChatToken.accessToken;
        session.chat.userId = existingChatToken.userId;
        session.chat.projectId = existingChatToken.projectId;
        session.chat.gUserId = existingChatToken.gUserId;
        session.chat.refreshToken = existingChatToken.refreshToken;

        if ((!existingChatToken.accessToken || hasTokenExpired(existingChatToken.accessToken)) && existingChatToken.refreshToken) {
          const newToken = await refreshChatTokens(existingChatToken.refreshToken);
          session.chat.accessToken = newToken.accessToken;

          await getPrisma().chatToken.update({
            where: { id: existingChatToken.id },
            data: {
              accessToken: newToken.accessToken,
              refreshToken: newToken.refreshToken,
            },
          });

          session.chat.accessToken = newToken.accessToken;
        } else {
          session.chat.accessToken = existingChatToken.accessToken;
          session.chat.userId = existingChatToken.userId;
          session.chat.projectId = existingChatToken.projectId;
          session.chat.gUserId = existingChatToken.gUserId;
        }
      }

      return session
    },
    // jwt: async ({ token, user, account, profile, trigger }) => {
    //   if (user) {
    //     token.role = user.role
    //     token.status = user.status
    //     token.id = user.id
    //   }
    //   console.log('token from nextauth: ', token,"user: ",user,"account ",account,"profile ",profile,"trigger: ",trigger);

    //   return token
    // },
  },
  // session: {
  //   strategy: 'jwt',
  // },
}

export default NextAuth(authOptions)

// Helper để kiểm tra token hết hạn
function hasTokenExpired(accessToken: string): boolean {
  if (!accessToken) return true;

  const payload = JSON.parse(
    Buffer.from(accessToken.split(".")[1], "base64").toString()
  );
  const currentTime = Math.floor(Date.now() / 1000);

  return payload.exp < currentTime;
}
async function refreshChatTokens(refreshToken: string) {
  try {
    const response = await axios.post(`${env.ERMIS_CHAT_API}/uss/v1/wallets/google_login`, {
      refreshToken,
    });

    return {
      accessToken: response.data.accessToken,
      refreshToken: response.data.refreshToken,
    };
  } catch (error) {
    console.error("Failed to refresh chat tokens:", error);
    return { accessToken: null, refreshToken: null };
  }
}