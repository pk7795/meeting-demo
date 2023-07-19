import { env } from '.'

class SendBirdService {
    constructor(
        private appId: string,
        private accessToken: string
    ) {
        // ...
    }

    async get(path: string) {
        const res = await fetch(`https://api-${this.appId}.sendbird.com/v3/${path}`, {
            headers: {
                'Api-Token': this.accessToken,
            },
        })
        const resJson = await res.json()
        return resJson
    }

    async post(path: string, body: any) {
        const res = await fetch(`https://api-${this.appId}.sendbird.com/v3/${path}`, {
            method: 'POST',
            headers: {
                'Api-Token': this.accessToken,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        })

        const resJson = await res.json()
        return resJson
    }

    public async createUser(userId: string) {
        const res = await this.post('users', {
            user_id: userId,
            nickname: userId,
            profile_url: '',
            profile_file: '',
        })

        return res
    }

    public async getUserToken(userId: string) {
        const res = await this.post(`users/${userId}/token`, {})
        return res.token as string
    }

    public async createChannel(channelId: string, userId: string) {
        const res = await this.post('group_channels', {
            user_ids: [userId],
        })

        return res.channel_url as string
    }

    public async joinChannel(channelUrl: string, userId: string) {
        await this.post(`group_channels/${channelUrl}/join`, {
            user_id: userId,
        })
    }

    public async sendMessage(channelId: string, message: string) {
        //TODO
    }
}

export const SendbirdService = new SendBirdService(env.CHAT_APP_ID, env.CHAT_APP_TOKEN)
