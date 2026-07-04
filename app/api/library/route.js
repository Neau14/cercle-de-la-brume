import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth, jsonError } from '@/lib/apiHelpers';

export async function GET() {
  try {
    const auth = await requireAuth();
    if (auth.error) return jsonError(auth.error, auth.status);
    const guides = await prisma.libraryGuide.findMany({
      include: { author: { select: { rpName: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ guides });
  } catch (error) {
    return jsonError('Erreur interne.', 500);
  }
}

export async function POST(request) {
  try {
    const auth = await requireAuth(['ADMIN', 'MEMBER']);
    if (auth.error) return jsonError(auth.error, auth.status);
    const { title, content } = await request.json();
    if (!title || !content) return jsonError('Titre et contenu requis.');
    const guide = await prisma.libraryGuide.create({
      data: { title, content, authorId: auth.user.id },
      include: { author: { select: { rpName: true } } },
    });
    return NextResponse.json({ guide }, { status: 201 });
  } catch (error) {
    return jsonError('Erreur interne.', 500);
  }
}
