import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth, jsonError } from '@/lib/apiHelpers';

export async function GET() {
  try {
    const auth = await requireAuth();
    if (auth.error) return jsonError(auth.error, auth.status);

    const profiles = await prisma.slayerProfile.findMany({
      include: { author: { select: { rpName: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ profiles });
  } catch (error) {
    console.error(error);
    return jsonError('Erreur interne.', 500);
  }
}

export async function POST(request) {
  try {
    const auth = await requireAuth(['ADMIN', 'MEMBER']);
    if (auth.error) return jsonError(auth.error, auth.status);

    const { name, grade, breathStyle, strengths, weaknesses, personality, knownFights } = await request.json();
    if (!name) return jsonError('Le nom du Pourfendeur est requis.');

    const profile = await prisma.slayerProfile.create({
      data: { name, grade, breathStyle, strengths, weaknesses, personality, knownFights, authorId: auth.user.id },
      include: { author: { select: { rpName: true } } },
    });
    return NextResponse.json({ profile }, { status: 201 });
  } catch (error) {
    console.error(error);
    return jsonError('Erreur interne.', 500);
  }
}
