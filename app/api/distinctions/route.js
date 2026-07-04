import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth, jsonError } from '@/lib/apiHelpers';

export async function GET() {
  try {
    const auth = await requireAuth();
    if (auth.error) return jsonError(auth.error, auth.status);

    const distinctions = await prisma.distinction.findMany({
      include: { user: { select: { rpName: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ distinctions });
  } catch (error) {
    return jsonError('Erreur interne.', 500);
  }
}

export async function POST(request) {
  try {
    const auth = await requireAuth(['ADMIN']);
    if (auth.error) return jsonError(auth.error, auth.status);

    const { title, category, userId } = await request.json();
    if (!title || !category || !userId) return jsonError('Titre, catégorie et destinataire requis.');

    const distinction = await prisma.distinction.create({
      data: { title, category, userId },
      include: { user: { select: { rpName: true } } },
    });
    return NextResponse.json({ distinction }, { status: 201 });
  } catch (error) {
    return jsonError('Erreur interne.', 500);
  }
}
