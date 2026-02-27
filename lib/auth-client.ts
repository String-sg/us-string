// Simple client-side Google OAuth integration for SSO across string apps
declare global {
  interface Window {
    google: any;
  }
}

export interface User {
  id: string;
  email: string;
  name: string;
  image: string;
}

export class AuthClient {
  private static instance: AuthClient;
  private user: User | null = null;
  private listeners: Set<(user: User | null) => void> = new Set();

  static getInstance(): AuthClient {
    if (!AuthClient.instance) {
      AuthClient.instance = new AuthClient();
    }
    return AuthClient.instance;
  }

  private constructor() {
    // Check for existing session on startup
    const saved = localStorage.getItem('string-auth-user');
    if (saved) {
      try {
        this.user = JSON.parse(saved);
      } catch {
        localStorage.removeItem('string-auth-user');
      }
    }
  }

  onAuthStateChange(callback: (user: User | null) => void): () => void {
    this.listeners.add(callback);
    callback(this.user); // Call immediately with current state

    return () => {
      this.listeners.delete(callback);
    };
  }

  private notifyListeners() {
    this.listeners.forEach(callback => {
      callback(this.user);
    });
  }

  async signIn(): Promise<void> {
    try {
      await this.initializeGoogleAuth();
      const google = (window as any).google;
      if (!google) {
        throw new Error('Google Identity Services not loaded');
      }

      // Directly show popup instead of One Tap for immediate response
      this.showGoogleSignInPopup();
    } catch (error) {
      console.error('Sign in error:', error);
      alert('Failed to initialize Google sign-in. Please try again.');
    }
  }

  private async initializeGoogleAuth(): Promise<void> {
    // Load Google Identity Services if not already loaded
    if (!(window as any).google) {
      await this.loadGoogleScript();
    }

    const google = (window as any).google;
    await google.accounts.id.initialize({
      client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
      callback: this.handleCredentialResponse.bind(this),
      auto_select: false,
      cancel_on_tap_outside: true
    });
  }

  private loadGoogleScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Google script'));
      document.head.appendChild(script);
    });
  }

  private async handleCredentialResponse(response: any): Promise<void> {
    try {
      // Decode the JWT token to get user info
      const payload = this.parseJWT(response.credential);

      const user: User = {
        id: payload.sub,
        email: payload.email,
        name: payload.name,
        image: payload.picture
      };

      // Save user to database via API
      try {
        const saveResponse = await fetch('/api/users', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
            provider: 'google',
          }),
        });

        if (!saveResponse.ok) {
          console.warn('Failed to save user to database:', saveResponse.statusText);
        }
      } catch (dbError) {
        console.warn('Database save error:', dbError);
      }

      // Update local state
      this.user = user;
      localStorage.setItem('string-auth-user', JSON.stringify(user));
      this.notifyListeners();

    } catch (error) {
      console.error('Failed to process Google credential:', error);
    }
  }

  private parseJWT(token: string): any {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  }

  private showGoogleSignInPopup(): void {
    const google = (window as any).google;
    if (!google) return;

    // Create a temporary container for the sign-in button
    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.top = '50%';
    container.style.left = '50%';
    container.style.transform = 'translate(-50%, -50%)';
    container.style.zIndex = '10000';
    container.style.backgroundColor = 'white';
    container.style.padding = '20px';
    container.style.borderRadius = '8px';
    container.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';

    document.body.appendChild(container);

    // Render Google sign-in button
    google.accounts.id.renderButton(container, {
      theme: 'outline',
      size: 'large',
      width: 250
    });

    // Add close button
    const closeBtn = document.createElement('button');
    closeBtn.textContent = '×';
    closeBtn.style.position = 'absolute';
    closeBtn.style.top = '5px';
    closeBtn.style.right = '10px';
    closeBtn.style.border = 'none';
    closeBtn.style.background = 'none';
    closeBtn.style.fontSize = '20px';
    closeBtn.style.cursor = 'pointer';
    closeBtn.onclick = () => document.body.removeChild(container);

    container.appendChild(closeBtn);

    // Auto-remove after 30 seconds
    setTimeout(() => {
      if (document.body.contains(container)) {
        document.body.removeChild(container);
      }
    }, 30000);
  }

  async signOut(): Promise<void> {
    this.user = null;
    localStorage.removeItem('string-auth-user');
    this.notifyListeners();
  }

  getCurrentUser(): User | null {
    return this.user;
  }

  isAuthenticated(): boolean {
    return !!this.user;
  }
}

export const auth = AuthClient.getInstance();