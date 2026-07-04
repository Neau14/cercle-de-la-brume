import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth, jsonError } from '@/lib/apiHelpers';

export async function POST(request, { params }) {
  try {
    const auth = await requireAuth(['ADMIN', 'MEMBER']);
    if (auth.error) return jsonError(auth.error, auth.status);

    const { id } = await params;
    const { choice } = await request.json();

    if (!choice) {
      return jsonError('Choix requis.', 400);
    }

    // Upsert: create or update the vote
    const vote = await prisma.simulationVote.upsert({
      where: {
        simulationId_userId: {
          simulationId: id,
          userId: auth.user.id,
        },
      },
      update: { choice },
      create: {
        simulationId: id,
        userId: auth.user.id,
        choice,
      },
    });

    return NextResponse.json({ vote });
  } catch (error) {
    console.error('Simulation vote error:', error);
    return jsonError('Erreur interne.', 500);
  }
}
