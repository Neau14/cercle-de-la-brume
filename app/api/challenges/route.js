import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth, jsonError } from '@/lib/apiHelpers';

export async function GET() {
  try {
    const auth = await requireAuth();
    if (auth.error) return jsonError(auth.error, auth.status);
    const challenges = await prisma.challenge.findMany({
      include: { author: { select: { rpName: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ challenges });
  } catch (error) {
    return jsonError('Erreur interne.', 500);
  }
}

export async function POST(request) {
  try {
    const auth = await requireAuth(['ADMIN', 'MEMBER']);
    if (auth.error) return jsonError(auth.error, auth.status);
    const { title, description, difficulty } = await request.json();
    if (!title || !description) return jsonError('Titre et description requis.');
    const challenge = await prisma.challenge.create({
      data: { title, description, difficulty, authorId: auth.user.id },
      include: { author: { select: { rpName: true } } },
    });
    return NextResponse.json({ challenge }, { status: 201 });
  } catch (error) {
    return jsonError('Erreur interne.', 500);
  }
}
