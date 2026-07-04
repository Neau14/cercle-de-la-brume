import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth, jsonError } from '@/lib/apiHelpers';

export async function GET() {
  try {
    const auth = await requireAuth();
    if (auth.error) return jsonError(auth.error, auth.status);

    const entries = await prisma.journalEntry.findMany({
      include: { author: { select: { rpName: true } } },
      orderBy: { number: 'desc' },
    });
    return NextResponse.json({ entries });
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

    const entry = await prisma.journalEntry.create({
      data: { title, content, authorId: auth.user.id },
      include: { author: { select: { rpName: true } } },
    });
    return NextResponse.json({ entry }, { status: 201 });
  } catch (error) {
    return jsonError('Erreur interne.', 500);
  }
}
