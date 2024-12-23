import NextAuth, { NextAuthOptions } from 'next-auth'
import GithubProvider from 'next-auth/providers/github'
import GoogleProvider from 'next-auth/providers/google'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { env, getPrisma } from '@/lib'
import axios from 'axios'
const CHAT_API_URL = `${env.ERMIS_API}/uss/v1/wallets/google_login`;
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
  events: {
    async signIn({ user, account }) {
      if (account?.provider === "google" && account.id_token) {
        try {
          // Gọi API chat để lấy accessToken và refreshToken
          // const response = await axios.post(CHAT_API_URL, {
          //   idToken: account.id_token,
          //   apikey: "kUCqqbfEQxkZge7HHDFcIxfoHzqSZUam"
          // });
          const existingChatToken = await getPrisma().chatToken.findFirst({
            where: {
              userId: user.id,  // Tìm bản ghi có userId
            },
          });
          if (existingChatToken) {
            await getPrisma().chatToken.update({
              where: {
                id: existingChatToken.id,
              },
              data: {
                access_token: "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyX2lkIjoiMHhjMDE5MTg5YmE3MjIyZmZlMGUyM2QzYjY0NzRkMTA0MjY2ZjBmZmIyIiwiY2xpZW50X2lkIjoiNmZiZGVjYjAtMWVjOC00ZTMyLTk5ZDctZmYyNjgzZTMwOGI3IiwiY2hhaW5faWQiOjAsInByb2plY3RfaWQiOiJiNDQ5MzdlNC1jMGQ0LTRhNzMtODQ3Yy0zNzMwYTkyM2NlODMiLCJhcGlrZXkiOiJrVUNxcWJmRVF4a1pnZTdISERGY0l4Zm9IenFTWlVhbSIsImVybWlzIjp0cnVlLCJleHAiOjE4MzI5NjM4MjM0NTYsImFkbWluIjpmYWxzZSwiZ2F0ZSI6ZmFsc2V9.WQDBkjOk_fvRqCRdsu7rqgtqAaIYegjh5SycEr8sDHM",
                refresh_token: "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyX2lkIjoiMHhjMDE5MTg5YmE3MjIyZmZlMGUyM2QzYjY0NzRkMTA0MjY2ZjBmZmIyIiwiY2xpZW50X2lkIjoiNmZiZGVjYjAtMWVjOC00ZTMyLTk5ZDctZmYyNjgzZTMwOGI3IiwiY2hhaW5faWQiOjAsInByb2plY3RfaWQiOiJiNDQ5MzdlNC1jMGQ0LTRhNzMtODQ3Yy0zNzMwYTkyM2NlODMiLCJhcGlrZXkiOiJrVUNxcWJmRVF4a1pnZTdISERGY0l4Zm9IenFTWlVhbSIsImVybWlzIjp0cnVlLCJleHAiOjE4MzI5NjM4MjM0NTYsImFkbWluIjpmYWxzZSwiZ2F0ZSI6ZmFsc2V9.WQDBkjOk_fvRqCRdsu7rqgtqAaIYegjh5SycEr8sDHM",
                // access_token: response.data.access_token,
                // refresh_token: response.data.refresh_token,
              },
            });
          } else {
            // Nếu không tìm thấy ChatToken, tạo mới
            await getPrisma().chatToken.create({
              data: {
                userId: user.id,
                access_token: "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyX2lkIjoiMHhjMDE5MTg5YmE3MjIyZmZlMGUyM2QzYjY0NzRkMTA0MjY2ZjBmZmIyIiwiY2xpZW50X2lkIjoiNmZiZGVjYjAtMWVjOC00ZTMyLTk5ZDctZmYyNjgzZTMwOGI3IiwiY2hhaW5faWQiOjAsInByb2plY3RfaWQiOiJiNDQ5MzdlNC1jMGQ0LTRhNzMtODQ3Yy0zNzMwYTkyM2NlODMiLCJhcGlrZXkiOiJrVUNxcWJmRVF4a1pnZTdISERGY0l4Zm9IenFTWlVhbSIsImVybWlzIjp0cnVlLCJleHAiOjE4MzI5NjM4MjM0NTYsImFkbWluIjpmYWxzZSwiZ2F0ZSI6ZmFsc2V9.WQDBkjOk_fvRqCRdsu7rqgtqAaIYegjh5SycEr8sDHM",
                refresh_token: "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyX2lkIjoiMHhjMDE5MTg5YmE3MjIyZmZlMGUyM2QzYjY0NzRkMTA0MjY2ZjBmZmIyIiwiY2xpZW50X2lkIjoiNmZiZGVjYjAtMWVjOC00ZTMyLTk5ZDctZmYyNjgzZTMwOGI3IiwiY2hhaW5faWQiOjAsInByb2plY3RfaWQiOiJiNDQ5MzdlNC1jMGQ0LTRhNzMtODQ3Yy0zNzMwYTkyM2NlODMiLCJhcGlrZXkiOiJrVUNxcWJmRVF4a1pnZTdISERGY0l4Zm9IenFTWlVhbSIsImVybWlzIjp0cnVlLCJleHAiOjE4MzI5NjM4MjM0NTYsImFkbWluIjpmYWxzZSwiZ2F0ZSI6ZmFsc2V9.WQDBkjOk_fvRqCRdsu7rqgtqAaIYegjh5SycEr8sDHM",
                // access_token: response.data.access_token,
                // refresh_token: response.data.refresh_token,
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
    session: async ({ user, session }: any) => {
      if (user) {
        session.user.role = user.role
        session.user.status = user.status
        session.user.id = user.id
      }
      const existingChatToken = await getPrisma().chatToken.findFirst({
        where: {
          userId: user.id,
        },
      });

      // Kiểm tra và gắn thông tin vào session
      if (existingChatToken) {
        session.chatAccessToken = existingChatToken.access_token;
        session.chatRefreshToken = existingChatToken.refresh_token;

        // Kiểm tra nếu accessToken hết hạn và làm mới nó
        if ((!existingChatToken.access_token || hasTokenExpired(existingChatToken.access_token)) && existingChatToken.refresh_token) {
          const newToken = await refreshChatTokens(existingChatToken.refresh_token);
          session.chatAccessToken = newToken.accessToken;

          await getPrisma().chatToken.update({
            where: { id: existingChatToken.id },
            data: {
              access_token: newToken.accessToken,
              refresh_token: newToken.refreshToken,
            },
          });

          session.chatAccessToken = newToken.accessToken;
        } else {
          session.chatAccessToken = existingChatToken.access_token;
        }
      }

      return session
    },
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
    const response = await axios.post(`${env.ERMIS_API}/uss/v1/wallets/google_login`, {
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