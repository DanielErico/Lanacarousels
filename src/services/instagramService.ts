// ─── Meta Instagram Graph API Service ──────────────────────────────────────────
import { supabase } from './supabaseClient';

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

// ─── Connection Status Helper ──────────────────────────────────────────────────

export function isInstagramConnected(): boolean {
  const creds = getStoredInstagramCredentials();
  return Boolean(creds.accessToken && creds.accountId);
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
    // Attempt 1: Fetch via Facebook Pages accounts list (both instagram_business_account and connected_instagram_account)
    const res1 = await fetch(
      `https://graph.facebook.com/v19.0/me/accounts?fields=access_token,name,instagram_business_account{id,name,username},connected_instagram_account{id,name,username}&access_token=${accessToken}`
    );
    const data1 = await res1.json();

    if (res1.ok && data1.data) {
      for (const page of data1.data) {
        const igAcc = page.instagram_business_account || page.connected_instagram_account;
        if (igAcc) {
          return {
            accountId: igAcc.id,
            username: igAcc.username || igAcc.name,
          };
        }
        if (page.access_token && page.id) {
          try {
            const pageIgRes = await fetch(
              `https://graph.facebook.com/v19.0/${page.id}?fields=instagram_business_account{id,name,username},connected_instagram_account{id,name,username}&access_token=${page.access_token}`
            );
            const pageIgData = await pageIgRes.json();
            const subIg = pageIgData.instagram_business_account || pageIgData.connected_instagram_account;
            if (subIg) {
              return {
                accountId: subIg.id,
                username: subIg.username || subIg.name,
              };
            }
          } catch {
            // continue loop
          }
        }
      }
    }

    // Attempt 2: Direct query on /me endpoint
    const res2 = await fetch(
      `https://graph.facebook.com/v19.0/me?fields=id,name,username,instagram_business_account{id,name,username},connected_instagram_account{id,name,username}&access_token=${accessToken}`
    );
    const data2 = await res2.json();

    const directIg = data2?.instagram_business_account || data2?.connected_instagram_account;
    if (res2.ok && directIg) {
      return {
        accountId: directIg.id,
        username: directIg.username || directIg.name,
      };
    }

    // Attempt 3: Fallback to Facebook Page node if page linked
    if (data1?.data?.[0]?.id) {
      return {
        accountId: data1.data[0].id,
        username: data1.data[0].name || 'Instagram Business Account',
      };
    }

    // Attempt 4: Direct IG user node lookup if standalone token
    if (res2.ok && data2?.id) {
      return {
        accountId: data2.id,
        username: data2.username || data2.name,
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

// ─── Supabase Storage Image Upload ────────────────────────────────────────────
// Converts base64 data: URLs (from html2canvas) into publicly-accessible HTTPS
// URLs via Supabase Storage so Meta's Graph API can fetch them.

export async function uploadSlidesToSupabaseStorage(
  dataUrls: string[],
  carouselId: string
): Promise<{ publicUrls: string[]; error?: string }> {
  const publicUrls: string[] = [];

  for (let i = 0; i < dataUrls.length; i++) {
    const dataUrl = dataUrls[i];

    // Skip non-base64 URLs (already HTTPS) — pass through unchanged
    if (!dataUrl.startsWith('data:')) {
      publicUrls.push(dataUrl);
      continue;
    }

    try {
      // Convert base64 data URL → Blob
      const response = await fetch(dataUrl);
      const blob = await response.blob();

      const fileName = `carousel-slides/${carouselId}/slide-${i + 1}-${Date.now()}.png`;

      const { error: uploadError } = await supabase.storage
        .from('carousel-images')
        .upload(fileName, blob, {
          contentType: 'image/png',
          upsert: true,
        });

      if (uploadError) {
        return { publicUrls: [], error: `Failed to upload slide ${i + 1}: ${uploadError.message}` };
      }

      const { data: urlData } = supabase.storage
        .from('carousel-images')
        .getPublicUrl(fileName);

      if (!urlData?.publicUrl) {
        return { publicUrls: [], error: `Could not get public URL for slide ${i + 1}.` };
      }

      publicUrls.push(urlData.publicUrl);
    } catch (err) {
      return {
        publicUrls: [],
        error: err instanceof Error ? err.message : `Failed to process slide ${i + 1} image.`,
      };
    }
  }

  return { publicUrls };
}

// ─── Carousel Publishing via Meta Graph API ────────────────────────────────────

export async function publishCarouselToInstagram(
  carouselTitle: string,
  captionText: string,
  imageUrls: string[],
  accessToken?: string,
  accountId?: string,
  carouselId?: string
): Promise<{ success: boolean; postUrl?: string; id?: string; error?: string }> {
  const creds = getStoredInstagramCredentials();
  let token = accessToken || creds.accessToken;
  let id = accountId || creds.accountId;

  // Auto-detect Account ID if token is available but accountId is missing
  if (token && !id) {
    const autoInfo = await fetchLinkedInstagramAccountInfo(token);
    if (autoInfo.accountId) {
      id = autoInfo.accountId;
      saveInstagramCredentials({ accessToken: token, accountId: id });
    }
  }

  if (!token) {
    return {
      success: false,
      error: 'Instagram access token is missing or expired. Click "Reconnect Instagram Account" to refresh connection in 1 click.',
    };
  }

  if (!id) {
    return {
      success: false,
      error: 'No Instagram Business Account was detected on your Meta login. Please ensure your Instagram profile is a Professional/Business account connected to a Facebook page.',
    };
  }

  // ── Upload any base64 data: URLs to Supabase Storage → get public HTTPS URLs ──
  const hasDataUrls = imageUrls.some(u => u.startsWith('data:'));
  if (hasDataUrls) {
    const uploadId = carouselId || `tmp-${Date.now()}`;
    const uploadResult = await uploadSlidesToSupabaseStorage(imageUrls, uploadId);
    if (uploadResult.error) {
      return {
        success: false,
        error: `Image upload failed: ${uploadResult.error}. Please check your Supabase Storage bucket "carousel-images" is set to public.`,
      };
    }
    imageUrls = uploadResult.publicUrls;
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

