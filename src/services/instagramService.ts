// ─── Meta Instagram Graph API Service ──────────────────────────────────────────

export interface InstagramCredentials {
  appId: string;
  appSecret: string;
  accessToken: string;
  accountId: string;
}

export interface InstagramAccountProfile {
  id: string;
  name?: string;
  username?: string;
  profile_picture_url?: string;
}

const STORAGE_KEYS = {
  APP_ID: 'lana_ig_app_id',
  APP_SECRET: 'lana_ig_app_secret',
  ACCESS_TOKEN: 'lana_ig_access_token',
  ACCOUNT_ID: 'lana_ig_account_id',
};

// ─── Key Management ────────────────────────────────────────────────────────────

export function getStoredInstagramCredentials(): InstagramCredentials {
  const envAppId = (import.meta.env.VITE_INSTAGRAM_APP_ID as string) || '';
  const localAppId = localStorage.getItem(STORAGE_KEYS.APP_ID) || '';

  const envAppSecret = (import.meta.env.VITE_INSTAGRAM_APP_SECRET as string) || '';
  const localAppSecret = localStorage.getItem(STORAGE_KEYS.APP_SECRET) || '';

  const envToken = (import.meta.env.VITE_INSTAGRAM_ACCESS_TOKEN as string) || '';
  const localToken = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN) || '';

  const envAccountId = (import.meta.env.VITE_INSTAGRAM_ACCOUNT_ID as string) || '';
  const localAccountId = localStorage.getItem(STORAGE_KEYS.ACCOUNT_ID) || '';

  return {
    appId: localAppId.trim() || envAppId.trim(),
    appSecret: localAppSecret.trim() || envAppSecret.trim(),
    accessToken: localToken.trim() || envToken.trim(),
    accountId: localAccountId.trim() || envAccountId.trim(),
  };
}

export function saveInstagramCredentials(creds: Partial<InstagramCredentials>) {
  if (creds.appId !== undefined) localStorage.setItem(STORAGE_KEYS.APP_ID, creds.appId);
  if (creds.appSecret !== undefined) localStorage.setItem(STORAGE_KEYS.APP_SECRET, creds.appSecret);
  if (creds.accessToken !== undefined) localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, creds.accessToken);
  if (creds.accountId !== undefined) localStorage.setItem(STORAGE_KEYS.ACCOUNT_ID, creds.accountId);
}

// ─── 1-Click Meta / Instagram OAuth Redirect Flow ──────────────────────────────

export function initiateInstagramOAuthLogin(customAppId?: string) {
  const creds = getStoredInstagramCredentials();
  const appId = customAppId || creds.appId || (import.meta.env.VITE_INSTAGRAM_APP_ID as string);

  if (!appId) {
    alert('Please enter your Meta App ID in Settings before connecting Instagram.');
    return;
  }

  const redirectUri = `${window.location.origin}/`;
  const scopes = [
    'instagram_basic',
    'instagram_content_publish',
    'pages_show_list',
    'pages_read_engagement',
  ].join(',');

  const oauthUrl = `https://www.facebook.com/v19.0/dialog/oauth?client_id=${appId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=token&scope=${encodeURIComponent(scopes)}`;

  // Redirect user to official Facebook / Instagram OAuth page
  window.location.href = oauthUrl;
}

export async function parseInstagramOAuthCallback(): Promise<{
  success: boolean;
  accessToken?: string;
  accountId?: string;
  username?: string;
  error?: string;
}> {
  const hash = window.location.hash;
  if (!hash || !hash.includes('access_token=')) {
    return { success: false };
  }

  const params = new URLSearchParams(hash.replace('#', '?'));
  const accessToken = params.get('access_token');

  if (!accessToken) {
    return { success: false, error: 'No access token found in OAuth redirect callback.' };
  }

  // Clear hash from URL cleanly without page reload
  window.history.replaceState(null, '', window.location.pathname + window.location.search);

  // Auto-detect Instagram Account ID & Username from token
  const linkedInfo = await fetchLinkedInstagramAccountInfo(accessToken);

  saveInstagramCredentials({
    accessToken,
    accountId: linkedInfo.accountId || '',
  });

  return {
    success: true,
    accessToken,
    accountId: linkedInfo.accountId,
    username: linkedInfo.username,
  };
}

// ─── Auto-Detect Linked IG Business Account ────────────────────────────────────

export async function fetchLinkedInstagramAccountInfo(accessToken: string): Promise<{
  accountId?: string;
  username?: string;
  error?: string;
}> {
  try {
    // Attempt 1: Fetch via Facebook Pages accounts list
    const res1 = await fetch(
      `https://graph.facebook.com/v19.0/me/accounts?fields=name,instagram_business_account{id,name,username}&access_token=${accessToken}`
    );
    const data1 = await res1.json();

    if (res1.ok && data1.data) {
      for (const page of data1.data) {
        if (page.instagram_business_account) {
          return {
            accountId: page.instagram_business_account.id,
            username: page.instagram_business_account.username || page.instagram_business_account.name,
          };
        }
      }
    }

    // Attempt 2: Direct query on /me endpoint
    const res2 = await fetch(
      `https://graph.facebook.com/v19.0/me?fields=id,name,username,instagram_business_account{id,name,username}&access_token=${accessToken}`
    );
    const data2 = await res2.json();

    if (res2.ok && data2.instagram_business_account) {
      return {
        accountId: data2.instagram_business_account.id,
        username: data2.instagram_business_account.username || data2.instagram_business_account.name,
      };
    }

    // Attempt 3: Direct IG user node lookup if standalone token
    if (res2.ok && data2.username) {
      return {
        accountId: data2.id,
        username: data2.username,
      };
    }

    return { error: 'No Instagram Business Account linked to your Facebook Page was found.' };
  } catch (err: unknown) {
    return { error: err instanceof Error ? err.message : 'Network error.' };
  }
}

// ─── Live Graph API Verification ───────────────────────────────────────────────

export async function verifyInstagramCredentials(
  accessToken?: string,
  accountId?: string
): Promise<{ success: boolean; profile?: InstagramAccountProfile; error?: string }> {
  const creds = getStoredInstagramCredentials();
  const token = accessToken ?? creds.accessToken;
  const id = accountId ?? creds.accountId;

  if (!token) {
    return { success: false, error: 'No Instagram Access Token provided.' };
  }

  try {
    // If account ID provided, fetch specific IG business account info
    const endpoint = id
      ? `https://graph.facebook.com/v19.0/${id}?fields=id,name,username,profile_picture_url&access_token=${token}`
      : `https://graph.facebook.com/v19.0/me/accounts?fields=name,instagram_business_account{id,name,username}&access_token=${token}`;

    const res = await fetch(endpoint);
    const data = await res.json();

    if (!res.ok || data.error) {
      const msg = data.error?.message || `Meta Graph API HTTP ${res.status}`;
      return { success: false, error: msg };
    }

    if (id) {
      return {
        success: true,
        profile: {
          id: data.id,
          name: data.name || data.username,
          username: data.username,
          profile_picture_url: data.profile_picture_url,
        },
      };
    }

    // Fallback: Return first linked account info
    const firstAccount = data.data?.[0]?.instagram_business_account || data.data?.[0];
    return {
      success: true,
      profile: {
        id: firstAccount?.id || 'verified',
        name: firstAccount?.name || 'Linked Meta Account',
        username: firstAccount?.username || firstAccount?.name,
      },
    };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Network error verifying Meta API key.',
    };
  }
}

// ─── Carousel Publishing via Meta Graph API ────────────────────────────────────

export async function publishCarouselToInstagram(
  carouselTitle: string,
  captionText: string,
  imageUrls: string[],
  accessToken?: string,
  accountId?: string
): Promise<{ success: boolean; postUrl?: string; id?: string; error?: string }> {
  const creds = getStoredInstagramCredentials();
  const token = accessToken || creds.accessToken;
  const id = accountId || creds.accountId;

  if (!token || !id) {
    return {
      success: false,
      error: 'Missing Instagram Access Token or Account ID. Please configure keys in Settings.',
    };
  }

  try {
    // Step 1: Create media item containers for each slide image
    const itemContainerIds: string[] = [];

    for (const url of imageUrls) {
      const itemRes = await fetch(
        `https://graph.facebook.com/v19.0/${id}/media?image_url=${encodeURIComponent(url)}&is_carousel_item=true&access_token=${token}`,
        { method: 'POST' }
      );
      const itemData = await itemRes.json();

      if (!itemRes.ok || itemData.error) {
        throw new Error(itemData.error?.message || `Failed to create carousel item for image.`);
      }

      itemContainerIds.push(itemData.id);
    }

    // Step 2: Create parent carousel container
    const childrenParam = itemContainerIds.join(',');
    const fullCaption = `${carouselTitle}\n\n${captionText}`;
    const carouselRes = await fetch(
      `https://graph.facebook.com/v19.0/${id}/media?media_type=CAROUSEL&children=${childrenParam}&caption=${encodeURIComponent(fullCaption)}&access_token=${token}`,
      { method: 'POST' }
    );
    const carouselData = await carouselRes.json();

    if (!carouselRes.ok || carouselData.error) {
      throw new Error(carouselData.error?.message || 'Failed to create carousel container.');
    }

    const creationId = carouselData.id;

    // Step 3: Publish container to live Instagram Feed
    const publishRes = await fetch(
      `https://graph.facebook.com/v19.0/${id}/media_publish?creation_id=${creationId}&access_token=${token}`,
      { method: 'POST' }
    );
    const publishData = await publishRes.json();

    if (!publishRes.ok || publishData.error) {
      throw new Error(publishData.error?.message || 'Failed to publish carousel to Instagram feed.');
    }

    return {
      success: true,
      id: publishData.id,
      postUrl: `https://www.instagram.com/p/${publishData.id}/`,
    };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Publishing failed.',
    };
  }
}

// ─── Schedule Background Post with Upstash QStash ──────────────────────────────

export async function schedulePostWithQStash(
  carouselId: string,
  scheduledAt: string,
  brandId?: string,
  userId?: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const res = await fetch('/api/schedule-post', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ carouselId, scheduledAt, brandId, userId }),
    });

    const data = await res.json();
    if (!res.ok || data.error) {
      return { success: false, error: data.error || `HTTP ${res.status}` };
    }

    return {
      success: true,
      messageId: data.messageId,
    };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to schedule post.',
    };
  }
}

