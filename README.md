# Haokun Liu / 刘昊坤 — Machine Learning Engineer Portfolio

A static, bilingual portfolio built with **Astro 7, TypeScript, and Tailwind CSS 4** for the root GitHub Pages domain `https://haokunliu-vincent.github.io/`.

The design uses a white background, dark typography, restrained blue accents, system fonts, generous spacing, and responsive architecture diagrams. All content is rendered at build time. Navigation and language switching work without JavaScript.

## Local development

Use Node.js **24 LTS** (`.nvmrc` is included) and npm. Astro requires Node.js 22.23.4 or later.

```sh
nvm use
npm ci
npm run dev
```

Open [English home](http://127.0.0.1:4321/en/) or [中文首页](http://127.0.0.1:4321/zh/). The `/` entry forwards to `/en/`, regardless of browser language or previous visits.

```sh
npm run check     # Astro and strict TypeScript diagnostics
npm run build     # Generate the static site in dist/
npm test          # Verify the generated site; build first
npm run verify    # All three commands, in order
npm run preview  # Serve the production build locally
```

In a restricted environment that blocks Astro's user preferences directory, prepend `ASTRO_TELEMETRY_DISABLED=1` to the command. The CI workflows already set this variable.

## Pages and language behavior

| Page | English | Simplified Chinese |
| --- | --- | --- |
| Home | `/en/` | `/zh/` |
| Projects | `/en/projects/` | `/zh/projects/` |
| About | `/en/about/` | `/zh/about/` |
| Contact | `/en/contact/` | `/zh/contact/` |
| Agentic recommendation case study | `/en/projects/agentic-commerce/` | `/zh/projects/agentic-commerce/` |
| Recommendation pipeline case study | `/en/projects/recommendation-pipeline/` | `/zh/projects/recommendation-pipeline/` |

The language switcher uses ordinary, keyboard-accessible links and preserves the page, including the case study. The Chinese route prefix is `zh`; its HTML language and `hreflang` identifier are `zh-CN`. There is no runtime translation service, browser-language detection, or stored language preference.

Each localized page has its own title, description, canonical URL, English/Chinese alternates, and `x-default` pointing to English. Open Graph and Twitter metadata are included. The generated 1200 × 630 PNG is language neutral. `/sitemap.xml` includes all twelve localized pages and their alternate-language links; `/robots.txt` references it. A bilingual `404.html` is included for GitHub Pages.

## Personalize the content

### Identity and links

Edit [`src/config/site.json`](src/config/site.json):

```json
{
  "url": "https://haokunliu-vincent.github.io",
  "name": {
    "en": "Haokun Liu",
    "zh": "刘昊坤"
  },
  "initials": "HL",
  "links": {
    "github": "https://github.com/HaokunLiu-Vincent",
    "linkedin": "https://www.linkedin.com/in/haokun-liu-75396b272/",
    "email": "vincent241119@gmail.com"
  },
  "positioning": {
    "en": "Machine Learning Engineer | Recommendation Systems | Agentic AI | MLOps",
    "zh": "机器学习工程师 | 推荐系统 | Agentic AI | MLOps"
  },
  "projectRepositories": {
    "agentic-commerce": null,
    "recommendation-pipeline": null
  }
}
```

Use full `https://` URLs for web links and a plain address for email (the site adds `mailto:`). Leave unknown values as `null`. Missing links render as clearly labeled text, so visitors never encounter a fake destination. The verified contact links are active in both languages. Repository URLs are configured separately in `projectRepositories`, keyed by project ID; keep them `null` until the actual repository is known. Each case study shows a repository link only when its own URL is configured. The brand name, footer, and SEO author use the same configuration. Update the favicon in `public/favicon.svg` if desired.

The production origin is configured as `https://haokunliu-vincent.github.io`. Canonical URLs, language alternates, the sitemap, and social-image URLs use this origin. Keep `base: '/'` for this root-domain repository. A `SITE_URL` environment variable can override it at build time; the deployment workflow uses the origin supplied by GitHub Pages.

### English and Chinese copy

- [`src/i18n/en.ts`](src/i18n/en.ts): English UI, biography, interests, project case study, contact copy, and SEO.
- [`src/i18n/zh.ts`](src/i18n/zh.ts): Reviewed static Simplified Chinese equivalents.
- [`src/i18n/types.ts`](src/i18n/types.ts): Shared content shape; missing translation keys fail TypeScript checking.
- [`src/i18n/index.ts`](src/i18n/index.ts): Locale identifiers, page paths, and URL helpers.

Edit both locale files together. Technical terms such as MLOps, DeepFM, Faiss, and Reinforcement Learning are retained where useful. Chinese pages use PingFang SC, Hiragino Sans GB, Microsoft YaHei, and Noto Sans CJK SC system-font fallbacks. No font is downloaded.

### Content awaiting verification

Verified identity and contact details are configured for Haokun Liu / 刘昊坤. Education is listed with the Master of Artificial Intelligence (NLP) at UTS **in progress**, followed by the Information and Computing Science bachelor's degree at Beihang University. No study dates, GPA, honours, or awards are inferred.

The homepage features exactly two projects, in order: **Agentic E-Commerce Recommendation System**, then **Full-Stack E-Commerce Recommendation Pipeline**. Each has its own translated case study and planned architecture diagram. Both projects are **under development**.

The pipeline's specified design is seven retrieval channels → LambdaMART using LightGBM → DeepFM. Individual channel algorithms, dataset details, features, training configurations, and completed implementation milestones are still unspecified. The agent's shopping workflows are intended functionality, including favourites, cart, delivery, and checkout; they are not described as completed integrations.

The following remain genuinely missing:

- The two project repository URLs.
- Verified employment/engineering experience and dates.
- Dataset sources, experiment artifacts, implementation milestones, and measured results.
- Cloud provider, infrastructure details, and verified deployment status.

Evaluation tables are plans with **no reported results**. Cloud deployment is planned. Update both languages only when implementation or performance claims can be supported by evidence.

After adding real results, update the case-study content and the corresponding evidence-preservation test in `tests/site.test.mjs` to verify the new data and labels.

## Project structure

```text
.github/workflows/
  verify.yml                 # Check/build/test on PRs and master/main pushes
  deploy.yml                 # Manual GitHub Pages deployment
public/
  .nojekyll
  favicon.svg
src/
  components/                # Header, language links, diagram, project feature, footer
  config/site.json           # Identity, origin, and external links
  i18n/                      # Typed English/Chinese dictionaries and routes
  layouts/Layout.astro       # Document, metadata, and shared page frame
  pages/
    [locale]/[...page].astro # Generate equivalent static pages for both languages
    index.astro              # English entry redirect (works without JavaScript)
    404.astro
    og.png.ts                # Build-time social image generation using Sharp
    robots.txt.ts
    sitemap.xml.ts
  styles/global.css          # Tailwind theme and responsive component styles
  views/                     # Home, Projects, About, Contact, CaseStudy
tests/site.test.mjs           # Checks against actual production output
```

To add a new top-level page, add its key to `Page` and `pagePaths`, provide SEO/content in both dictionaries, create a view, and register it in the route's `views` map. Extend the generated-page tests. Project content lives in the typed `projects` array in each dictionary. To add another project, extend `ProjectId` and `ProjectPage`, add a `pagePaths` entry and SEO in both languages, add its content to both arrays, and add its repository key in `site.json`. The shared case-study view and architecture component render each project from that content. Keep IDs, route slugs, and ordering consistent across languages and extend the route/content tests.

## GitHub Pages deployment

**Nothing has been pushed or published.** Deployment is manual by default; pushing code only runs verification.

When the design and content are approved:

1. Use the existing **`HaokunLiu-Vincent/HaokunLiu-Vincent.github.io`** repository. This configuration targets `https://haokunliu-vincent.github.io/`; it intentionally has no repository subpath.
2. Fill in `src/config/site.json`, review both translations, and run `npm run verify` locally.
3. After approval, commit and push the reviewed source, including `package-lock.json`, on the existing `master` branch. The destination Git history and remote are preserved; do not reinitialize the repository or force-push. Verification supports both `master` and `main` if the branch is renamed later.
4. In the repository, open **Settings → Pages → Build and deployment → Source → GitHub Actions**.
5. Open **Actions → Deploy to GitHub Pages → Run workflow**, select the reviewed `master` revision, and run it.
6. The workflow checks the root-domain repository name, installs locked dependencies, checks types, builds, tests the output, uploads `dist/`, and deploys it to the `github-pages` environment. Its output provides the live URL.

The deploy job uses the standard `pages: write` and `id-token: write` permissions. For a separate human approval on every deployment, configure required reviewers on the `github-pages` environment in repository settings where your GitHub plan supports it. To enable automatic deployment later, deliberately add a `push` trigger to `deploy.yml`; it is omitted in this initial version.

This setup targets **user/organization root sites**, not `username.github.io/repository/`. The deployment guard rejects a different repository name. Supporting a repository subpath requires updating `base` and all URL/asset helpers together.

Official references: [Astro on GitHub Pages](https://docs.astro.build/en/guides/deploy/github/), [GitHub Pages custom workflows](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages), [Astro i18n](https://docs.astro.build/en/guides/internationalization/), [Tailwind with Astro](https://tailwindcss.com/docs/installation/framework-guides/astro).

## Local migration

The Astro site was copied from the sibling `personal_page/` directory into this repository root. All 39 source/configuration files were copied; `node_modules`, `dist`, `.astro`, `.qa`, and other caches were excluded. Dependencies and output are generated afresh here.

The destination was already empty of tracked files at commit `9e76b954645b7de1fbb24068f700fc76378bfb7d` (`Remove old Jekyll website`). No additional legacy files needed deletion. The existing `.git` directory, `master` branch, history, remote, and uncommitted `.DS_Store` were preserved. The original `personal_page/` directory is unchanged.

Before copying, a full repository backup (including `.git` and uncommitted files) and a SHA-256 manifest were saved in the sibling `portfolio-migration-backups/` directory. Backups are outside the website repository and will not be published. The production URL, branch-aware verification trigger, this README, and a narrow-screen CSS correction differ from the source portfolio. At widths of 360px and below, the case-study title uses a smaller font and the full architecture diagram stacks vertically to keep text readable without horizontal overflow.

## Verification and maintenance

`npm run verify` checks every translated route, language-switch destination, HTML language, canonical and alternate URLs, SEO metadata, internal asset/link/fragment destination, missing-link behavior, 404, sitemap, and social-image dimensions. It also checks that the initial case study clearly separates proposals from reported evidence.

Review English and Chinese at desktop, tablet, and narrow mobile widths after layout or copy changes. Confirm keyboard focus, the skip link, navigation, and the language switcher. Keep the pure white theme and dark text consistent in both languages. Do not add metrics, dates, employment, or deployment claims without verifying them.

Use `npm audit` when updating dependencies, retain the lockfile, and rerun `npm run verify`. Astro/Tailwind generate optimized CSS and static HTML; no production application server, runtime API keys, or translation API is needed. Sharp runs only during the build to create the social preview image.
