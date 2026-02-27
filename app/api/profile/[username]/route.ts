import { db, profiles, users, productMembers, products, impactMetrics } from '@/lib/db';
import { eq } from 'drizzle-orm';

export const runtime = 'edge';

interface Props {
  params: Promise<{ username: string }>;
}

export async function GET(request: Request, { params }: Props) {
  try {
    const { username } = await params;

    // Get profile
    const profile = await db
      .select()
      .from(profiles)
      .where(eq(profiles.username, username))
      .limit(1);

    if (profile.length === 0) {
      return Response.json({ profile: null });
    }

    // Get user info for verification status
    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, profile[0].id))
      .limit(1);

    // Get product members with products
    const members = await db
      .select({
        id: productMembers.id,
        role: productMembers.role,
        product: {
          id: products.id,
          name: products.name,
          slug: products.slug,
          description: products.description,
        },
      })
      .from(productMembers)
      .leftJoin(products, eq(productMembers.productId, products.id))
      .where(eq(productMembers.userId, profile[0].id));

    // Get metrics for each member
    const membersWithMetrics = await Promise.all(
      members.map(async (member) => {
        const metrics = await db
          .select()
          .from(impactMetrics)
          .where(eq(impactMetrics.productMemberId, member.id));

        return {
          ...member,
          impact_metrics: metrics,
        };
      })
    );

    return Response.json({
      profile: {
        ...profile[0],
        isVerified: user[0]?.isVerified || false,
      },
      products: membersWithMetrics,
    });
  } catch (error) {
    console.error('Database error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}