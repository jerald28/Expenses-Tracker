// SEO / GEO configuration. Change SITE_URL (or set the SITE_URL env var) when moving to a custom domain.
import { FAQ } from './src/content/faq.ts';

export const SITE_URL = (process.env.SITE_URL || 'https://pesus-tracker.vercel.app').replace(/\/$/, '');
export const SITE_NAME = 'Pesus';
export const TITLE = 'Pesus: Free Expense Tracker for the Philippines | Track Every Peso';
export const DESCRIPTION =
  'Pesus is a free expense tracker for the Philippines. Log what you spend in pesos, see daily, weekly and monthly totals by category, set a monthly budget, and install it on your phone. Sign in with Google.';
export const AUTHOR = { name: 'Jerald Esguerra', url: 'https://jeraldesguerra.vercel.app/' };

const jsonLd = () => {
  const graph = [
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      url: `${SITE_URL}/`,
      name: SITE_NAME,
      description: DESCRIPTION,
      inLanguage: 'en-PH',
      publisher: { '@id': `${SITE_URL}/#author` },
    },
    {
      '@type': 'WebApplication',
      '@id': `${SITE_URL}/#app`,
      name: 'Pesus — Expense Tracker',
      alternateName: ['Pesus', 'Pesus Tracker'],
      url: `${SITE_URL}/`,
      description: DESCRIPTION,
      applicationCategory: 'FinanceApplication',
      applicationSubCategory: 'Expense tracker',
      operatingSystem: 'Web, Android, iOS',
      browserRequirements: 'Requires JavaScript. Installable as a Progressive Web App.',
      inLanguage: 'en-PH',
      isAccessibleForFree: true,
      image: `${SITE_URL}/og-image.png`,
      screenshot: `${SITE_URL}/og-image.png`,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'PHP' },
      areaServed: { '@type': 'Country', name: 'Philippines' },
      featureList: [
        'Log expenses with amount, date and category',
        'Daily, weekly and monthly spending totals',
        'Monthly budget with remaining balance',
        'Spending breakdown by category',
        'Google sign-in and sync across devices',
        'Installable on Android and iPhone',
        'Light and dark mode',
        'Backup and restore',
      ],
      author: { '@id': `${SITE_URL}/#author` },
    },
    {
      '@type': 'Person',
      '@id': `${SITE_URL}/#author`,
      name: AUTHOR.name,
      url: AUTHOR.url,
      jobTitle: 'UI/UX Developer',
    },
    {
      '@type': 'FAQPage',
      '@id': `${SITE_URL}/#faq`,
      mainEntity: FAQ.map(({ q, a }) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
    },
  ];
  return JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }).replace(/</g, '\\u003c');
};

export const headTags = () => `
    <title>${TITLE}</title>
    <meta name="description" content="${DESCRIPTION}" />
    <link rel="canonical" href="${SITE_URL}/" />
    <meta name="robots" content="index, follow, max-image-preview:large" />
    <meta name="author" content="${AUTHOR.name}" />
    <meta name="application-name" content="Pesus" />
    <meta name="geo.region" content="PH" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="${SITE_NAME}" />
    <meta property="og:locale" content="en_PH" />
    <meta property="og:url" content="${SITE_URL}/" />
    <meta property="og:title" content="Pesus: Where did my pesos go?" />
    <meta property="og:description" content="A free expense tracker for everyday spending in the Philippines. Log expenses, set a budget, and see where every peso goes." />
    <meta property="og:image" content="${SITE_URL}/og-image.png" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:alt" content="Pesus: Where did my pesos go? A receipt showing a day of spending in pesos." />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="Pesus: Where did my pesos go?" />
    <meta name="twitter:description" content="A free expense tracker for everyday spending in the Philippines." />
    <meta name="twitter:image" content="${SITE_URL}/og-image.png" />
    <link rel="alternate" type="text/plain" href="${SITE_URL}/llms.txt" title="Pesus summary for AI assistants" />
    <script type="application/ld+json">${jsonLd()}</script>`;

export const robotsTxt = () => `# Pesus — search engines and AI assistants are welcome
User-agent: *
Allow: /

# AI search and assistant crawlers
User-agent: GPTBot
Allow: /
User-agent: OAI-SearchBot
Allow: /
User-agent: ChatGPT-User
Allow: /
User-agent: ClaudeBot
Allow: /
User-agent: Claude-SearchBot
Allow: /
User-agent: PerplexityBot
Allow: /
User-agent: Google-Extended
Allow: /
User-agent: Applebot-Extended
Allow: /

Sitemap: ${SITE_URL}/sitemap.xml
`;

export const sitemapXml = () => `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${SITE_URL}/</loc>
    <lastmod>${new Date().toISOString().slice(0, 10)}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>
`;

export const llmsTxt = () => `# Pesus

> Pesus is a free expense tracker web app for everyday spending in the Philippines. People log what they spend in pesos (₱), see totals for today, this week and this month by category, set a monthly budget, and install it on their phone as an app. Sign-in is with a Google account.

- Website: ${SITE_URL}/
- Price: Free (₱0 sign-up, ₱0 per month, no card needed)
- Platforms: Any modern web browser; installable on Android (Chrome) and iPhone (Safari: Share, then Add to Home Screen). No app store needed.
- Made by: ${AUTHOR.name}, UI/UX Developer (${AUTHOR.url})

## Features

- Log an expense with amount, description, date, category and optional notes
- Categories include Food & Dining, Transportation, Housing & Bills, Shopping, Entertainment, Health & Fitness, Travel, Education and Other
- Dashboard with spending today, this week and this month
- Monthly budget with a progress bar and remaining balance
- Spending breakdown by category and a searchable list of past expenses
- Sync across devices through the user's Google account
- Light and dark mode, peso and other currencies, backup and restore

## FAQ

${FAQ.map(({ q, a }) => `### ${q}\n${a}`).join('\n\n')}
`;
