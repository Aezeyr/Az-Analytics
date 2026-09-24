/**
 * Meta / Facebook Graph API Service Abstraction
 * 
 * SECURITY ARCHITECTURE NOTICE:
 * - Meta User Access Tokens and App Secrets must NEVER be stored or used directly in frontend code.
 * - In production, all live Graph API requests route through a secure backend proxy
 *   (e.g., Express server `/api/meta/insights` or Cloudflare Workers) where App Secret is safe.
 * - This service provides the client interface contract for future backend integration.
 */

export interface MetaPageConnectionStatus {
  isConnected: boolean;
  pageId?: string;
  pageName?: string;
  tokenStatus: 'unconfigured' | 'valid' | 'expired' | 'backend_proxy_required';
  demoModeActive: boolean;
  message: string;
}

export interface MetaGraphApiEndpoints {
  pageDetails: string;       // GET /{page-id}?fields=id,name,about,category,fan_count,verification_status
  pageInsights: string;      // GET /{page-id}/insights?metric=page_impressions,page_engaged_users
  pagePosts: string;         // GET /{page-id}/feed?fields=id,message,created_time,shares,reactions.summary(true),comments.summary(true)
}

class MetaApiService {
  private appId: string;

  constructor() {
    this.appId = import.meta.env.VITE_META_APP_ID || '';
  }

  /**
   * Returns current Meta API connection status
   */
  public getConnectionStatus(): MetaPageConnectionStatus {
    if (!this.appId) {
      return {
        isConnected: false,
        tokenStatus: 'unconfigured',
        demoModeActive: true,
        message: 'Running in Demo Mode. Connect your Meta App ID in environment variables to link your Facebook Page.',
      };
    }

    return {
      isConnected: false,
      tokenStatus: 'backend_proxy_required',
      demoModeActive: true,
      message: 'Meta App ID detected. Server-side Graph API token exchange proxy required for live production calls.',
    };
  }

  /**
   * Reference for endpoints to be used by server-side proxy
   */
  public getDocumentationReference(): {
    endpoints: MetaGraphApiEndpoints;
    requiredPermissions: string[];
    documentationUrl: string;
  } {
    return {
      endpoints: {
        pageDetails: 'https://graph.facebook.com/v19.0/{page-id}?fields=id,name,about,category,fan_count,is_verified,website',
        pageInsights: 'https://graph.facebook.com/v19.0/{page-id}/insights?metric=page_post_engagements,page_impressions_unique',
        pagePosts: 'https://graph.facebook.com/v19.0/{page-id}/published_posts?fields=id,message,created_time,type,attachments,reactions.summary(total_count),comments.summary(total_count),shares',
      },
      requiredPermissions: [
        'pages_show_list',
        'pages_read_engagement',
        'pages_read_user_content',
        'read_insights',
      ],
      documentationUrl: 'https://developers.facebook.com/docs/graph-api/reference/page/',
    };
  }
}

export const metaApiService = new MetaApiService();
