import { db, products, productMembers, impactMetrics } from '@/lib/db';
import { eq } from 'drizzle-orm';

export const runtime = 'edge';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, description, role, userId, metrics = [] } = body;

    if (!name || !role || !userId) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Create slug from name
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    // Create or get product
    let productId: string;
    const existingProduct = await db
      .select()
      .from(products)
      .where(eq(products.slug, slug))
      .limit(1);

    if (existingProduct.length > 0) {
      productId = existingProduct[0].id;
    } else {
      const [newProduct] = await db
        .insert(products)
        .values({
          name,
          slug,
          description: description || null,
          createdBy: userId,
        })
        .returning();

      productId = newProduct.id;
    }

    // Create product member
    const [productMember] = await db
      .insert(productMembers)
      .values({
        userId,
        productId,
        role,
      })
      .returning();

    // Add impact metrics
    if (metrics.length > 0) {
      await db
        .insert(impactMetrics)
        .values(
          metrics
            .filter((m: any) => m.label && m.value)
            .map((m: any) => ({
              productMemberId: productMember.id,
              label: m.label,
              value: m.value,
            }))
        );
    }

    return Response.json({ success: true, productMember });
  } catch (error) {
    console.error('Database error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const memberId = searchParams.get('memberId');

    if (!memberId) {
      return Response.json({ error: 'Missing memberId' }, { status: 400 });
    }

    // Delete impact metrics first
    await db.delete(impactMetrics).where(eq(impactMetrics.productMemberId, memberId));

    // Delete product member
    await db.delete(productMembers).where(eq(productMembers.id, memberId));

    return Response.json({ success: true });
  } catch (error) {
    console.error('Database error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}