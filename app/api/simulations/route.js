import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth, jsonError } from '@/lib/apiHelpers';

export async function GET() {
  try {
    const auth = await requireAuth();
    if (auth.error) return jsonError(auth.error, auth.status);
    const simulations = await prisma.simulation.findMany({
      include: { author: { select: { rpName: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ simulations });
  } catch (error) {
    return jsonError('Erreur interne.', 500);
  }
}

export async function POST(request) {
  try {
    const auth = await requireAuth(['ADMIN', 'MEMBER']);
    if (auth.error) return jsonError(auth.error, auth.status);
    const { title, scenario, options } = await request.json();
    if (!title || !scenario) return jsonError('Titre et scénario requis.');
    const simulation = await prisma.simulation.create({
      data: { title, scenario, options: options || '[]', authorId: auth.user.id },
      include: { author: { select: { rpName: true } } },
    });
    return NextResponse.json({ simulation }, { status: 201 });
  } catch (error) {
    return jsonError('Erreur interne.', 500);
  }
}
