import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth, jsonError } from '@/lib/apiHelpers';

export async function POST(request, { params }) {
  try {
    const auth = await requireAuth(['ADMIN', 'MEMBER']);
    if (auth.error) return jsonError(auth.error, auth.status);

    const { id } = await params;
    const { content } = await request.json();

    if (!content || content.trim().length === 0) {
      return jsonError('Le contenu de la réponse est requis.');
    }

    const debate = await prisma.debate.findUnique({ where: { id } });
    if (!debate) {
      return jsonError('Débat non trouvé.', 404);
    }

    const response = await prisma.debateResponse.create({
      data: {
        content: content.trim(),
        debateId: id,
        authorId: auth.user.id,
      },
      include: {
        author: { select: { rpName: true } },
      },
    });

    return NextResponse.json({ response }, { status: 201 });
  } catch (error) {
    console.error(error);
    return jsonError('Erreur interne.', 500);
  }
}
export async function GET(request, { params }) {
  try {
    const auth = await requireAuth();
    if (auth.error) return jsonError(auth.error, auth.status);

    const { id } = await params;
    const responses = await prisma.debateResponse.findMany({
      where: { debateId: id },
      include: { author: { select: { rpName: true } } },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json({ responses });
  } catch (error) {
    console.error(error);
    return jsonError('Erreur interne.', 500);
  }
}
