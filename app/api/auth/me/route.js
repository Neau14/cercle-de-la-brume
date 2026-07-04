import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Non authentifié.' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        rpName: true,
        role: true,
        bio: true,
        mentorId: true,
        createdAt: true,
        mentor: { select: { rpName: true } },
        mentees: { select: { id: true, rpName: true } },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé.' }, { status: 404 });
    }

    if (user.role === 'BANNED') {
      return NextResponse.json({ error: 'Accès révoqué.', banned: true }, { status: 403 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Me error:', error);
    return NextResponse.json({ error: 'Erreur interne.' }, { status: 500 });
  }
}
