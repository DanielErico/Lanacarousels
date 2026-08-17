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
  if (creds.appId !== undefined && creds.appId.trim() !== '') localStorage.setItem(STORAGE_KEYS.APP_ID, creds.appId.trim());
  if (creds.appSecret !== undefined && creds.appSecret.trim() !== '') localStorage.setItem(STORAGE_KEYS.APP_SECRET, creds.appSecret.trim());
  if (creds.accessToken !== undefined && creds.accessToken.trim() !== '') localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, creds.accessToken.trim());
  if (creds.accountId !== undefined && creds.accountId.trim() !== '') localStorage.setItem(STORAGE_KEYS.ACCOUNT_ID, creds.accountId.trim());
}

/** Wipes all stored OAuth credentials — call before reconnecting to avoid stale token/ID mismatches. */
export function clearInstagramCredentials() {
  localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
  localStorage.removeItem(STORAGE_KEYS.ACCOUNT_ID);
  localStorage.removeItem('lana_ig_detected_username');
}

// ─── Connection Status Helpers ─────────────────────────────────────────────────

/** True if an OAuth access token exists — matches what the Header shows. */
export function isInstagramConnected(): boolean {
  const creds = getStoredInstagramCredentials();
  return Boolean(creds.accessToken);
}

/** True if both token AND account ID are stored (ready to publish). */
export function isInstagramReadyToPublish(): boolean {
  const creds = getStoredInstagramCredentials();
  return Boolean(creds.accessToken && creds.accountId);
}

// ─── 1-Click Meta / Instagram OAuth Redirect Flow ──────────────────────────────

/**
 * Exchanges a short-lived (~1 hour) User Access Token for a long-lived (~60 days) token.
 */
export async function exchangeForLongLivedToken(
  shortLivedToken: string,
  customAppId?: string,
  customAppSecret?: string
): Promise<string> {
  const creds = getStoredInstagramCredentials();
  const appId = customAppId || creds.appId || (import.meta.env.VITE_INSTAGRAM_APP_ID as string);
  const appSecret = customAppSecret || creds.appSecret || (import.meta.env.VITE_INSTAGRAM_APP_SECRET as string);

  if (!appId || !appSecret || !shortLivedToken) {
    return shortLivedToken;
  }

  try {
    const url = `https://graph.facebook.com/v19.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${encodeURIComponent(appId)}&client_secret=${encodeURIComponent(appSecret)}&fb_exchange_token=${encodeURIComponent(shortLivedToken)}`;
    const res = await fetch(url);
    const data = await res.json();

    if (res.ok && data.access_token) {
      return data.access_token;
    }
  } catch (err) {
    console.warn('[Meta Token Exchange] Could not exchange for long-lived token, using standard token:', err);
  }

  return shortLivedToken;
}

export function initiateInstagramOAuthLogin(customAppId?: string) {
  const creds = getStoredInstagramCredentials();
  const appId = customAppId || creds.appId || (import.meta.env.VITE_INSTAGRAM_APP_ID as string);

  if (!appId) {
    alert('Please enter your Meta App ID in Settings before connecting Instagram.');
    return;
  }

  // Clear stale token & accountId so the new login session starts clean.
  clearInstagramCredentials();

  const redirectUri = `${window.location.origin}/`;
  const scopes = [
    'instagram_basic',
    'instagram_content_publish',
    'pages_show_list',
    'pages_read_engagement',
    'public_profile',
  ].join(',');

  const oauthUrl = `https://www.facebook.com/v19.0/dialog/oauth?client_id=${appId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=token&scope=${encodeURIComponent(scopes)}&auth_type=rerequest`;

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
  const rawAccessToken = params.get('access_token');

  if (!rawAccessToken) {
    return { success: false, error: 'No access token found in OAuth redirect callback.' };
  }

  // Clear hash from URL cleanly without page reload
  window.history.replaceState(null, '', window.location.pathname + window.location.search);

  // Exchange for 60-day long-lived token
  const accessToken = await exchangeForLongLivedToken(rawAccessToken);

  // Auto-detect Instagram Account ID & Username from token
  const linkedInfo = await fetchLinkedInstagramAccountInfo(accessToken);

  saveInstagramCredentials({
    accessToken,
    accountId: linkedInfo.accountId || '',
  });

  // Persist username so Settings can detect account mismatches
  if (linkedInfo.username) {
    localStorage.setItem('lana_ig_detected_username', linkedInfo.username);
  }

  return {
    success: true,
    accessToken,
    accountId: linkedInfo.accountId,
    username: linkedInfo.username,
    error: linkedInfo.error,
  };
}

// ─── Auto-Detect Linked IG Business Account ────────────────────────────────────

export interface DetectedInstagramAccount {
  id: string;
  username: string;
  name?: string;
  profilePictureUrl?: string;
  pageId?: string;
  pageName?: string;
  pageToken?: string;
}

export async function fetchLinkedInstagramAccountInfo(accessToken: string): Promise<{
  accountId?: string;
  username?: string;
  accounts?: DetectedInstagramAccount[];
  error?: string;
}> {
  try {
    const detectedAccounts: DetectedInstagramAccount[] = [];

    // Attempt 1: Fetch via Facebook Pages accounts list (/me/accounts)
    const res1 = await fetch(
      `https://graph.facebook.com/v19.0/me/accounts?fields=id,name,access_token,category,instagram_business_account{id,name,username,profile_picture_url},connected_instagram_account{id,name,username,profile_picture_url}&access_token=${accessToken}`
    );
    const data1 = await res1.json();

    if (res1.ok && Array.isArray(data1.data)) {
      for (const page of data1.data) {
        const igAcc = page.instagram_business_account || page.connected_instagram_account;
        if (igAcc?.id) {
          detectedAccounts.push({
            id: igAcc.id,
            username: igAcc.username || igAcc.name || 'Instagram Account',
            name: igAcc.name,
            profilePictureUrl: igAcc.profile_picture_url,
            pageId: page.id,
            pageName: page.name,
            pageToken: page.access_token,
          });
        } else if (page.id) {
          // If not embedded in first query, try querying the specific page node
          const tokenToUse = page.access_token || accessToken;
          try {
            const pageIgRes = await fetch(
              `https://graph.facebook.com/v19.0/${page.id}?fields=id,name,instagram_business_account{id,name,username,profile_picture_url},connected_instagram_account{id,name,username,profile_picture_url}&access_token=${tokenToUse}`
            );
            const pageIgData = await pageIgRes.json();
            const subIg = pageIgData.instagram_business_account || pageIgData.connected_instagram_account;
            if (subIg?.id) {
              detectedAccounts.push({
                id: subIg.id,
                username: subIg.username || subIg.name || 'Instagram Account',
                name: subIg.name,
                profilePictureUrl: subIg.profile_picture_url,
                pageId: page.id,
                pageName: page.name,
                pageToken: page.access_token,
              });
            }
          } catch {
            // continue
          }
        }
      }
    }

    // Attempt 2: Direct query on /me endpoint
    if (detectedAccounts.length === 0) {
      try {
        const res2 = await fetch(
          `https://graph.facebook.com/v19.0/me?fields=id,name,username,instagram_business_account{id,name,username,profile_picture_url},connected_instagram_account{id,name,username,profile_picture_url}&access_token=${accessToken}`
        );
        const data2 = await res2.json();

        const directIg = data2?.instagram_business_account || data2?.connected_instagram_account;
        if (res2.ok && directIg?.id) {
          detectedAccounts.push({
            id: directIg.id,
            username: directIg.username || directIg.name || 'Instagram Account',
            name: directIg.name,
            profilePictureUrl: directIg.profile_picture_url,
          });
        }
      } catch {
        // continue
      }
    }

    // Attempt 3: Query Business Manager accounts (/me/businesses)
    if (detectedAccounts.length === 0) {
      try {
        const bizRes = await fetch(
          `https://graph.facebook.com/v19.0/me/businesses?fields=id,name,instagram_business_accounts{id,name,username,profile_picture_url}&access_token=${accessToken}`
        );
        const bizData = await bizRes.json();
        if (bizRes.ok && Array.isArray(bizData.data)) {
          for (const biz of bizData.data) {
            const igList = biz.instagram_business_accounts?.data || [];
            for (const ig of igList) {
              if (ig.id) {
                detectedAccounts.push({
                  id: ig.id,
                  username: ig.username || ig.name || 'Instagram Account',
                  name: ig.name,
                  profilePictureUrl: ig.profile_picture_url,
                });
              }
            }
          }
        }
      } catch {
        // continue
      }
    }

    // If accounts were found, return primary
    if (detectedAccounts.length > 0) {
      const primary = detectedAccounts[0];
      return {
        accountId: primary.id,
        username: primary.username,
        accounts: detectedAccounts,
      };
    }

    // Diagnostic message when no accounts detected
    const pagesCount = data1?.data?.length || 0;
    let message = 'No Instagram Business Account linked to your Facebook profile was found.';
    if (pagesCount === 0) {
      message = 'Your Meta login does not have any connected Facebook Pages. To post to Instagram, your Instagram account must be a Professional/Business account connected to a Facebook Page.';
    } else {
      message = `Found ${pagesCount} Facebook Page(s), but none have an Instagram Business account connected. Please connect your Instagram profile to one of your Facebook Pages in Meta Business Suite or Facebook Page Settings > Linked Accounts.`;
    }

    return {
      error: message,
      accounts: [],
    };
  } catch (err: unknown) {
    return { error: err instanceof Error ? err.message : 'Network error during Instagram account detection.' };
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
    const endpoint = id
      ? `https://graph.facebook.com/v19.0/${id}?fields=id,name,username,profile_picture_url&access_token=${token}`
      : `https://graph.facebook.com/v19.0/me/accounts?fields=name,instagram_business_account{id,name,username,profile_picture_url}&access_token=${token}`;

    const res = await fetch(endpoint);
    const data = await res.json();

    if (!res.ok || data.error) {
      return {
        success: false,
        error: data.error?.message || 'Meta API verification failed. Token may be expired or lack permissions.',
      };
    }

    if (id && data.id) {
      return {
        success: true,
        profile: {
          id: data.id,
          name: data.name,
          username: data.username,
          profile_picture_url: data.profile_picture_url,
        },
      };
    }

    return { success: true };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Verification failed due to network error.',
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

// ─── Direct Instagram Carousel Publishing Flow ──────────────────────────────────

export async function publishCarouselToInstagram(
  imageUrls: string[],
  carouselTitle: string,
  captionText: string,
  customToken?: string,
  customAccountId?: string,
  carouselId?: string
): Promise<{ success: boolean; id?: string; postUrl?: string; error?: string }> {
  const creds = getStoredInstagramCredentials();
  const token = customToken || creds.accessToken;
  let id = customAccountId || creds.accountId;

  // Auto-detect account ID if missing but token is available
  if (!id && token) {
    const autoInfo = await fetchLinkedInstagramAccountInfo(token);
    if (autoInfo.accountId) {
      id = autoInfo.accountId;
      saveInstagramCredentials({ accessToken: token, accountId: id });
    }
  }

  if (!token) {
    return {
      success: false,
      error: 'Instagram access token is missing or expired. Click "Connect Instagram Account" in Settings or below to authenticate with Meta.',
    };
  }

  if (!id) {
    return {
      success: false,
      error: 'No Instagram Business Account was detected on your Meta login. Please ensure your Instagram profile is a Professional/Business account connected to a Facebook page, or enter your Instagram Account ID manually in Settings.',
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

    for (let i = 0; i < imageUrls.length; i++) {
      const url = imageUrls[i];
      const body = new URLSearchParams({
        image_url: url,
        is_carousel_item: 'true',
        access_token: token,
      });

      const itemRes = await fetch(`https://graph.facebook.com/v19.0/${id}/media`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body,
      });
      const itemData = await itemRes.json();

      if (!itemRes.ok || itemData.error) {
        throw new Error(itemData.error?.message || `Failed to create container for slide ${i + 1}.`);
      }

      itemContainerIds.push(itemData.id);
    }

    // Step 2: Format clean caption text without duplicating title
    let fullCaption = captionText.trim();
    if (carouselTitle && !fullCaption.includes(carouselTitle.trim())) {
      fullCaption = `${carouselTitle.trim()}\n\n${fullCaption}`;
    }

    // Step 3: Create parent carousel container (Meta Graph API accepts comma-delimited or JSON string)
    const carouselBody = new URLSearchParams({
      media_type: 'CAROUSEL',
      children: itemContainerIds.join(','),
      caption: fullCaption,
      access_token: token,
    });

    const carouselRes = await fetch(`https://graph.facebook.com/v19.0/${id}/media`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: carouselBody,
    });
    const carouselData = await carouselRes.json();

    if (!carouselRes.ok || carouselData.error) {
      // Fallback to JSON.stringify format if comma-delimited was rejected
      const retryBody = new URLSearchParams({
        media_type: 'CAROUSEL',
        children: JSON.stringify(itemContainerIds),
        caption: fullCaption,
        access_token: token,
      });

      const retryRes = await fetch(`https://graph.facebook.com/v19.0/${id}/media`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: retryBody,
      });
      const retryData = await retryRes.json();

      if (!retryRes.ok || retryData.error) {
        throw new Error(retryData.error?.message || carouselData.error?.message || 'Failed to create parent carousel container on Meta API.');
      }

      carouselData.id = retryData.id;
    }

    const creationId = carouselData.id;

    // Small delay to ensure Meta finishes container packaging
    await new Promise(r => setTimeout(r, 1500));

    // Step 4: Publish container to live Instagram Feed
    const publishBody = new URLSearchParams({
      creation_id: creationId,
      access_token: token,
    });

    const publishRes = await fetch(`https://graph.facebook.com/v19.0/${id}/media_publish`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: publishBody,
    });
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
      error: err instanceof Error ? err.message : 'Publishing to Instagram failed.',
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

