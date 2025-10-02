import axios from 'axios';

interface SendyConfig {
  apiKey: string;
  baseUrl: string;
}

interface SendySubscriber {
  name: string;
  email: string;
  list: string;
  boolean?: boolean;
}

export class SendyService {
  private apiKey: string;
  private baseUrl: string;

  constructor(config: SendyConfig) {
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl.replace(/\/$/, ''); // Remove trailing slash
  }

  async subscribe(subscriber: SendySubscriber): Promise<{ success: boolean; message: string }> {
    try {
      const response = await axios.post(`${this.baseUrl}/subscribe`, {
        api_key: this.apiKey,
        name: subscriber.name,
        email: subscriber.email,
        list: subscriber.list,
        boolean: subscriber.boolean || true, // Silent subscription (no double opt-in)
      }, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        transformRequest: [(data) => {
          return Object.keys(data)
            .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(data[key])}`)
            .join('&');
        }],
      });

      const result = response.data;
      
      // Sendy returns 1 (number or string) on success, or 'Already subscribed.' if already in list
      if (result === 1 || result === '1' || result === 'Already subscribed.') {
        return { success: true, message: result === 1 || result === '1' ? 'Subscribed' : 'Already subscribed' };
      }
      
      return { success: false, message: String(result) };
    } catch (error: any) {
      console.error('Sendy subscribe error:', error.message);
      return { success: false, message: error.message };
    }
  }

  async unsubscribe(email: string, listId: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await axios.post(`${this.baseUrl}/unsubscribe`, {
        api_key: this.apiKey,
        email: email,
        list: listId,
      }, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        transformRequest: [(data) => {
          return Object.keys(data)
            .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(data[key])}`)
            .join('&');
        }],
      });

      const result = response.data;
      return { success: result === '1', message: result === '1' ? 'Unsubscribed' : result };
    } catch (error: any) {
      console.error('Sendy unsubscribe error:', error.message);
      return { success: false, message: error.message };
    }
  }

  async getSubscriberStatus(email: string, listId: string): Promise<string> {
    try {
      const response = await axios.post(`${this.baseUrl}/api/subscribers/subscription-status.php`, {
        api_key: this.apiKey,
        email: email,
        list_id: listId,
      }, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        transformRequest: [(data) => {
          return Object.keys(data)
            .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(data[key])}`)
            .join('&');
        }],
      });

      return response.data; // Returns: Subscribed, Unsubscribed, Unconfirmed, Bounced, Soft bounced, Complained, or Email does not exist
    } catch (error: any) {
      console.error('Sendy get status error:', error.message);
      return 'Error';
    }
  }
}

// Initialize Sendy service if credentials are available
export function getSendyService(): SendyService | null {
  const apiKey = process.env.SENDY_API_KEY;
  const baseUrl = process.env.SENDY_BASE_URL;

  if (!apiKey || !baseUrl) {
    console.warn('Sendy credentials not configured');
    return null;
  }

  return new SendyService({ apiKey, baseUrl });
}
