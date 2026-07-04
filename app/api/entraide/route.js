import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth, jsonError } from '@/lib/apiHelpers';

export async function GET() {
  try {
    const auth = await requireAuth();
    if (auth.error) return jsonError(auth.error, auth.status);

    const posts = await prisma.post.findMany({
      include: { author: { select: { rpName: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ posts });
  } catch (error) {
    return jsonError('Erreur interne.', 500);
  }
}

export async function POST(request) {
  try {
    const auth = await requireAuth(['ADMIN', 'MEMBER']);
    if (auth.error) return jsonError(auth.error, auth.status);

    const { title, content, category } = await request.json();
    if (!title || !content || !category) return jsonError('Titre, contenu et catégorie requis.');

    const post = await prisma.post.create({
      data: { title, content, category, authorId: auth.user.id },
      include: { author: { select: { rpName: true } } },
    });
    return NextResponse.json({ post }, { status: 201 });
  } catch (error) {
    return jsonError('Erreur interne.', 500);
  }
}
