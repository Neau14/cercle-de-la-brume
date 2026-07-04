import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function PUT(request, { params }) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Non authentifié.' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { id: session.userId } });
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Réservé aux administrateurs.' }, { status: 403 });
    }

    const { id } = await params;
    const { title, content } = await request.json();

    if (!title?.trim() || !content?.trim()) {
      return NextResponse.json({ error: 'Titre et contenu requis.' }, { status: 400 });
    }

    const entry = await prisma.journalEntry.update({
      where: { id },
      data: { title: title.trim(), content: content.trim() },
      include: { author: { select: { rpName: true } } },
    });

    return NextResponse.json({ entry });
  } catch (error) {
    console.error('Journal PUT error:', error);
    return NextResponse.json({ error: 'Erreur interne.' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Non authentifié.' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { id: session.userId } });
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Réservé aux administrateurs.' }, { status: 403 });
    }

    const { id } = await params;

    await prisma.journalEntry.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Journal DELETE error:', error);
    return NextResponse.json({ error: 'Erreur interne.' }, { status: 500 });
  }
}
