import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession, signToken, setAuthCookie } from '@/lib/auth';

export async function POST(request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Non authentifié.' }, { status: 401 });
    }

    const { rpName } = await request.json();

    if (!rpName || rpName.trim().length < 2 || rpName.trim().length > 50) {
      return NextResponse.json({ error: 'Le nom RP doit comporter entre 2 et 50 caractères.' }, { status: 400 });
    }

    const cleanRpName = rpName.trim();

    // Check if name is already taken
    const existing = await prisma.user.findUnique({
      where: { rpName: cleanRpName },
    });

    if (existing) {
      return NextResponse.json({ error: 'Ce nom RP est déjà utilisé par un autre démon.' }, { status: 409 });
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: session.userId },
      data: { rpName: cleanRpName },
    });

    // Re-issue JWT token with the RP name included
    const token = await signToken({
      userId: updatedUser.id,
      discordId: updatedUser.discordId,
      role: updatedUser.role,
      rpName: updatedUser.rpName,
    });

    await setAuthCookie(token);

    return NextResponse.json({
      message: 'Nom RP enregistré.',
      user: {
        id: updatedUser.id,
        rpName: updatedUser.rpName,
        role: updatedUser.role,
      },
    });
  } catch (error) {
    console.error('RP registration error:', error);
    return NextResponse.json({ error: 'Erreur interne du serveur.' }, { status: 500 });
  }
}
