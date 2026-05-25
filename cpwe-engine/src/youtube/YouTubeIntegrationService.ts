import { google } from 'googleapis';
import * as dotenv from 'dotenv';

dotenv.config();

export class YouTubeIntegrationService {
  private oauth2Client;

  constructor() {
    this.oauth2Client = new google.auth.OAuth2(
      process.env.YOUTUBE_CLIENT_ID,
      process.env.YOUTUBE_CLIENT_SECRET,
      'http://localhost:3000/auth/youtube/callback'
    );
  }

  /**
   * Generates the URL the channel owner needs to click to authorize the app.
   */
  public getAuthUrl(): string {
    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: [
        'https://www.googleapis.com/auth/youtube.upload',
        'https://www.googleapis.com/auth/youtube.readonly',
        'https://www.googleapis.com/auth/yt-analytics.readonly',
        'https://www.googleapis.com/auth/youtube.force-ssl'
      ],
      prompt: 'consent'
    });
  }

  /**
   * Exchanges the auth code (from the callback URL) for tokens.
   * @param code The code from the query string ?code=...
   * @returns Tokens (access_token, refresh_token) that MUST be saved in a database
   */
  public async getTokensFromCode(code: string) {
    const { tokens } = await this.oauth2Client.getToken(code);
    this.oauth2Client.setCredentials(tokens);
    return tokens;
  }

  /**
   * Injects tokens previously saved in the database into the client.
   */
  public setCredentials(tokens: any) {
    this.oauth2Client.setCredentials(tokens);
  }

  public getYouTubeClient() {
    return google.youtube({ version: 'v3', auth: this.oauth2Client });
  }

  public getYouTubeAnalyticsClient() {
    return google.youtubeAnalytics({ version: 'v2', auth: this.oauth2Client });
  }
}
