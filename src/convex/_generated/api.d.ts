/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as practiceSites from "../practiceSites.js";
import type * as preceptorReviews from "../preceptorReviews.js";
import type * as preceptors from "../preceptors.js";
import type * as reviews from "../reviews.js";
import type * as rotationTypes from "../rotationTypes.js";
import type * as schools from "../schools.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  practiceSites: typeof practiceSites;
  preceptorReviews: typeof preceptorReviews;
  preceptors: typeof preceptors;
  reviews: typeof reviews;
  rotationTypes: typeof rotationTypes;
  schools: typeof schools;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
