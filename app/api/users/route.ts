import { db, users, profiles } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { generateSlugFromEmail, generateUniqueSlug } from '@/lib/slug-utils';

export const runtime = 'edge';

export async function POST(request: Request) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  try {
    const body = await request.json();
    const { id, email, name, image, provider = 'google' } = body;

    if (!id || !email) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: id, email' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Check if user already exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    let user;

    if (existingUser.length === 0) {
      // Generate unique slug from email for SSO compatibility
      const baseSlug = generateSlugFromEmail(email);
      const existingSlugs = await db
        .select({ slug: users.slug })
        .from(users);

      const slugs = existingSlugs.map(row => row.slug).filter(Boolean) as string[];
      const uniqueSlug = generateUniqueSlug(baseSlug, slugs);

      // Check if user is verified (moe.edu.sg domain)
      const isVerified = email.endsWith('@moe.edu.sg');

      // Create new user
      const [newUser] = await db
        .insert(users)
        .values({
          id,
          email,
          name: name || null,
          avatarUrl: image || null,
          provider,
          slug: uniqueSlug,
          isVerified,
          lastLogin: new Date(),
        })
        .returning();

      user = newUser;
    } else {
      // Update existing user's last login
      const [updatedUser] = await db
        .update(users)
        .set({
          lastLogin: new Date(),
          name: name || existingUser[0].name,
          avatarUrl: image || existingUser[0].avatarUrl,
        })
        .where(eq(users.id, id))
        .returning();

      user = updatedUser;
    }

    return new Response(
      JSON.stringify({ user, success: true }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Database error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}