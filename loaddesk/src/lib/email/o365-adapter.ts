import { Client } from '@microsoft/microsoft-graph-client';
import type {
  EmailProviderAdapter,
  TokenResponse,
  IngestedEmail,
  EmailContent,
  SendReplyOptions,
} from './types';

const SCOPES_READ = ['Mail.Read', 'User.Read'];
const SCOPES_SEND = ['Mail.Send'];
const SCOPES_ALL = [...SCOPES_READ, ...SCOPES_SEND];

export class O365Adapter implements EmailProviderAdapter {
  private clientId: string;
  private clientSecret: string;
  private tenantId: string;

  constructor() {
    const clientId = process.env.AZURE_CLIENT_ID;
    const clientSecret = process.env.AZURE_CLIENT_SECRET;
    const tenantId = process.env.AZURE_TENANT_ID ?? 'common';

    if (!clientId || !clientSecret) {
      throw new Error('Microsoft 365 OAuth credentials not configured');
    }

    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.tenantId = tenantId;
  }

  getAuthUrl(state: string, redirectUri: string): string {
    const params = new URLSearchParams({
      client_id: this.clientId,
      response_type: 'code',
      redirect_uri: redirectUri,
      scope: SCOPES_ALL.join(' ') + ' offline_access',
      state,
      prompt: 'consent',
    });

    return `https://login.microsoftonline.com/${this.tenantId}/oauth2/v2.0/authorize?${params}`;
  }

  async exchangeCode(code: string, redirectUri: string): Promise<TokenResponse> {
    const response = await fetch(
      `https://login.microsoftonline.com/${this.tenantId}/oauth2/v2.0/token`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: this.clientId,
          client_secret: this.clientSecret,
          code,
          redirect_uri: redirectUri,
          grant_type: 'authorization_code',
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Token exchange failed: ${error}`);
    }

    const data = await response.json();

    // Get user email
    const client = this.getClient(data.access_token);
    const user = await client.api('/me').get();

    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt: new Date(Date.now() + data.expires_in * 1000),
      scopes: data.scope?.split(' ') ?? SCOPES_ALL,
      email: user.mail ?? user.userPrincipalName ?? '',
    };
  }

  async refreshAccessToken(refreshToken: string): Promise<TokenResponse> {
    const response = await fetch(
      `https://login.microsoftonline.com/${this.tenantId}/oauth2/v2.0/token`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: this.clientId,
          client_secret: this.clientSecret,
          refresh_token: refreshToken,
          grant_type: 'refresh_token',
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Token refresh failed: ${error}`);
    }

    const data = await response.json();

    // Get user email
    const client = this.getClient(data.access_token);
    const user = await client.api('/me').get();

    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token ?? refreshToken,
      expiresAt: new Date(Date.now() + data.expires_in * 1000),
      scopes: data.scope?.split(' ') ?? SCOPES_ALL,
      email: user.mail ?? user.userPrincipalName ?? '',
    };
  }

  private getClient(accessToken: string): Client {
    return Client.init({
      authProvider: (done) => {
        done(null, accessToken);
      },
    });
  }

  async fetchMessages(
    accessToken: string,
    since?: Date,
    maxResults = 50
  ): Promise<IngestedEmail[]> {
    const client = this.getClient(accessToken);

    let query = client
      .api('/me/mailFolders/inbox/messages')
      .select('id,conversationId,from,subject,bodyPreview,receivedDateTime')
      .top(maxResults)
      .orderby('receivedDateTime desc');

    if (since) {
      query = query.filter(`receivedDateTime ge ${since.toISOString()}`);
    }

    const response = await query.get();

    return (response.value ?? []).map((msg: any) => ({
      providerMessageId: msg.id,
      threadId: msg.conversationId,
      fromAddress: msg.from?.emailAddress?.address ?? '',
      fromName: msg.from?.emailAddress?.name,
      subject: msg.subject ?? '',
      snippet: msg.bodyPreview,
      receivedAt: new Date(msg.receivedDateTime),
    }));
  }

  async getMessage(accessToken: string, messageId: string): Promise<EmailContent> {
    const client = this.getClient(accessToken);

    const msg = await client
      .api(`/me/messages/${messageId}`)
      .select('id,conversationId,from,subject,bodyPreview,body,receivedDateTime')
      .get();

    return {
      providerMessageId: msg.id,
      threadId: msg.conversationId,
      fromAddress: msg.from?.emailAddress?.address ?? '',
      fromName: msg.from?.emailAddress?.name,
      subject: msg.subject ?? '',
      snippet: msg.bodyPreview,
      body: msg.body?.contentType === 'text' ? msg.body.content : this.stripHtml(msg.body?.content ?? ''),
      bodyHtml: msg.body?.contentType === 'html' ? msg.body.content : undefined,
      receivedAt: new Date(msg.receivedDateTime),
    };
  }

  private stripHtml(html: string): string {
    return html
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  async sendReply(
    accessToken: string,
    options: SendReplyOptions
  ): Promise<{ messageId: string }> {
    const client = this.getClient(accessToken);

    const message = {
      subject: options.subject,
      body: {
        contentType: 'Text',
        content: options.body,
      },
      toRecipients: [
        {
          emailAddress: {
            address: options.toAddress,
            name: options.toName,
          },
        },
      ],
    };

    // If replying to a thread, use the reply endpoint
    if (options.inReplyTo) {
      await client.api(`/me/messages/${options.inReplyTo}/reply`).post({
        message,
        comment: options.body,
      });

      // Reply doesn't return message ID, return the original
      return { messageId: options.inReplyTo };
    }

    // Otherwise send as new message
    const response = await client.api('/me/sendMail').post({
      message,
      saveToSentItems: true,
    });

    return { messageId: response?.id ?? 'sent' };
  }

  hasSendPermission(scopes: string[]): boolean {
    return scopes.some((s) => s.toLowerCase().includes('mail.send'));
  }
}
