import type { SpotifySearchResponse, SpotifyTrack, SpotifyAlbum, SpotifyArtist } from '../types';

class SpotifyService {
  private clientId: string;
  private clientSecret: string;
  private accessToken: string = '';
  private tokenExpiry: number = 0;

  constructor() {
    this.clientId = process.env.SPOTIFY_CLIENT_ID || '';
    this.clientSecret = process.env.SPOTIFY_CLIENT_SECRET || '';
  }

  private async getAccessToken(): Promise<string> {
    if (this.accessToken && Date.now() < this.tokenExpiry) {
      return this.accessToken!;
    }

    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + Buffer.from(this.clientId + ':' + this.clientSecret).toString('base64')
      },
      body: 'grant_type=client_credentials'
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error('Failed to get Spotify access token');
    }

    this.accessToken = data.access_token;
    this.tokenExpiry = Date.now() + (data.expires_in * 1000);
    
    return this.accessToken;
  }

  async search(query: string, type: 'track' | 'album' | 'artist' = 'track', limit: number = 20): Promise<SpotifySearchResponse> {
    const token = await this.getAccessToken();
    
    const response = await fetch(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=${type}&limit=${limit}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );

    if (!response.ok) {
      throw new Error('Spotify API request failed');
    }

    return response.json();
  }

  async getTrack(id: string): Promise<SpotifyTrack> {
    const token = await this.getAccessToken();
    
    const response = await fetch(`https://api.spotify.com/v1/tracks/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to get track');
    }

    return response.json();
  }

  async getAlbum(id: string): Promise<SpotifyAlbum> {
    const token = await this.getAccessToken();
    
    const response = await fetch(`https://api.spotify.com/v1/albums/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to get album');
    }

    return response.json();
  }

  async getArtist(id: string): Promise<SpotifyArtist> {
    const token = await this.getAccessToken();
    
    const response = await fetch(`https://api.spotify.com/v1/artists/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to get artist');
    }

    return response.json();
  }

  async getTopTracks(limit: number = 20): Promise<SpotifyTrack[]> {
    const token = await this.getAccessToken();
    
    const response = await fetch(
      `https://api.spotify.com/v1/browse/new-releases?limit=${limit}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );

    if (!response.ok) {
      throw new Error('Failed to get top tracks');
    }

    const data = await response.json();
    return data.albums.items.map((album: any) => ({
      id: album.id,
      name: album.name,
      artists: album.artists,
      album: {
        id: album.id,
        name: album.name,
        images: album.images,
        external_urls: album.external_urls,
        release_date: album.release_date
      },
      external_urls: album.external_urls
    }));
  }
}

export const spotifyService = new SpotifyService(); 