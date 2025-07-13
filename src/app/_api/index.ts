'use server';

import { cookies } from 'next/headers';

export async function getCookiesForApi(): Promise<string> {
    const cookieStore = await cookies();

    return cookieStore.toString();
}
