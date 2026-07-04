import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth, jsonError } from '@/lib/apiHelpers';

export async function GET() {
  try {
    const auth = await requireAuth();
    if (auth.error) return jsonError(auth.error, auth.status);
    const courses = await prisma.course.findMany({
      include: { author: { select: { rpName: true } } },
      orderBy: { scheduledAt: 'desc' },
    });
    return NextResponse.json({ courses });
  } catch (error) {
    return jsonError('Erreur interne.', 500);
  }
}

export async function POST(request) {
  try {
    const auth = await requireAuth(['ADMIN', 'MEMBER']);
    if (auth.error) return jsonError(auth.error, auth.status);
    const { title, category, description, content, scheduledAt, location } = await request.json();
    if (!title || !category) return jsonError('Titre et catégorie requis.');
    const course = await prisma.course.create({
      data: { title, category, description: description || '', content: content || '', scheduledAt: scheduledAt ? new Date(scheduledAt) : null, location, authorId: auth.user.id },
      include: { author: { select: { rpName: true } } },
    });
    return NextResponse.json({ course }, { status: 201 });
  } catch (error) {
    return jsonError('Erreur interne.', 500);
  }
}
