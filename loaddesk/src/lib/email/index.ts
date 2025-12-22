import { GmailAdapter } from './gmail-adapter';
import { O365Adapter } from './o365-adapter';
import type { EmailProviderAdapter, EmailProviderType } from './types';

export * from './types';
export { GmailAdapter } from './gmail-adapter';
export { O365Adapter } from './o365-adapter';

/**
 * Factory function to get the appropriate email adapter.
 */
export function getEmailAdapter(provider: EmailProviderType): EmailProviderAdapter {
  switch (provider) {
    case 'GMAIL':
      return new GmailAdapter();
    case 'O365':
      return new O365Adapter();
    default:
      throw new Error(`Unsupported email provider: ${provider}`);
  }
}

/**
 * Get the OAuth callback URL for email integrations.
 */
export function getEmailCallbackUrl(): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
  return `${appUrl}/api/integrations/email/callback`;
}
