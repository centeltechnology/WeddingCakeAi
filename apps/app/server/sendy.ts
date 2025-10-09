/**
 * Sendy API Client for BakerIQ
 * Handles all interactions with the Sendy email marketing platform
 */

interface SendyConfig {
  apiKey: string;
  baseUrl: string;
  brandId?: string;
}

interface SendySubscriber {
  name?: string;
  email: string;
  list: string;
  fields?: Record<string, string | number | boolean>;
}

interface SendyUpdateParams {
  email: string;
  list: string;
  fields: Record<string, string | number | boolean>;
}

interface SendyUnsubscribeParams {
  email: string;
  list: string;
}

interface SendyResponse {
  success: boolean;
  message: string;
  subscriberId?: string;
}

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

/**
 * Sleep for specified milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export class SendyService {
  private apiKey: string;
  private baseUrl: string;
  private brandId?: string;

  constructor(config: SendyConfig) {
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl.replace(/\/$/, ''); // Remove trailing slash
    this.brandId = config.brandId;
  }

  /**
   * Subscribe a contact to a Sendy list with custom fields
   */
  async subscribe(subscriber: SendySubscriber): Promise<SendyResponse> {
    const { email, name, list, fields = {} } = subscriber;

    if (!list) {
      throw new Error('Sendy listId is required for subscription');
    }

    const formData = new URLSearchParams({
      api_key: this.apiKey,
      email,
      list,
      boolean: 'true',
      ...(name && { name }),
      ...(this.brandId && { brand: this.brandId }),
    });

    // Add custom fields
    for (const [key, value] of Object.entries(fields)) {
      formData.append(key, String(value));
    }

    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        const response = await fetch(`${this.baseUrl}/subscribe`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: formData.toString(),
        });

        const result = await response.text();

        // Sendy returns "1" for success, "Already subscribed" for duplicates
        if (result === '1' || result.includes('Already subscribed')) {
          return {
            success: true,
            message: result === '1' ? 'Subscribed' : 'Already subscribed',
            subscriberId: email, // Sendy uses email as subscriber ID
          };
        }

        // Any other response is an error
        console.error(`❌ Sendy subscribe failed for ${email}:`, result);
        return { success: false, message: result };
      } catch (error) {
        lastError = error as Error;
        console.error(`❌ Sendy subscribe attempt ${attempt}/${MAX_RETRIES} failed:`, error);

        if (attempt < MAX_RETRIES) {
          await sleep(RETRY_DELAY_MS * attempt); // Exponential backoff
        }
      }
    }

    return {
      success: false,
      message: lastError?.message || 'Failed after retries',
    };
  }

  /**
   * Update custom fields for an existing subscriber
   * Note: Sendy doesn't have a dedicated update endpoint, so we re-subscribe with updated fields
   */
  async update(params: SendyUpdateParams): Promise<SendyResponse> {
    const { email, list, fields } = params;

    if (!list) {
      throw new Error('Sendy listId is required for update');
    }

    // Sendy updates fields by re-subscribing
    const formData = new URLSearchParams({
      api_key: this.apiKey,
      email,
      list,
      boolean: 'true',
      ...(this.brandId && { brand: this.brandId }),
    });

    // Add custom fields to update
    for (const [key, value] of Object.entries(fields)) {
      formData.append(key, String(value));
    }

    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        const response = await fetch(`${this.baseUrl}/subscribe`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: formData.toString(),
        });

        const result = await response.text();

        if (result === '1' || result.includes('Already subscribed')) {
          return {
            success: true,
            message: 'Updated',
            subscriberId: email,
          };
        }

        console.error(`❌ Sendy update failed for ${email}:`, result);
        return { success: false, message: result };
      } catch (error) {
        lastError = error as Error;
        console.error(`❌ Sendy update attempt ${attempt}/${MAX_RETRIES} failed:`, error);

        if (attempt < MAX_RETRIES) {
          await sleep(RETRY_DELAY_MS * attempt);
        }
      }
    }

    return {
      success: false,
      message: lastError?.message || 'Failed after retries',
    };
  }

  /**
   * Unsubscribe a contact from a Sendy list
   */
  async unsubscribe(params: SendyUnsubscribeParams): Promise<SendyResponse> {
    const { email, list } = params;

    if (!list) {
      throw new Error('Sendy listId is required for unsubscribe');
    }

    const formData = new URLSearchParams({
      api_key: this.apiKey,
      email,
      list,
      boolean: 'true',
    });

    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        const response = await fetch(`${this.baseUrl}/unsubscribe`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: formData.toString(),
        });

        const result = await response.text();

        // Sendy returns "1" for successful unsubscribe
        if (result === '1') {
          return {
            success: true,
            message: 'Unsubscribed',
          };
        }

        console.error(`❌ Sendy unsubscribe failed for ${email}:`, result);
        return { success: false, message: result };
      } catch (error) {
        lastError = error as Error;
        console.error(`❌ Sendy unsubscribe attempt ${attempt}/${MAX_RETRIES} failed:`, error);

        if (attempt < MAX_RETRIES) {
          await sleep(RETRY_DELAY_MS * attempt);
        }
      }
    }

    return {
      success: false,
      message: lastError?.message || 'Failed after retries',
    };
  }

  /**
   * Get subscription status of an email in a list
   */
  async getSubscriberStatus(email: string, listId: string): Promise<string> {
    const formData = new URLSearchParams({
      api_key: this.apiKey,
      email,
      list_id: listId,
    });

    try {
      const response = await fetch(`${this.baseUrl}/api/subscribers/subscription-status.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
      });

      const result = await response.text();
      // Returns: Subscribed, Unsubscribed, Unconfirmed, Bounced, Soft bounced, Complained, or Email does not exist
      return result;
    } catch (error: any) {
      console.error('Sendy get status error:', error.message);
      return 'Error';
    }
  }
}

/**
 * Initialize Sendy service if credentials are available
 */
export function getSendyService(): SendyService | null {
  const apiKey = process.env.SENDY_API_KEY;
  const baseUrl = process.env.SENDY_BASE_URL;
  const brandId = process.env.SENDY_BRAND_ID;

  if (!apiKey || !baseUrl) {
    console.warn('⚠️  Sendy credentials not configured');
    return null;
  }

  return new SendyService({ apiKey, baseUrl, brandId });
}
