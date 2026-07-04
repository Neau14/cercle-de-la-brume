import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth, jsonError } from '@/lib/apiHelpers';

export async function GET() {
  try {
    const auth = await requireAuth();
    if (auth.error) return jsonError(auth.error, auth.status);
    const reports = await prisma.combatReport.findMany({
      include: { author: { select: { rpName: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ reports });
  } catch (error) {
    return jsonError('Erreur interne.', 500);
  }
}

export async function POST(request) {
  try {
    const auth = await requireAuth(['ADMIN', 'MEMBER']);
    if (auth.error) return jsonError(auth.error, auth.status);
    const { title, whatWorked, whatFailed, whyAnalysis, improvements } = await request.json();
    if (!title) return jsonError('Le titre est requis.');
    const report = await prisma.combatReport.create({
      data: { title, whatWorked: whatWorked || '', whatFailed: whatFailed || '', whyAnalysis: whyAnalysis || '', improvements: improvements || '', authorId: auth.user.id },
      include: { author: { select: { rpName: true } } },
    });
    return NextResponse.json({ report }, { status: 201 });
  } catch (error) {
    return jsonError('Erreur interne.', 500);
  }
}
