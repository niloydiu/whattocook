# whattocook?

High-end, bilingual recipe discovery engine (Next.js + Tailwind).

Quick start:

1. Install dependencies

```bash
npm install
```

2. Run development server

```bash
npm run dev
```

Files of interest:

- `app/page.tsx` — main UI (pantry input, results)
- `components/RecipeCard.tsx` — bilingual recipe card
- `components/LanguageProvider.tsx` — language state provider
- `lib/matching.ts` — matching logic that computes have/need and sorts results
- `data/mockData.ts` — initial mock DB (add real YouTube transcripts here later)
- `app/actions/translateRecipe.ts` — placeholder Server Action for Gemini integration

Notes:

- Add more recipes to `data/mockData.ts` using the schema described in the project brief.
- Replace the placeholder Gemini integration in `app/actions/translateRecipe.ts` when you have API access.

Push to GitHub (quick methods)

1. Using the GitHub CLI `gh` (recommended):

```bash
# make script executable once
chmod +x ./scripts/push_to_github.sh
# create repo under your GitHub account and push
./scripts/push_to_github.sh
```

2. Manual: create a repo at https://github.com/new then run:

```bash
git remote add origin git@github.com:niloydiu/whattocook.git
git branch -M main
git push -u origin main
```

If you want, I can try creating the local git commit here and prepare everything for push.
