import { google } from 'googleapis';
import type {
  EmailProviderAdapter,
  TokenResponse,
  IngestedEmail,
  EmailContent,
  SendReplyOptions,
} from './types';

const SCOPES_READ = ['https://www.googleapis.com/auth/gmail.readonly'];
const SCOPES_SEND = ['https://www.googleapis.com/auth/gmail.send'];
const SCOPES_ALL = [...SCOPES_READ, ...SCOPES_SEND];

export class GmailAdapter implements EmailProviderAdapter {
  private clientId: string;
  private clientSecret: string;

  constructor() {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      throw new Error('Gmail OAuth credentials not configured');
    }

    this.clientId = clientId;
    this.clientSecret = clientSecret;
  }

  private getOAuth2Client(redirectUri?: string) {
    return new google.auth.OAuth2(
      this.clientId,
      this.clientSecret,
      redirectUri
    );
  }

  getAuthUrl(state: string, redirectUri: string): string {
    const oauth2Client = this.getOAuth2Client(redirectUri);

    return oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES_ALL,
      state,
      prompt: 'consent', // Force consent to get refresh token
    });
  }

  async exchangeCode(code: string, redirectUri: string): Promise<TokenResponse> {
    const oauth2Client = this.getOAuth2Client(redirectUri);

    const { tokens } = await oauth2Client.getToken(code);

    if (!tokens.access_token) {
      throw new Error('Failed to get access token');
    }

    // Get user email
    oauth2Client.setCredentials(tokens);
    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
    const profile = await gmail.users.getProfile({ userId: 'me' });

    const expiresAt = tokens.expiry_date
      ? new Date(tokens.expiry_date)
      : new Date(Date.now() + 3600 * 1000);

    return {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token ?? undefined,
      expiresAt,
      scopes: tokens.scope?.split(' ') ?? SCOPES_ALL,
      email: profile.data.emailAddress ?? '',
    };
  }

  async refreshAccessToken(refreshToken: string): Promise<TokenResponse> {
    const oauth2Client = this.getOAuth2Client();
    oauth2Client.setCredentials({ refresh_token: refreshToken });

    const { credentials } = await oauth2Client.refreshAccessToken();

    if (!credentials.access_token) {
      throw new Error('Failed to refresh access token');
    }

    const expiresAt = credentials.expiry_date
      ? new Date(credentials.expiry_date)
      : new Date(Date.now() + 3600 * 1000);

    // Get user email
    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
    const profile = await gmail.users.getProfile({ userId: 'me' });

    return {
      accessToken: credentials.access_token,
      expiresAt,
      scopes: credentials.scope?.split(' ') ?? SCOPES_ALL,
      email: profile.data.emailAddress ?? '',
    };
  }

  async fetchMessages(
    accessToken: string,
    since?: Date,
    maxResults = 50
  ): Promise<IngestedEmail[]> {
    const oauth2Client = this.getOAuth2Client();
    oauth2Client.setCredentials({ access_token: accessToken });

    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

    // Build query
    let query = 'in:inbox';
    if (since) {
      const timestamp = Math.floor(since.getTime() / 1000);
      query += ` after:${timestamp}`;
    }

    // List messages
    const response = await gmail.users.messages.list({
      userId: 'me',
      q: query,
      maxResults,
    });

    if (!response.data.messages) {
      return [];
    }

    // Fetch message details in parallel (limited batch)
    const messages = await Promise.all(
      response.data.messages.slice(0, maxResults).map(async (msg) => {
        const detail = await gmail.users.messages.get({
          userId: 'me',
          id: msg.id!,
          format: 'metadata',
          metadataHeaders: ['From', 'Subject', 'Date'],
        });

        const headers = detail.data.payload?.headers ?? [];
        const fromHeader = headers.find((h) => h.name === 'From')?.value ?? '';
        const subject = headers.find((h) => h.name === 'Subject')?.value ?? '';
        const dateHeader = headers.find((h) => h.name === 'Date')?.value;

        // Parse from header
        const fromMatch = fromHeader.match(/^(?:"?([^"]*)"?\s)?<?([^>]+)>?$/);
        const fromName = fromMatch?.[1]?.trim();
        const fromAddress = fromMatch?.[2]?.trim() ?? fromHeader;

        return {
          providerMessageId: msg.id!,
          threadId: msg.threadId ?? undefined,
          fromAddress,
          fromName,
          subject,
          snippet: detail.data.snippet ?? undefined,
          receivedAt: dateHeader ? new Date(dateHeader) : new Date(),
        };
      })
    );

    return messages;
  }

  async getMessage(accessToken: string, messageId: string): Promise<EmailContent> {
    const oauth2Client = this.getOAuth2Client();
    oauth2Client.setCredentials({ access_token: accessToken });

    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

    const response = await gmail.users.messages.get({
      userId: 'me',
      id: messageId,
      format: 'full',
    });

    const headers = response.data.payload?.headers ?? [];
    const fromHeader = headers.find((h) => h.name === 'From')?.value ?? '';
    const subject = headers.find((h) => h.name === 'Subject')?.value ?? '';
    const dateHeader = headers.find((h) => h.name === 'Date')?.value;

    // Parse from header
    const fromMatch = fromHeader.match(/^(?:"?([^"]*)"?\s)?<?([^>]+)>?$/);
    const fromName = fromMatch?.[1]?.trim();
    const fromAddress = fromMatch?.[2]?.trim() ?? fromHeader;

    // Extract body
    const body = this.extractBody(response.data.payload);

    return {
      providerMessageId: messageId,
      threadId: response.data.threadId ?? undefined,
      fromAddress,
      fromName,
      subject,
      snippet: response.data.snippet ?? undefined,
      body: body.plain,
      bodyHtml: body.html,
      receivedAt: dateHeader ? new Date(dateHeader) : new Date(),
    };
  }

  private extractBody(payload: any): { plain: string; html?: string } {
    let plain = '';
    let html: string | undefined;

    const extractParts = (parts: any[]) => {
      for (const part of parts) {
        if (part.mimeType === 'text/plain' && part.body?.data) {
          plain = Buffer.from(part.body.data, 'base64').toString('utf-8');
        } else if (part.mimeType === 'text/html' && part.body?.data) {
          html = Buffer.from(part.body.data, 'base64').toString('utf-8');
        } else if (part.parts) {
          extractParts(part.parts);
        }
      }
    };

    if (payload.body?.data) {
      plain = Buffer.from(payload.body.data, 'base64').toString('utf-8');
    } else if (payload.parts) {
      extractParts(payload.parts);
    }

    return { plain, html };
  }

  async sendReply(
    accessToken: string,
    options: SendReplyOptions
  ): Promise<{ messageId: string }> {
    const oauth2Client = this.getOAuth2Client();
    oauth2Client.setCredentials({ access_token: accessToken });

    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

    // Build email
    const emailLines = [
      `To: ${options.toName ? `"${options.toName}" <${options.toAddress}>` : options.toAddress}`,
      `Subject: ${options.subject}`,
      'Content-Type: text/plain; charset=utf-8',
    ];

    if (options.inReplyTo) {
      emailLines.push(`In-Reply-To: ${options.inReplyTo}`);
    }
    if (options.references) {
      emailLines.push(`References: ${options.references}`);
    }

    emailLines.push('', options.body);

    const email = emailLines.join('\r\n');
    const encodedEmail = Buffer.from(email)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    const response = await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: encodedEmail,
        threadId: options.threadId,
      },
    });

    return { messageId: response.data.id! };
  }

  hasSendPermission(scopes: string[]): boolean {
    return scopes.includes('https://www.googleapis.com/auth/gmail.send');
  }
}
