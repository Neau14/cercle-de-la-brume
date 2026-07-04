import { NextResponse } from 'next/server';
import { clearAuthCookie } from '@/lib/auth';

export async function POST() {
  try {
    await clearAuthCookie();
    return NextResponse.json({ message: 'Déconnexion réussie.' });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur.' }, { status: 500 });
  }
}
