# RateMyPreceptor

_A community-driven platform for students to anonymously review clinical preceptors._

---

## 🌟 Our Mission: Transparency in Clinical Education

Clinical rotations are a critical part of a student's journey, but they often feel like a black box. Who are the best teachers? Which sites offer the most hands-on experience? Which preceptors provide the mentorship needed to thrive?

**RateMyPreceptor** was created to answer these questions. We believe that by sharing our experiences, we can empower students to find the best learning environments while helping preceptors and institutions identify areas for improvement. Our mission is to create a transparent, honest, and constructive feedback loop that benefits everyone involved in clinical education.

## 👥 Who Is This For?

This platform is designed for any student in a program with a clinical or fieldwork component, including:

- Medical Students (MD, DO)
- Physician Assistant Students (PA)
- Nursing Students (RN, NP, DNP)
- Pharmacy Students (PharmD)
- Optometry Students (OD)
- And many other healthcare disciplines!

## ✨ Features

- **Truly Anonymous Reviews**: Share your honest experiences without fear of reprisal. Your identity is never stored with your review.
- **Multi-faceted Ratings**: Go beyond a simple star rating. Evaluate preceptors on key metrics like mentorship, clinical reasoning, scheduling flexibility, and the overall learning environment.
- **Powerful Search & Discovery**: Easily find the preceptors and practice sites you're looking for. Filter by school, program, or location to narrow your search.
- **Actionable Insights**: See detailed scores and read qualitative feedback to get a clear and nuanced understanding of each preceptor.
- **Community-Powered**: Every review you contribute builds the database, creating a more valuable resource for the students who come after you.

---

## 🛠️ Tech Stack

| Layer                | Tool                                     | Why                                 |
| -------------------- | ---------------------------------------- | ----------------------------------- |
| **Frontend**         | [SvelteKit v5](https://kit.svelte.dev/)  | Fast, file-based routing, runes 🚀  |
| **Realtime backend** | [Convex](https://convex.dev/)            | Type-safe, serverless, live queries |
| **Auth**             | [Clerk](https://clerk.com/)              | Drop-in UI, JWTs for Convex         |
| **Styling**          | [Tailwind CSS](https://tailwindcss.com/) | Utility-first workflow              |
| **Build**            | [Vite](https://vitejs.dev/)              | Lightning-fast HMR                  |
| **Analytics**        | [PostHog](https://posthog.com/)          | Product analytics & feature flags   |

---

## 🚀 Getting Started (local dev)

### 1 Clone & install

```bash
git clone https://github.com/your-username/ratemypreceptor.git
cd ratemypreceptor
npm install              # or pnpm / bun
```

### 2 Environment variables

Create **both** files below (keep `.env.local` out of git):

<details><summary><code>.env.example</code> – committed</summary>

```bash
# ===== Convex =====
CONVEX_DEPLOYMENT=
PUBLIC_CONVEX_URL=

# ===== Clerk =====
PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=

# ===== PostHog =====
PUBLIC_POSTHOG_KEY=
# PUBLIC_POSTHOG_HOST=https://app.posthog.com   # optional

# ===== Misc =====
PUBLIC_ENVIRONMENT_TYPE=development
```

</details>

<details><summary><code>.env.local</code> – your real secrets</summary>

Populate each variable with the values from your Convex and Clerk dashboards.
**Never commit this file.**

</details>

> **Tip:** The first run of `npx convex dev` will auto-populate `CONVEX_DEPLOYMENT` and `PUBLIC_CONVEX_URL` if they’re blank.

### 3 One-time backend init

```bash
# Log in / create dev deployment (fills env vars, then exits)
npx convex dev --once

# Push schema if you added or changed tables
npx convex push
```

### 4 Run everything

Add this to `package.json`:

```json
"scripts": {
  "dev": "concurrently \"npx convex dev\" \"svelte-kit dev\""
}
```

Then start:

```bash
npm run dev
```

- **Frontend:** <http://localhost:5173>
- **Convex worker:** <http://localhost:6789> (auto-reloads on function edits)

### 5 Sign-in flow

1. In **Clerk Dashboard → API Keys**, copy your **Publishable** and **Secret** keys into `.env.local`.
2. Refresh the site – Clerk components should render and allow login.
3. If you set `PUBLIC_POSTHOG_KEY`, events will stream to PostHog.

---

## 🏗️ Production Checklist

| Step                        | What to do                                                                                         |
| --------------------------- | -------------------------------------------------------------------------------------------------- |
| **Convex deploy**           | `npx convex deploy` → generates `https://<slug>.convex.cloud`                                      |
| **Secrets**                 | In Convex → _Settings → Environment_, add `CLERK_SECRET_KEY`, PostHog keys, etc.                   |
| **PUBLIC_ENVIRONMENT_TYPE** | Set to `production` for feature flags / analytics filtering.                                       |
| **CI**                      | Example: in Vercel, run `convex deploy --yes --dry-run` during build to catch schema errors early. |

---

## 🤝 Contributing

PRs and issues are welcome!
For significant changes, please open an issue first to discuss what you’d like to improve.

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
