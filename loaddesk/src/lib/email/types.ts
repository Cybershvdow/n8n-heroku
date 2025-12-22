// Email provider adapter interface

export interface EmailProviderAdapter {
  /**
   * Get the OAuth authorization URL for the provider.
   */
  getAuthUrl(state: string, redirectUri: string): string;

  /**
   * Exchange authorization code for tokens.
   */
  exchangeCode(
    code: string,
    redirectUri: string
  ): Promise<TokenResponse>;

  /**
   * Refresh an expired access token.
   */
  refreshAccessToken(refreshToken: string): Promise<TokenResponse>;

  /**
   * Fetch emails from the mailbox.
   */
  fetchMessages(
    accessToken: string,
    since?: Date,
    maxResults?: number
  ): Promise<IngestedEmail[]>;

  /**
   * Get full email content by ID.
   */
  getMessage(accessToken: string, messageId: string): Promise<EmailContent>;

  /**
   * Send an email reply.
   */
  sendReply(
    accessToken: string,
    options: SendReplyOptions
  ): Promise<{ messageId: string }>;

  /**
   * Check if the token has send permissions.
   */
  hasSendPermission(scopes: string[]): boolean;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken?: string;
  expiresAt: Date;
  scopes: string[];
  email: string;
}

export interface IngestedEmail {
  providerMessageId: string;
  threadId?: string;
  fromAddress: string;
  fromName?: string;
  subject: string;
  snippet?: string;
  receivedAt: Date;
}

export interface EmailContent extends IngestedEmail {
  body: string;
  bodyHtml?: string;
}

export interface SendReplyOptions {
  toAddress: string;
  toName?: string;
  subject: string;
  body: string;
  threadId?: string;
  inReplyTo?: string;
  references?: string;
}

export type EmailProviderType = 'GMAIL' | 'O365';
