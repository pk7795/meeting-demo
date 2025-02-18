'use server'

import { env, getPrisma, getSessionUser } from "@/lib";
import { OAuth2Client } from "google-auth-library";
import { google, calendar_v3 } from "googleapis";

export async function scheduleHandler(
  startTime: string,
  endTime: string,
  meetingLink: string,
  inviteUsers: calendar_v3.Schema$EventAttendee[]
) {
  const session = await getSessionUser()
  const account = await getPrisma().account.findFirst({
    where: {
      userId: session?.id,
    }
  });
  try {
    if (!account?.id_token) {
      throw new Error("No access token found");
    }

    const oauth2Client = new OAuth2Client({
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      redirectUri: 'http://localhost:3000/api/auth/callback/google'
    });
    oauth2Client.setCredentials({
      access_token: account?.access_token,
      id_token: account?.id_token,
      token_type: account?.token_type,
      expiry_date: account.expires_at ? account.expires_at * 1000 : undefined,
      refresh_token: account.refresh_token,
    });

    const calendar = google.calendar({
      version: 'v3',
      auth: oauth2Client
    });

    const event = {
      summary: "Cuộc họp trên Ermis",
      description: `Tham gia cuộc họp tại: ${meetingLink}`,
      start: { dateTime: startTime, timeZone: "Asia/Ho_Chi_Minh" },
      end: { dateTime: endTime, timeZone: "Asia/Ho_Chi_Minh" },
      attendees: inviteUsers,
    };

    const response = await calendar.events.insert({
      calendarId: "primary",
      requestBody: event,
    });

    return { success: true, data: response.data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}