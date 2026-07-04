import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { signToken, setAuthCookie } from '@/lib/auth';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');

  if (!code) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/login?error=no_code`);
  }

  const clientId = process.env.DISCORD_CLIENT_ID;
  const clientSecret = process.env.DISCORD_CLIENT_SECRET;
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/discord/callback`;

  try {
    // Exchange OAuth code for a token
    const tokenResponse = await fetch('https://discord.com/api/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('Failed to exchange code:', errorText);
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/login?error=token_exchange_failed`);
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // Get user details from Discord API
    const userResponse = await fetch('https://discord.com/api/users/@me', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!userResponse.ok) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/login?error=profile_fetch_failed`);
    }

    const discordUser = await userResponse.json();
    const discordId = discordUser.id;
    const discordUsername = discordUser.username;
    
    // Construct avatar URL
    let avatarUrl = null;
    if (discordUser.avatar) {
      avatarUrl = `https://cdn.discordapp.com/avatars/${discordId}/${discordUser.avatar}.png`;
    }

    // Find or create the user in database
    let user = await prisma.user.findUnique({
      where: { discordId },
    });

    const isFirstUser = (await prisma.user.count()) === 0;
    const isOwner = discordId === '1417942188398215208';
    const roleToAssign = (isFirstUser || isOwner) ? 'ADMIN' : 'PENDING';

    if (!user) {
      // Create user. If they are the first user or the owner, auto-assign ADMIN role.
      user = await prisma.user.create({
        data: {
          discordId,
          discordUsername,
          role: roleToAssign,
          avatarUrl,
        },
      });
    } else {
      // Sync latest Discord username and avatar. If owner logged in, ensure they are ADMIN.
      user = await prisma.user.update({
        where: { discordId },
        data: { 
          discordUsername,
          avatarUrl,
          ...(isOwner ? { role: 'ADMIN' } : {})
        },
      });
    }

    if (user.role === 'BANNED') {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/login?error=banned&reason=${encodeURIComponent(user.banReason || '')}`);
    }

    // Set authentication token
    const token = await signToken({
      userId: user.id,
      discordId: user.discordId,
      role: user.role,
      rpName: user.rpName || null,
      avatarUrl: user.avatarUrl || null,
    });

    await setAuthCookie(token);

    // If the user hasn't set an RP Name yet, redirect them to the name selection form
    if (!user.rpName) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/register-rp`);
    }

    // If user registration is pending admin approval, send to login with pending alert
    if (user.role === 'PENDING') {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/login?error=pending`);
    }

    // Success, enter the app
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard`);
  } catch (error) {
    console.error('Discord callback error:', error);
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/login?error=internal_error`);
  }
}
