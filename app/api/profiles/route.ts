import { db, profiles, users } from '@/lib/db';
import { eq } from 'drizzle-orm';

export const runtime = 'edge';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  const username = searchParams.get('username');

  try {
    if (userId) {
      const profile = await db
        .select()
        .from(profiles)
        .where(eq(profiles.id, userId))
        .limit(1);

      return Response.json({ profile: profile[0] || null });
    }

    if (username) {
      const profile = await db
        .select()
        .from(profiles)
        .where(eq(profiles.username, username))
        .limit(1);

      return Response.json({ profile: profile[0] || null });
    }

    return Response.json({ error: 'Missing userId or username parameter' }, { status: 400 });
  } catch (error) {
    console.error('Database error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, username, tagline, linkedinUrl, githubUrl, websiteUrl } = body;

    if (!userId) {
      return Response.json({ error: 'Missing userId' }, { status: 400 });
    }

    // Check if profile exists
    const existingProfile = await db
      .select()
      .from(profiles)
      .where(eq(profiles.id, userId))
      .limit(1);

    if (existingProfile.length === 0) {
      // Create new profile
      const [newProfile] = await db
        .insert(profiles)
        .values({
          id: userId,
          username,
          tagline,
          linkedinUrl,
          githubUrl,
          websiteUrl,
          claimed: !!username,
        })
        .returning();

      return Response.json({ profile: newProfile });
    } else {
      // Update existing profile
      const [updatedProfile] = await db
        .update(profiles)
        .set({
          username: username || existingProfile[0].username,
          tagline,
          linkedinUrl,
          githubUrl,
          websiteUrl,
          claimed: username ? true : existingProfile[0].claimed,
          updatedAt: new Date(),
        })
        .where(eq(profiles.id, userId))
        .returning();

      return Response.json({ profile: updatedProfile });
    }
  } catch (error) {
    console.error('Database error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}