import { GoogleApiClient, GooglePlaceDetails, GoogleApiClientError } from './google-api-client';

export interface ResolveResult {
  placeDetails: GooglePlaceDetails;
  resolvedFrom: 'URL_PLACE_ID' | 'URL_NAME' | 'URL_COORDINATES' | 'SEARCH_FALLBACK';
  originalInput: string;
}

export class PlaceResolverError extends Error {
  public code: 'INVALID_URL' | 'PLACE_NOT_FOUND' | 'GOOGLE_API_ERROR' | 'NETWORK_ERROR';
  constructor(
    message: string,
    code: 'INVALID_URL' | 'PLACE_NOT_FOUND' | 'GOOGLE_API_ERROR' | 'NETWORK_ERROR'
  ) {
    super(message);
    this.code = code;
    this.name = 'PlaceResolverError';
  }
}

export class PlaceResolver {
  private googleClient: GoogleApiClient;

  constructor(googleClient?: GoogleApiClient) {
    this.googleClient = googleClient || new GoogleApiClient();
  }

  /**
   * Resolves a Google Maps URL or fallback search string to a verified Google Place.
   */
  async resolve(input: string): Promise<ResolveResult> {
    const trimmed = input.trim();
    if (!trimmed) {
      throw new PlaceResolverError('Please provide a Google Maps URL or place search term.', 'INVALID_URL');
    }

    let urlString = trimmed;
    const isUrl = /^https?:\/\//i.test(trimmed) || 
                  trimmed.includes('maps.google.') || 
                  trimmed.includes('google.com/maps') || 
                  trimmed.includes('goo.gl') || 
                  trimmed.includes('share.google') || 
                  trimmed.includes('g.co');

    if (isUrl) {
      if (!/^https?:\/\//i.test(urlString)) {
        urlString = `https://${urlString}`;
      }

      // Step 1: Follow short URLs if needed (e.g. maps.app.goo.gl, share.google)
      const isShortUrl = urlString.includes('goo.gl') || 
                         urlString.includes('share.google') || 
                         urlString.includes('g.co') || 
                         urlString.includes('maps.app.goo.gl');

      if (isShortUrl) {
        try {
          const res = await fetch(urlString, {
            method: 'GET',
            redirect: 'follow',
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
              'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            },
          });
          if (res.url && res.url !== urlString) {
            urlString = res.url;
          }
        } catch (e) {
          console.warn('Could not expand shortened URL, continuing with original:', e);
        }
      }

      // Step 2: Try to extract information from the URL
      const parsed = this.parseGoogleMapsUrl(urlString);

      // If we found a direct Google Place ID
      if (parsed.placeId) {
        try {
          const details = await this.googleClient.getPlaceDetails(parsed.placeId);
          if (details) {
            return {
              placeDetails: details,
              resolvedFrom: 'URL_PLACE_ID',
              originalInput: input,
            };
          }
        } catch (err) {
          this.handleGoogleApiError(err);
        }
      }

      // If we found a place name in the URL (e.g. /place/Saravana+Bhavan/...)
      if (parsed.placeName) {
        const query = parsed.coordinates ? `${parsed.placeName}` : parsed.placeName;
        try {
          const details = await this.googleClient.searchPlace(query);
          if (details) {
            return {
              placeDetails: details,
              resolvedFrom: 'URL_NAME',
              originalInput: input,
            };
          }
        } catch (err) {
          this.handleGoogleApiError(err);
        }
      }

      // If we have coordinates, search around coordinates
      if (parsed.coordinates) {
        try {
          const details = await this.googleClient.searchPlace(`${parsed.coordinates.lat},${parsed.coordinates.lng}`);
          if (details) {
            return {
              placeDetails: details,
              resolvedFrom: 'URL_COORDINATES',
              originalInput: input,
            };
          }
        } catch (err) {
          this.handleGoogleApiError(err);
        }
      }

      // If generic search query param
      if (parsed.searchQuery) {
        try {
          const details = await this.googleClient.searchPlace(parsed.searchQuery);
          if (details) {
            return {
              placeDetails: details,
              resolvedFrom: 'SEARCH_FALLBACK',
              originalInput: input,
            };
          }
        } catch (err) {
          this.handleGoogleApiError(err);
        }
      }

      throw new PlaceResolverError(
        'Could not locate a specific place from this Google Maps URL. Try entering the Place Name + City directly.',
        'PLACE_NOT_FOUND'
      );
    }

    // Non-URL: Direct search query fallback (e.g. "Saravana Bhavan Chennai")
    try {
      const details = await this.googleClient.searchPlace(trimmed);
      if (!details) {
        throw new PlaceResolverError(
          `No place found matching "${trimmed}". Please verify the name and city.`,
          'PLACE_NOT_FOUND'
        );
      }
      return {
        placeDetails: details,
        resolvedFrom: 'SEARCH_FALLBACK',
        originalInput: input,
      };
    } catch (err) {
      this.handleGoogleApiError(err);
      throw err;
    }
  }

  private parseGoogleMapsUrl(urlStr: string): {
    placeId?: string;
    placeName?: string;
    coordinates?: { lat: number; lng: number };
    searchQuery?: string;
  } {
    const result: {
      placeId?: string;
      placeName?: string;
      coordinates?: { lat: number; lng: number };
      searchQuery?: string;
    } = {};

    try {
      const url = new URL(urlStr);

      // Check query params: ?q=place_id:... or ?query=...
      const qParam = url.searchParams.get('q') || url.searchParams.get('query');
      if (qParam) {
        if (qParam.startsWith('place_id:')) {
          result.placeId = qParam.replace('place_id:', '');
          return result;
        }
        result.searchQuery = decodeURIComponent(qParam.replace(/\+/g, ' '));
      }

      // Check pathname for /place/Name/@lat,lng or /place/Name/data=...
      const pathname = decodeURIComponent(url.pathname);
      const placeMatch = pathname.match(/\/place\/([^/@?]+)/);
      if (placeMatch && placeMatch[1]) {
        const extracted = placeMatch[1].split('/')[0].replace(/\+/g, ' ').trim();
        if (extracted && extracted.toLowerCase() !== 'maps' && extracted.toLowerCase() !== 'place') {
          result.placeName = extracted;
        }
      }

      // Check coordinates @lat,lng
      const coordMatch = pathname.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
      if (coordMatch) {
        result.coordinates = {
          lat: parseFloat(coordMatch[1]),
          lng: parseFloat(coordMatch[2]),
        };
      }

      // Check for Place ID pattern in data parameter (e.g. !1s0x... or 27-character place ID)
      const dataParam = url.searchParams.get('data') || pathname;
      const placeIdMatch = dataParam.match(/!1s(ChIJ[a-zA-Z0-9_-]{23,35})/);
      if (placeIdMatch) {
        result.placeId = placeIdMatch[1];
      }

      // If no placeName was found but searchQuery exists (e.g. from share.google redirect)
      if (!result.placeName && result.searchQuery) {
        result.placeName = result.searchQuery;
      }
    } catch (e) {
      console.warn('URL parsing error:', e);
    }

    return result;
  }

  private handleGoogleApiError(err: unknown) {
    if (err instanceof GoogleApiClientError) {
      if (err.code === 'QUOTA_EXCEEDED') {
        throw new PlaceResolverError('Google Maps API quota exceeded. Please try again shortly.', 'GOOGLE_API_ERROR');
      }
      if (err.code === 'INVALID_KEY') {
        throw new PlaceResolverError('Google Maps API authentication failed. Check configuration.', 'GOOGLE_API_ERROR');
      }
      if (err.code === 'NETWORK_ERROR') {
        throw new PlaceResolverError('Unable to connect to Google Maps. Please check your internet connection.', 'NETWORK_ERROR');
      }
    }
  }
}
