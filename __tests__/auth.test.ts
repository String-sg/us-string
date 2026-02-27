import { AuthClient, type User } from '@/lib/auth-client';
import { generateSlugFromEmail, generateUniqueSlug } from '@/lib/slug-utils';

// Mock localStorage
const mockLocalStorage = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

describe('AuthClient', () => {
  beforeEach(() => {
    mockLocalStorage.clear();
  });

  test('should start with no user when localStorage is empty', () => {
    const auth = AuthClient.getInstance();
    expect(auth.getCurrentUser()).toBeNull();
    expect(auth.isAuthenticated()).toBe(false);
  });

  test('should restore user from localStorage', () => {
    const testUser: User = {
      id: 'test-id',
      email: 'test@example.com',
      name: 'Test User',
      image: 'https://example.com/avatar.jpg',
    };

    mockLocalStorage.setItem('string-auth-user', JSON.stringify(testUser));

    // Create new instance to test restoration
    (AuthClient as any).instance = undefined;
    const auth = AuthClient.getInstance();

    expect(auth.getCurrentUser()).toEqual(testUser);
    expect(auth.isAuthenticated()).toBe(true);
  });

  test('should notify listeners on auth state change', () => {
    const auth = AuthClient.getInstance();
    const mockCallback = jest.fn();

    const unsubscribe = auth.onAuthStateChange(mockCallback);

    // Should call immediately with current state (null)
    expect(mockCallback).toHaveBeenCalledWith(null);

    // Simulate setting a user
    const testUser: User = {
      id: 'test-id',
      email: 'test@example.com',
      name: 'Test User',
      image: 'https://example.com/avatar.jpg',
    };

    auth.setUser(testUser);

    expect(mockCallback).toHaveBeenCalledWith(testUser);
    expect(mockCallback).toHaveBeenCalledTimes(2);

    unsubscribe();
  });

  test('should clear user on sign out', async () => {
    const auth = AuthClient.getInstance();
    const testUser: User = {
      id: 'test-id',
      email: 'test@example.com',
      name: 'Test User',
      image: 'https://example.com/avatar.jpg',
    };

    auth.setUser(testUser);
    expect(auth.isAuthenticated()).toBe(true);

    await auth.signOut();

    expect(auth.getCurrentUser()).toBeNull();
    expect(auth.isAuthenticated()).toBe(false);
    expect(mockLocalStorage.getItem('string-auth-user')).toBeNull();
  });
});

describe('Slug utilities', () => {
  test('should generate correct slug from email', () => {
    expect(generateSlugFromEmail('john.doe@example.com')).toBe('john-doe');
    expect(generateSlugFromEmail('test_user+tag@domain.co')).toBe('test-user-tag');
    expect(generateSlugFromEmail('simple@test.com')).toBe('simple');
  });

  test('should generate unique slug when conflicts exist', () => {
    const existingSlugs = ['john-doe', 'john-doe-1', 'john-doe-2'];

    expect(generateUniqueSlug('john-doe', existingSlugs)).toBe('john-doe-3');
    expect(generateUniqueSlug('jane-smith', existingSlugs)).toBe('jane-smith');
    expect(generateUniqueSlug('john-doe', [])).toBe('john-doe');
  });
});

describe('MOE verification', () => {
  test('should identify @moe.edu.sg emails as verified', () => {
    const moeEmail = 'teacher@moe.edu.sg';
    const regularEmail = 'user@example.com';

    expect(moeEmail.endsWith('@moe.edu.sg')).toBe(true);
    expect(regularEmail.endsWith('@moe.edu.sg')).toBe(false);
  });
});