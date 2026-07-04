import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function requireAuth(roles = null) {
  const session = await getSession();
  if (!session) return { error: 'Non authentifié.', status: 401 };

  const user = await prisma.user.findUnique({ where: { id: session.userId } });
  if (!user) return { error: 'Utilisateur non trouvé.', status: 404 };
  if (user.role === 'BANNED') return { error: 'Accès révoqué.', status: 403 };
  if (user.role === 'PENDING') return { error: 'En attente de validation.', status: 403 };
  if (roles && !roles.includes(user.role)) return { error: 'Accès refusé.', status: 403 };

  return { user };
}

export function jsonError(message, status = 400) {
  return NextResponse.json({ error: message }, { status });
}
