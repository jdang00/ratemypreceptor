<script lang="ts">
	import { page } from '$app/stores';
	import { useQuery, useConvexClient } from 'convex-svelte';
	import { api } from '../../../../convex/_generated/api.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Skeleton } from '$lib/components/ui/skeleton/index.js';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card/index.js';
	import {
		ArrowLeft,
		Mail,
		Award,
		MapPin,
		School,
		Star,
		Edit,
		Plus,
		MoreVertical,
		Trash2
	} from '@lucide/svelte';
	import { toast } from 'svelte-sonner';
	import EditModal from '$lib/components/EditModal.svelte';
	import AddSchoolAffiliationModal from '$lib/components/AddSchoolAffiliationModal.svelte';
	import AddPracticeSiteAffiliationModal from '$lib/components/AddPracticeSiteAffiliationModal.svelte';
	import DeleteConfirmationModal from '$lib/components/DeleteConfirmationModal.svelte';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';

	// Type definitions
	type School = {
		_id: string;
		name: string;
	};

	type PracticeSite = {
		_id: string;
		name: string;
		city: string;
		state: string;
	};

	type SchoolAffiliation = {
		affiliationId: string;
		school: School | null;
		isActive: boolean;
		createdAt: number;
		updatedAt: number;
	};

	type SiteAffiliation = {
		affiliationId: string;
		site: PracticeSite | null;
		school: School | null;
		isActive: boolean;
		createdAt: number;
		updatedAt: number;
	};

	type SiteWithAffiliation = PracticeSite & {
		affiliationId: string;
		isActive: boolean;
	};

	type SchoolGroup = {
		school: School;
		sites: SiteWithAffiliation[];
	};

	// Get preceptor ID from URL params
	const preceptorId = $page.params.id as any;
	const client = useConvexClient();

	// Query for preceptor with all affiliations
	const preceptorQuery = useQuery(api.preceptorAffiliations.getPreceptorWithAffiliations, {
		preceptorId
	});

	// Query for preceptor school affiliations with management data
	const schoolAffiliationsQuery = useQuery(
		api.preceptorAffiliations.getPreceptorSchoolAffiliations,
		{
			preceptorId,
			onlyActive: false // Get all affiliations to show inactive ones too
		}
	);

	// Query for preceptor site affiliations with management data
	const siteAffiliationsQuery = useQuery(api.preceptorAffiliations.getPreceptorSiteAffiliations, {
		preceptorId,
		onlyActive: false // Get all affiliations to show inactive ones too
	});

	// Query for preceptor reviews
	const reviewsQuery = useQuery(api.reviews.getByPreceptor, {
		preceptorId
	});

	let preceptorData = $derived(preceptorQuery.data);
	let preceptorLoading = $derived(preceptorQuery.isLoading);
	let preceptorError = $derived(preceptorQuery.error);

	let schoolAffiliations = $derived((schoolAffiliationsQuery.data ?? []) as SchoolAffiliation[]);
	let schoolAffiliationsLoading = $derived(schoolAffiliationsQuery.isLoading);

	let siteAffiliations = $derived((siteAffiliationsQuery.data ?? []) as SiteAffiliation[]);
	let siteAffiliationsLoading = $derived(siteAffiliationsQuery.isLoading);

	let reviewsData = $derived((reviewsQuery.data ?? []) as any[]);
	let reviewsLoading = $derived(reviewsQuery.isLoading);
	let reviewsError = $derived(reviewsQuery.error);

	// Calculate review stats
	let reviewStats = $derived(() => {
		if (!reviewsData || reviewsData.length === 0) {
			return {
				totalReviews: 0,
				averageRating: 0,
				recommendationRate: 0
			};
		}

		const totalReviews = reviewsData.length;
		const averageRating =
			reviewsData.reduce((sum, review) => sum + review.starRating, 0) / totalReviews;
		const recommendedCount = reviewsData.filter((review) => review.wouldRecommend).length;
		const recommendationRate = (recommendedCount / totalReviews) * 100;

		return {
			totalReviews,
			averageRating,
			recommendationRate
		};
	});

	// Edit modal state
	let isEditModalOpen = $state(false);

	// School affiliation management state
	let isAddSchoolModalOpen = $state(false);
	let isDeleteSchoolModalOpen = $state(false);
	let selectedAffiliationForDelete = $state<{ id: string; name: string } | null>(null);

	// Practice site management state
	let isAddSiteModalOpen = $state(false);
	let selectedSchoolForSite = $state<{ id: string; name: string } | null>(null);
	let isDeleteSiteModalOpen = $state(false);
	let selectedSiteAffiliationForDelete = $state<{ id: string; name: string } | null>(null);

	// Review moderation state
	let isDeleteReviewModalOpen = $state(false);
	let selectedReviewForDelete = $state<{ id: string; name: string } | null>(null);

	// Field configuration for editing preceptor basic info
	const editFields = [
		{
			key: 'fullName',
			label: 'Full Name',
			type: 'text' as const,
			required: true
		},
		{
			key: 'email',
			label: 'Email',
			type: 'text' as const,
			required: false
		},
		{
			key: 'credentials',
			label: 'Credentials',
			type: 'text' as const,
			required: false
		}
	];

	// Handle edit success
	function handleEditSuccess() {
		toast.success('Preceptor updated successfully!', {
			description: 'The preceptor information has been saved to the database.'
		});
	}

	// Handle opening edit modal
	function openEditModal() {
		isEditModalOpen = true;
	}

	// Handle closing edit modal
	function closeEditModal() {
		isEditModalOpen = false;
	}

	// School affiliation management handlers
	function openAddSchoolModal() {
		isAddSchoolModalOpen = true;
	}

	function closeAddSchoolModal() {
		isAddSchoolModalOpen = false;
	}

	function handleAddSchoolSuccess() {
		toast.success('School affiliation added successfully!', {
			description: 'The school has been affiliated with this preceptor.'
		});
	}

	async function toggleSchoolAffiliationStatus(affiliationId: string, currentStatus: boolean) {
		try {
			await client.mutation(api.preceptorAffiliations.updatePreceptorSchoolAffiliation, {
				affiliationId: affiliationId as any,
				isActive: !currentStatus
			});

			toast.success(
				`School affiliation ${!currentStatus ? 'activated' : 'deactivated'} successfully!`
			);
		} catch (error) {
			toast.error('Failed to update school affiliation status', {
				description: error instanceof Error ? error.message : 'An unexpected error occurred'
			});
		}
	}

	function openDeleteSchoolModal(affiliationId: string, schoolName: string) {
		selectedAffiliationForDelete = { id: affiliationId, name: schoolName };
		isDeleteSchoolModalOpen = true;
	}

	function closeDeleteSchoolModal() {
		selectedAffiliationForDelete = null;
		isDeleteSchoolModalOpen = false;
	}

	function handleDeleteSchoolSuccess() {
		toast.success('School affiliation removed successfully!', {
			description: 'The school affiliation has been permanently removed.'
		});
	}

	// Practice site management handlers
	function openAddSiteModal(schoolId: string, schoolName: string) {
		selectedSchoolForSite = { id: schoolId, name: schoolName };
		isAddSiteModalOpen = true;
	}

	function closeAddSiteModal() {
		selectedSchoolForSite = null;
		isAddSiteModalOpen = false;
	}

	function handleAddSiteSuccess() {
		toast.success('Practice site affiliation added successfully!', {
			description: 'The practice site has been affiliated with this preceptor.'
		});
	}

	async function toggleSiteAffiliationStatus(affiliationId: string, currentStatus: boolean) {
		try {
			await client.mutation(api.preceptorAffiliations.updatePreceptorSiteAffiliation, {
				affiliationId: affiliationId as any,
				isActive: !currentStatus
			});

			toast.success(
				`Practice site affiliation ${!currentStatus ? 'activated' : 'deactivated'} successfully!`
			);
		} catch (error) {
			toast.error('Failed to update practice site affiliation status', {
				description: error instanceof Error ? error.message : 'An unexpected error occurred'
			});
		}
	}

	function openDeleteSiteModal(affiliationId: string, siteName: string) {
		selectedSiteAffiliationForDelete = { id: affiliationId, name: siteName };
		isDeleteSiteModalOpen = true;
	}

	function closeDeleteSiteModal() {
		selectedSiteAffiliationForDelete = null;
		isDeleteSiteModalOpen = false;
	}

	function handleDeleteSiteSuccess() {
		toast.success('Practice site affiliation removed successfully!', {
			description: 'The practice site affiliation has been permanently removed.'
		});
	}

	// Review moderation handlers
	async function toggleReviewOutlierStatus(reviewId: string, currentOutlierStatus: boolean) {
		try {
			await client.mutation(api.reviews.updateReview, {
				id: reviewId as any,
				isOutlier: !currentOutlierStatus
			});

			toast.success(
				`Review ${!currentOutlierStatus ? 'marked as outlier' : 'outlier flag removed'} successfully!`
			);
		} catch (error) {
			toast.error('Failed to update review outlier status', {
				description: error instanceof Error ? error.message : 'An unexpected error occurred'
			});
		}
	}

	function openDeleteReviewModal(reviewId: string, reviewName: string) {
		selectedReviewForDelete = { id: reviewId, name: reviewName };
		isDeleteReviewModalOpen = true;
	}

	function closeDeleteReviewModal() {
		selectedReviewForDelete = null;
		isDeleteReviewModalOpen = false;
	}

	function handleDeleteReviewSuccess() {
		toast.success('Review deleted successfully!', {
			description: 'The review has been permanently removed.'
		});
	}

	// Group site affiliations by school
	let sitesBySchool = $derived(() => {
		const grouped = new Map<string, SchoolGroup>();

		siteAffiliations.forEach((affiliation) => {
			if (affiliation.school && affiliation.site) {
				const schoolId = affiliation.school._id;
				if (!grouped.has(schoolId)) {
					grouped.set(schoolId, {
						school: affiliation.school,
						sites: []
					});
				}
				grouped.get(schoolId)!.sites.push({
					...affiliation.site,
					affiliationId: affiliation.affiliationId,
					isActive: affiliation.isActive
				});
			}
		});

		return Array.from(grouped.values());
	});
</script>

<div class="min-h-screen p-3 sm:p-6">
	<div class="mx-auto max-w-6xl">
		<!-- Navigation breadcrumbs -->
		<div class="mb-6">
			<nav class="text-muted-foreground flex items-center space-x-2 text-sm">
				<a
					href="/admin/preceptors"
					class="flex items-center gap-1 transition-colors hover:text-foreground"
				>
					<ArrowLeft class="h-4 w-4" />
					Back to Preceptors
				</a>
			</nav>
		</div>

		{#if preceptorError}
			<div class="mb-4 rounded-md border border-destructive/20 bg-destructive/10 p-3 sm:p-4">
				<p class="text-sm text-destructive-foreground">Error loading preceptor: {preceptorError}</p>
			</div>
		{/if}

		{#if preceptorLoading}
			<div class="space-y-6">
				<!-- Header skeleton -->
				<div class="space-y-4">
					<Skeleton class="h-8 w-[300px]" />
					<Skeleton class="h-4 w-[200px]" />
				</div>

				<!-- Cards skeleton -->
				<div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
					{#each Array(3), i (i)}
						<Card>
							<CardHeader>
								<Skeleton class="h-6 w-[150px]" />
							</CardHeader>
							<CardContent class="space-y-2">
								<Skeleton class="h-4 w-full" />
								<Skeleton class="h-4 w-[80%]" />
								<Skeleton class="h-4 w-[60%]" />
							</CardContent>
						</Card>
					{/each}
				</div>
			</div>
		{:else if preceptorData}
			<!-- Page header -->
			<div class="mb-8">
				<h1 class="text-3xl font-bold">{preceptorData.fullName}</h1>
				<p class="mt-2">Preceptor Management Dashboard</p>
			</div>

			<!-- Basic info section -->
			<div class="mb-8">
				<Card>
					<CardHeader>
						<CardTitle class="flex items-center justify-between">
							<div class="flex items-center gap-2">
								<Award class="h-5 w-5" />
								Basic Information
							</div>
							<Button variant="outline" size="sm" onclick={openEditModal}>
								<Edit class="mr-2 h-4 w-4" />
								Edit
							</Button>
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div class="grid gap-4 md:grid-cols-2">
							<div class="space-y-2">
								<div class="flex items-center gap-2">
									<Mail class="text-muted-foreground h-4 w-4" />
									<span class="text-sm font-medium">Email:</span>
									<span class="text-muted-foreground text-sm"
										>{preceptorData.email || 'Not provided'}</span
									>
								</div>
								<div class="flex items-center gap-2">
									<Award class="text-muted-foreground h-4 w-4" />
									<span class="text-sm font-medium">Credentials:</span>
									<span class="text-muted-foreground text-sm"
										>{preceptorData.credentials || 'Not provided'}</span
									>
								</div>
							</div>
							<div class="space-y-2">
								<div class="flex items-center gap-2">
									<Star class="text-muted-foreground h-4 w-4" />
									<span class="text-sm font-medium">Reviews:</span>
									<span class="text-muted-foreground text-sm"
										>{reviewStats().totalReviews} total</span
									>
								</div>
								{#if reviewStats().totalReviews > 0}
									<div class="flex items-center gap-2">
										<Star class="h-4 w-4 text-yellow-500" />
										<span class="text-sm font-medium">Average Rating:</span>
										<span class="text-muted-foreground text-sm"
											>{reviewStats().averageRating.toFixed(1)}/5</span
										>
									</div>
								{/if}
							</div>
						</div>
					</CardContent>
				</Card>
			</div>

			<!-- School affiliations section -->
			<div class="mb-8">
				<Card>
					<CardHeader>
						<CardTitle class="flex items-center justify-between">
							<div class="flex items-center gap-2">
								<School class="h-5 w-5" />
								School Affiliations
							</div>
							<Button variant="outline" size="sm" onclick={openAddSchoolModal}>
								<Plus class="mr-2 h-4 w-4" />
								Add School
							</Button>
						</CardTitle>
					</CardHeader>
					<CardContent>
						{#if schoolAffiliationsLoading}
							<div class="space-y-3">
								{#each Array(2), i (i)}
									<div class="rounded-lg border p-3">
										<div class="flex items-center justify-between">
											<Skeleton class="h-4 w-[200px]" />
											<Skeleton class="h-6 w-[60px]" />
										</div>
									</div>
								{/each}
							</div>
						{:else if schoolAffiliations && schoolAffiliations.length > 0}
							<div class="space-y-3">
								{#each schoolAffiliations as affiliation (affiliation.affiliationId)}
									{#if affiliation.school}
										<div class="flex items-center justify-between rounded-lg border p-3">
											<div>
												<h4 class="font-medium">{affiliation.school.name}</h4>
											</div>
											<div class="flex items-center gap-2">
												<span
													class="rounded-full px-2 py-1 text-xs font-medium {affiliation.isActive
														? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
														: 'bg-muted text-muted-foreground'}"
												>
													{affiliation.isActive ? 'Active' : 'Inactive'}
												</span>
												<DropdownMenu.Root>
													<DropdownMenu.Trigger>
														<Button variant="ghost" size="sm">
															<MoreVertical class="h-4 w-4" />
														</Button>
													</DropdownMenu.Trigger>
													<DropdownMenu.Content align="end">
														<DropdownMenu.Item
															onclick={() =>
																toggleSchoolAffiliationStatus(
																	affiliation.affiliationId,
																	affiliation.isActive
																)}
														>
															{affiliation.isActive ? 'Deactivate' : 'Activate'}
														</DropdownMenu.Item>
														<DropdownMenu.Separator />
														<DropdownMenu.Item
															class="text-destructive"
															onclick={() =>
																openDeleteSchoolModal(
																	affiliation.affiliationId,
																	affiliation.school?.name || 'Unknown School'
																)}
														>
															<Trash2 class="mr-2 h-4 w-4" />
															Remove
														</DropdownMenu.Item>
													</DropdownMenu.Content>
												</DropdownMenu.Root>
											</div>
										</div>
									{/if}
								{/each}
							</div>
						{:else}
							<div class="py-8 text-center">
								<School class="text-muted-foreground mx-auto mb-4 h-12 w-12" />
								<p class="text-muted-foreground mb-4 text-sm">No school affiliations found</p>
								<Button variant="outline" onclick={openAddSchoolModal}>
									<Plus class="mr-2 h-4 w-4" />
									Add First School
								</Button>
							</div>
						{/if}
					</CardContent>
				</Card>
			</div>

			<!-- Practice sites section -->
			<div class="mb-8">
				<Card>
					<CardHeader>
						<CardTitle class="flex items-center gap-2">
							<MapPin class="h-5 w-5" />
							Practice Sites
						</CardTitle>
					</CardHeader>
					<CardContent>
						{#if siteAffiliationsLoading}
							<div class="space-y-4">
								{#each Array(2), i (i)}
									<div class="space-y-3">
										<Skeleton class="h-6 w-[200px]" />
										<div class="ml-4 space-y-2">
											<Skeleton class="h-4 w-full" />
											<Skeleton class="h-4 w-[80%]" />
										</div>
									</div>
								{/each}
							</div>
						{:else if sitesBySchool() && sitesBySchool().length > 0}
							<div class="space-y-6">
								{#each sitesBySchool() as schoolGroup (schoolGroup.school._id)}
									<div class="space-y-3">
										<div class="flex items-center justify-between">
											<h4 class="text-lg font-medium">{schoolGroup.school.name}</h4>
											<Button
												variant="outline"
												size="sm"
												onclick={() =>
													openAddSiteModal(schoolGroup.school._id, schoolGroup.school.name)}
											>
												<Plus class="mr-2 h-4 w-4" />
												Add Site
											</Button>
										</div>
										<div class="ml-4 space-y-2">
											{#each schoolGroup.sites as site (site._id)}
												<div class="flex items-center justify-between rounded-lg border p-3">
													<div>
														<h5 class="font-medium">{site.name}</h5>
														<p class="text-muted-foreground text-sm">{site.city}, {site.state}</p>
													</div>
													<div class="flex items-center gap-2">
														<span
															class="rounded-full px-2 py-1 text-xs font-medium {site.isActive
																? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
																: 'bg-muted text-muted-foreground'}"
														>
															{site.isActive ? 'Active' : 'Inactive'}
														</span>
														<DropdownMenu.Root>
															<DropdownMenu.Trigger>
																<Button variant="ghost" size="sm">
																	<MoreVertical class="h-4 w-4" />
																</Button>
															</DropdownMenu.Trigger>
															<DropdownMenu.Content align="end">
																<DropdownMenu.Item
																	onclick={() =>
																		toggleSiteAffiliationStatus(site.affiliationId, site.isActive)}
																>
																	{site.isActive ? 'Deactivate' : 'Activate'}
																</DropdownMenu.Item>
																<DropdownMenu.Separator />
																<DropdownMenu.Item
																	class="text-destructive"
																	onclick={() => openDeleteSiteModal(site.affiliationId, site.name)}
																>
																	<Trash2 class="mr-2 h-4 w-4" />
																	Remove
																</DropdownMenu.Item>
															</DropdownMenu.Content>
														</DropdownMenu.Root>
													</div>
												</div>
											{/each}
										</div>
									</div>
								{/each}
							</div>
						{:else if schoolAffiliations && schoolAffiliations.length > 0}
							<div class="py-8 text-center">
								<MapPin class="text-muted-foreground mx-auto mb-4 h-12 w-12" />
								<p class="text-muted-foreground mb-4 text-sm">No practice sites found</p>
								<p class="text-muted-foreground mb-4 text-xs">
									Add practice sites for affiliated schools
								</p>
								<div class="flex flex-wrap justify-center gap-2">
									{#each schoolAffiliations.filter((aff) => aff.isActive) as affiliation (affiliation.affiliationId)}
										{#if affiliation.school}
											<Button
												variant="outline"
												size="sm"
												onclick={() =>
													openAddSiteModal(affiliation.school!._id, affiliation.school!.name)}
											>
												<Plus class="mr-2 h-4 w-4" />
												Add Site for {affiliation.school!.name}
											</Button>
										{/if}
									{/each}
								</div>
							</div>
						{:else}
							<div class="py-8 text-center">
								<MapPin class="text-muted-foreground mx-auto mb-4 h-12 w-12" />
								<p class="text-muted-foreground mb-4 text-sm">No practice sites found</p>
								<p class="text-muted-foreground text-xs">
									Add school affiliations first to manage practice sites
								</p>
							</div>
						{/if}
					</CardContent>
				</Card>
			</div>

			<!-- Reviews section -->
			<div class="mb-8">
				<Card>
					<CardHeader>
						<CardTitle class="flex items-center justify-between">
							<div class="flex items-center gap-2">
								<Star class="h-5 w-5" />
								Reviews ({reviewStats().totalReviews})
							</div>
							{#if reviewStats().totalReviews > 0}
								<div class="text-muted-foreground flex items-center gap-4 text-sm">
									<span>Avg: {reviewStats().averageRating.toFixed(1)}/5</span>
									<span>{reviewStats().recommendationRate.toFixed(0)}% recommend</span>
								</div>
							{/if}
						</CardTitle>
					</CardHeader>
					<CardContent>
						{#if reviewsLoading}
							<div class="space-y-4">
								{#each Array(3), i (i)}
									<div class="rounded-lg border p-4">
										<div class="space-y-2">
											<Skeleton class="h-4 w-[200px]" />
											<Skeleton class="h-4 w-full" />
											<Skeleton class="h-4 w-[80%]" />
										</div>
									</div>
								{/each}
							</div>
						{:else if reviewsError}
							<div class="rounded-md border border-destructive/20 bg-destructive/10 p-3">
								<p class="text-sm text-destructive-foreground">Error loading reviews: {reviewsError}</p>
							</div>
						{:else if reviewsData && reviewsData.length > 0}
							<div class="space-y-4">
								{#each reviewsData as review (review._id)}
									<div
										class="rounded-lg border p-4 {review.isOutlier
											? 'border-amber-200 bg-amber-50/50'
											: ''}"
									>
										<div class="flex items-start justify-between">
											<div class="flex-1">
												<!-- Rating and recommendation -->
												<div class="mb-3 flex items-center justify-between">
													<div class="flex items-center gap-3">
														<div class="flex items-center gap-1">
															{#each Array(5), i (i)}
																<Star
																	class="h-4 w-4 {i < review.starRating
																		? 'fill-current text-yellow-400'
																		: 'text-muted-foreground'}"
																/>
															{/each}
														</div>
														<span class="text-sm font-medium">{review.starRating}/5</span>
														<span
															class="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium {review.wouldRecommend
																? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
																: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'}"
														>
															{review.wouldRecommend ? '👍 Recommends' : "👎 Doesn't recommend"}
														</span>
													</div>
													<div class="text-muted-foreground text-xs">
														{new Date(review.createdAt).toLocaleDateString()}
													</div>
												</div>

												<!-- Review context information -->
												<div class="mb-3 grid gap-2 text-sm md:grid-cols-2">
													<div class="space-y-1">
														<p>
															<span class="text-muted-foreground font-medium">School:</span>
															{review.schoolName || 'Unknown School'}
														</p>
														<p>
															<span class="text-muted-foreground font-medium">Site:</span>
															{review.siteName || 'Unknown Site'}
														</p>
														<p>
															<span class="text-muted-foreground font-medium">Experience:</span>
															{review.experienceTypeName}
														</p>
													</div>
													<div class="space-y-1">
														<p>
															<span class="text-muted-foreground font-medium">Rotation:</span>
															{review.rotationTypeName}
														</p>
														<p>
															<span class="text-muted-foreground font-medium">School Year:</span>
															{review.schoolYear}
														</p>
														<p>
															<span class="text-muted-foreground font-medium"
																>Prior Experience:</span
															>
															{review.priorExperience}
														</p>
													</div>
												</div>

												<!-- Detailed ratings -->
												<div class="mb-3 grid grid-cols-2 gap-2 text-sm md:grid-cols-5">
													<div class="text-center">
														<div class="text-muted-foreground text-xs font-medium">Flexibility</div>
														<div class="font-semibold">{review.schedulingFlexibility}/5</div>
													</div>
													<div class="text-center">
														<div class="text-muted-foreground text-xs font-medium">Workload</div>
														<div class="font-semibold">{review.workload}/5</div>
													</div>
													<div class="text-center">
														<div class="text-muted-foreground text-xs font-medium">
															Expectations
														</div>
														<div class="font-semibold">{review.expectations}/5</div>
													</div>
													<div class="text-center">
														<div class="text-muted-foreground text-xs font-medium">Mentorship</div>
														<div class="font-semibold">{review.mentorship}/5</div>
													</div>
													<div class="text-center">
														<div class="text-muted-foreground text-xs font-medium">Enjoyment</div>
														<div class="font-semibold">{review.enjoyment}/5</div>
													</div>
												</div>

												<!-- Extra hours -->
												{#if review.extraHours}
													<div class="text-muted-foreground mb-3 text-sm">
														<span class="font-medium">Extra hours per week:</span>
														{review.extraHours}
													</div>
												{/if}

												<!-- Comment -->
												{#if review.comment}
													<div class="bg-muted mb-3 rounded-md p-3">
														<p class="text-sm">{review.comment}</p>
													</div>
												{/if}

												<!-- Outlier warning -->
												{#if review.isOutlier && review.outlierReason}
													<div class="mb-3 rounded-lg border border-amber-200 bg-amber-100 p-3">
														<div class="mb-1 flex items-center gap-2">
															<span class="text-xs font-bold text-amber-800"
																>⚠️ OUTLIER EXPERIENCE</span
															>
														</div>
														<p class="text-sm text-amber-700">{review.outlierReason}</p>
													</div>
												{/if}

												<!-- Voting information -->
												{#if review.upvoteCount > 0 || review.downvoteCount > 0}
													<div class="text-muted-foreground flex items-center gap-4 text-xs">
														<span>👍 {review.upvoteCount} upvotes</span>
														<span>👎 {review.downvoteCount} downvotes</span>
														<span>Net score: {review.netScore}</span>
													</div>
												{/if}
											</div>

											<!-- Moderation actions -->
											<div class="ml-4">
												<DropdownMenu.Root>
													<DropdownMenu.Trigger>
														<Button variant="ghost" size="sm">
															<MoreVertical class="h-4 w-4" />
														</Button>
													</DropdownMenu.Trigger>
													<DropdownMenu.Content align="end">
														<DropdownMenu.Item
															onclick={() =>
																toggleReviewOutlierStatus(review._id, review.isOutlier)}
														>
															{review.isOutlier ? 'Remove Outlier Flag' : 'Mark as Outlier'}
														</DropdownMenu.Item>
														<DropdownMenu.Separator />
														<DropdownMenu.Item
															class="text-destructive"
															onclick={() => openDeleteReviewModal(review._id, 'Review')}
														>
															<Trash2 class="mr-2 h-4 w-4" />
															Delete Review
														</DropdownMenu.Item>
													</DropdownMenu.Content>
												</DropdownMenu.Root>
											</div>
										</div>
									</div>
								{/each}
							</div>
						{:else}
							<div class="py-8 text-center">
								<Star class="text-muted-foreground mx-auto mb-4 h-12 w-12" />
								<p class="text-muted-foreground text-sm">No reviews found for this preceptor</p>
							</div>
						{/if}
					</CardContent>
				</Card>
			</div>
		{:else}
			<div class="py-12 text-center">
				<p class="text-muted-foreground">Preceptor not found</p>
			</div>
		{/if}
	</div>
</div>

<!-- Edit Modal -->
<EditModal
	isOpen={isEditModalOpen}
	entity={preceptorData
		? {
				fullName: preceptorData.fullName,
				email: preceptorData.email,
				credentials: preceptorData.credentials
			}
		: null}
	mutationName="preceptors.updatePreceptor"
	fields={editFields}
	onClose={closeEditModal}
	onSuccess={handleEditSuccess}
/>

<!-- Add School Affiliation Modal -->
<AddSchoolAffiliationModal
	isOpen={isAddSchoolModalOpen}
	{preceptorId}
	onClose={closeAddSchoolModal}
	onSuccess={handleAddSchoolSuccess}
/>

<!-- Delete School Affiliation Modal -->
{#if selectedAffiliationForDelete}
	<DeleteConfirmationModal
		isOpen={isDeleteSchoolModalOpen}
		entityId={selectedAffiliationForDelete.id}
		entityName={selectedAffiliationForDelete.name}
		entityType="School Affiliation"
		mutationName="preceptorAffiliations.deletePreceptorSchoolAffiliation"
		parameterName="affiliationId"
		onClose={closeDeleteSchoolModal}
		onSuccess={handleDeleteSchoolSuccess}
	/>
{/if}

<!-- Add Practice Site Affiliation Modal -->
{#if selectedSchoolForSite}
	<AddPracticeSiteAffiliationModal
		isOpen={isAddSiteModalOpen}
		{preceptorId}
		schoolId={selectedSchoolForSite.id}
		schoolName={selectedSchoolForSite.name}
		onClose={closeAddSiteModal}
		onSuccess={handleAddSiteSuccess}
	/>
{/if}

<!-- Delete Practice Site Affiliation Modal -->
{#if selectedSiteAffiliationForDelete}
	<DeleteConfirmationModal
		isOpen={isDeleteSiteModalOpen}
		entityId={selectedSiteAffiliationForDelete.id}
		entityName={selectedSiteAffiliationForDelete.name}
		entityType="Practice Site Affiliation"
		mutationName="preceptorAffiliations.deletePreceptorSiteAffiliation"
		parameterName="affiliationId"
		onClose={closeDeleteSiteModal}
		onSuccess={handleDeleteSiteSuccess}
	/>
{/if}

<!-- Delete Review Modal -->
{#if selectedReviewForDelete}
	<DeleteConfirmationModal
		isOpen={isDeleteReviewModalOpen}
		entityId={selectedReviewForDelete.id}
		entityName={selectedReviewForDelete.name}
		entityType="Review"
		mutationName="reviews.deleteReview"
		parameterName="id"
		onClose={closeDeleteReviewModal}
		onSuccess={handleDeleteReviewSuccess}
	/>
{/if}
