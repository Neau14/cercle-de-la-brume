import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth, jsonError } from '@/lib/apiHelpers';

export async function GET() {
  try {
    const auth = await requireAuth();
    if (auth.error) return jsonError(auth.error, auth.status);

    const entries = await prisma.codexEntry.findMany({
      include: { author: { select: { rpName: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ entries });
  } catch (error) {
    console.error(error);
    return jsonError('Erreur interne.', 500);
  }
}

export async function POST(request) {
  try {
    const auth = await requireAuth(['ADMIN', 'MEMBER']);
    if (auth.error) return jsonError(auth.error, auth.status);

    const { subject, observations, advice } = await request.json();
    if (!subject || !observations) return jsonError('Sujet et observations requis.');

    const entry = await prisma.codexEntry.create({
      data: { subject, observations, advice: advice || '', authorId: auth.user.id },
      include: { author: { select: { rpName: true } } },
    });
    return NextResponse.json({ entry }, { status: 201 });
  } catch (error) {
    console.error(error);
    return jsonError('Erreur interne.', 500);
  }
}
