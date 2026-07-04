import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth, jsonError } from '@/lib/apiHelpers';

export async function GET() {
  try {
    const auth = await requireAuth();
    if (auth.error) return jsonError(auth.error, auth.status);
    const debates = await prisma.debate.findMany({
      include: {
        author: { select: { rpName: true } },
        responses: { include: { author: { select: { rpName: true } } }, orderBy: { createdAt: 'asc' } },
        _count: { select: { responses: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ debates });
  } catch (error) {
    return jsonError('Erreur interne.', 500);
  }
}

export async function POST(request) {
  try {
    const auth = await requireAuth(['ADMIN', 'MEMBER']);
    if (auth.error) return jsonError(auth.error, auth.status);
    const { subject, description, scheduledAt } = await request.json();
    if (!subject) return jsonError('Le sujet est requis.');
    const debate = await prisma.debate.create({
      data: { subject, description, scheduledAt: scheduledAt ? new Date(scheduledAt) : null, authorId: auth.user.id },
      include: { author: { select: { rpName: true } }, responses: true, _count: { select: { responses: true } } },
    });
    return NextResponse.json({ debate }, { status: 201 });
  } catch (error) {
    return jsonError('Erreur interne.', 500);
  }
}
