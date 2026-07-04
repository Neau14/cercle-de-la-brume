import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

async function requireAdmin() {
  const session = await getSession();
  if (!session) return { error: 'Non authentifié.', status: 401 };
  
  const user = await prisma.user.findUnique({ where: { id: session.userId } });
  if (!user || user.role !== 'ADMIN') return { error: 'Accès refusé.', status: 403 };
  
  return { user };
}

export async function GET() {
  try {
    const auth = await requireAdmin();
    if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

    const users = await prisma.user.findMany({
      select: {
        id: true,
        rpName: true,
        discordUsername: true,
        role: true,
        isMentor: true,
        bio: true,
        mentorId: true,
        bannedAt: true,
        banReason: true,
        createdAt: true,
        mentor: { select: { rpName: true } },
        mentees: { select: { id: true, rpName: true } },
        _count: {
          select: {
            codexEntries: true,
            combatReports: true,
            courses: true,
            libraryGuides: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ users });
  } catch (error) {
    console.error('Admin users GET error:', error);
    return NextResponse.json({ error: 'Erreur interne.' }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const auth = await requireAdmin();
    if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

    const { userId, action, value } = await request.json();

    if (!userId || !action) {
      return NextResponse.json({ error: 'userId et action requis.' }, { status: 400 });
    }

    const targetUser = await prisma.user.findUnique({ where: { id: userId } });
    if (!targetUser) {
      return NextResponse.json({ error: 'Utilisateur non trouvé.' }, { status: 404 });
    }

    let updateData = {};

    switch (action) {
      case 'changeRole':
        if (!['ADMIN', 'MEMBER', 'OBSERVER', 'PENDING'].includes(value)) {
          return NextResponse.json({ error: 'Rôle invalide.' }, { status: 400 });
        }
        updateData = { role: value, bannedAt: null, banReason: null };
        break;

      case 'ban':
        updateData = { 
          role: 'BANNED', 
          bannedAt: new Date(), 
          banReason: value || 'Aucune raison spécifiée.' 
        };
        break;

      case 'unban':
        updateData = { role: 'OBSERVER', bannedAt: null, banReason: null };
        break;

      case 'updateRpName':
        if (!value || value.trim().length < 2 || value.trim().length > 50) {
          return NextResponse.json({ error: 'Le nom RP doit faire entre 2 et 50 caractères.' }, { status: 400 });
        }
        const cleanName = value.trim();
        const existing = await prisma.user.findUnique({ where: { rpName: cleanName } });
        if (existing && existing.id !== userId) {
          return NextResponse.json({ error: 'Ce nom RP est déjà utilisé.' }, { status: 409 });
        }
        updateData = { rpName: cleanName };
        break;

      case 'setMentor':
        if (value) {
          const mentor = await prisma.user.findUnique({ where: { id: value } });
          if (!mentor) return NextResponse.json({ error: 'Mentor non trouvé.' }, { status: 404 });
        }
        updateData = { mentorId: value || null };
        break;

      case 'updateBio':
        updateData = { bio: value || null };
        break;

      case 'toggleMentor':
        if (typeof value !== 'boolean') {
          return NextResponse.json({ error: 'Valeur booléenne requise pour isMentor.' }, { status: 400 });
        }
        updateData = { isMentor: value };
        break;

      default:
        return NextResponse.json({ error: 'Action non reconnue.' }, { status: 400 });
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: { id: true, rpName: true, role: true, bio: true, bannedAt: true, banReason: true, mentorId: true },
    });

    return NextResponse.json({ user: updated, message: 'Utilisateur mis à jour avec succès.' });
  } catch (error) {
    console.error('Admin users PATCH error:', error);
    return NextResponse.json({ error: 'Erreur interne.' }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const auth = await requireAdmin();
    if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

    const { userId } = await request.json();
    if (!userId) return NextResponse.json({ error: 'userId requis.' }, { status: 400 });

    if (userId === auth.user.id) {
      return NextResponse.json({ error: 'Vous ne pouvez pas supprimer votre propre compte.' }, { status: 400 });
    }

    await prisma.user.delete({ where: { id: userId } });
    return NextResponse.json({ message: 'Utilisateur supprimé.' });
  } catch (error) {
    console.error('Admin users DELETE error:', error);
    return NextResponse.json({ error: 'Erreur interne.' }, { status: 500 });
  }
}
