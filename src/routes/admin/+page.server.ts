import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { clerkClient } from 'svelte-clerk/server';

export const load: PageServerLoad = async ({ locals }) => {
	const { userId } = locals.auth();

	if (!userId) {
		return redirect(307, '/sign-in');
	}

	const user = await clerkClient.users.getUser(userId);
	const userRole = user.publicMetadata.role;

	if (userRole !== 'admin') {
		throw redirect(307, '/denied');
	}
	return {
		userId
	};
};
