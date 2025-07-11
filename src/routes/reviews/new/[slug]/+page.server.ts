import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const preceptor = params.slug;
	return {
		fullName: preceptor
	};
};
