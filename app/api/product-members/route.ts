import { db, productMembers, products, impactMetrics } from '@/lib/db';
import { eq } from 'drizzle-orm';

export const runtime = 'edge';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return Response.json({ error: 'Missing userId' }, { status: 400 });
    }

    // Get product members with products and metrics
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
      .where(eq(productMembers.userId, userId));

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

    return Response.json({ productMembers: membersWithMetrics });
  } catch (error) {
    console.error('Database error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}