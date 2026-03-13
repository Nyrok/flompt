import type { FlomptNode, BlockType } from '@/types/blocks'

// ── Types ────────────────────────────────────────────────────────────────────

export interface TemplateMeta { name: string; description: string }

export interface Template {
  id: string
  i18n: { en: TemplateMeta; fr: TemplateMeta } & Record<string, TemplateMeta>
  category: TemplateCategory
  nodes: FlomptNode[]
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function n(type: BlockType, content: string, idx: number): FlomptNode {
  return {
    id: `tpl-${type}-${idx}`,
    type: 'block',
    position: { x: 60, y: 60 + idx * 185 },
    data: { type, label: type, description: '', content },
  }
}

function meta(en: string, enDesc: string, fr: string, frDesc: string): Template['i18n'] {
  return { en: { name: en, description: enDesc }, fr: { name: fr, description: frDesc } }
}

// ── Categories ────────────────────────────────────────────────────────────────

export const TEMPLATE_CATEGORIES = [
  'all', 'writing', 'code', 'marketing', 'productivity',
  'design', 'education', 'sales', 'data', 'creative', 'personal',
] as const
export type TemplateCategory = typeof TEMPLATE_CATEGORIES[number]

export const CATEGORY_COLORS: Record<string, string> = {
  writing:      '#c084fc',
  code:         '#4ade80',
  marketing:    '#ff6b9d',
  productivity: '#fbbf24',
  design:       '#38bdf8',
  education:    '#f97316',
  sales:        '#a3e635',
  data:         '#22d3ee',
  creative:     '#fb7185',
  personal:     '#e879f9',
}

// ── Language mapping (locale code → English name for the language block) ──────

export const LOCALE_TO_LANG: Record<string, string> = {
  en: 'English', fr: 'French',  es: 'Spanish',    de: 'German',
  it: 'Italian', pt: 'Portuguese', zh: 'Chinese', ja: 'Japanese',
  ko: 'Korean',  ar: 'Arabic',  ru: 'Russian',     nl: 'Dutch',
  pl: 'Polish',  sv: 'Swedish', tr: 'Turkish',     hi: 'Hindi',
}

// ══════════════════════════════════════════════════════════════════════════════
// TEMPLATES
// ══════════════════════════════════════════════════════════════════════════════

export const TEMPLATES: Template[] = [

  // ── WRITING ─────────────────────────────────────────────────────────────────

  {
    id: 'blog-post',
    i18n: meta('Blog Post', 'Write a structured, SEO-friendly blog post on any topic.',
               'Article de blog', 'Rédigez un article de blog structuré et optimisé SEO.'),
    category: 'writing',
    nodes: [
      n('role',          'You are an expert content writer and SEO specialist with 10 years of experience.', 0),
      n('audience',      'General readers interested in the topic, ranging from beginners to intermediate level.', 1),
      n('objective',     'Write a complete, engaging blog post on the topic provided in the Input block.', 2),
      n('input',         '{{topic}} — e.g. "The future of AI in healthcare"', 3),
      n('constraints',   '- 800–1200 words\n- Intro + 3–4 sections with H2 headings + conclusion\n- Simple, clear language\n- No clickbait titles', 4),
      n('output_format', 'Markdown: H1 title, H2 sections, short paragraphs, CTA at the end.', 5),
    ],
  },
  {
    id: 'professional-email',
    i18n: meta('Professional Email', 'Draft a clear, professional email for any business situation.',
               'Email professionnel', 'Rédigez un email professionnel clair pour toute situation.'),
    category: 'writing',
    nodes: [
      n('role',        'You are a professional business communication expert.', 0),
      n('audience',    '{{recipient}} — e.g. "a client", "my manager", "a new hire"', 1),
      n('objective',   'Write a professional email based on the context provided.', 2),
      n('context',     '{{email purpose}} — e.g. "Following up on a proposal sent last week with no response."', 3),
      n('constraints', '- Under 150 words\n- Direct and polite tone\n- One clear call-to-action\n- No jargon or filler phrases', 4),
    ],
  },
  {
    id: 'cover-letter',
    i18n: meta('Cover Letter', 'Write a compelling, personalized cover letter for a job application.',
               'Lettre de motivation', 'Rédigez une lettre de motivation percutante et personnalisée.'),
    category: 'writing',
    nodes: [
      n('role',        'You are a career coach who crafts cover letters that get interviews.', 0),
      n('audience',    'Hiring manager at {{company name}}.', 1),
      n('objective',   'Write a tailored cover letter for the job application described in the Input block.', 2),
      n('input',       '{{job title + key requirements}} and {{candidate background: skills, experience, achievements}}', 3),
      n('constraints', '- 3 paragraphs max (hook, fit, closing)\n- Under 300 words\n- Reference the role and company specifically\n- No clichés ("hard worker", "team player")', 4),
    ],
  },
  {
    id: 'explain-concept',
    i18n: meta('Explain a Concept', 'Break down any complex topic for a specific audience.',
               'Expliquer un concept', 'Simplifiez n\'importe quel sujet complexe pour votre audience.'),
    category: 'writing',
    nodes: [
      n('role',             'You are an expert teacher who excels at making complex concepts simple.', 0),
      n('audience',         '{{audience level}} — e.g. "a 12-year-old", "a non-technical CEO"', 1),
      n('input',            '{{concept to explain}} — e.g. "How transformers work in AI"', 2),
      n('chain_of_thought', 'Start with a relatable analogy. Build layer by layer. End with one key takeaway.', 3),
      n('constraints',      '- No jargon unless explained immediately\n- Use analogies and real examples\n- Max 400 words', 4),
    ],
  },
  {
    id: 'story-outline',
    i18n: meta('Story Outline', 'Generate a structured narrative outline for any story or novel.',
               'Plan narratif', 'Créez un plan narratif structuré pour n\'importe quelle histoire.'),
    category: 'writing',
    nodes: [
      n('role',        'You are a creative writing coach and story structure expert (Save the Cat, Hero\'s Journey).', 0),
      n('objective',   'Create a detailed story outline based on the premise and genre in the Input block.', 1),
      n('input',       '{{genre}} + {{one-sentence premise}} — e.g. "Thriller: A hacker discovers their company caused a global blackout."', 2),
      n('constraints', '- 3-act structure\n- Define: protagonist, antagonist, conflict, stakes\n- 5–7 key turning points\n- 1–2 sentences per beat', 3),
      n('output_format', 'Act I / Act II / Act III with labeled beats. Each: title + 1–2 sentence description.', 4),
    ],
  },
  {
    id: 'press-release',
    i18n: meta('Press Release', 'Write a professional press release for any announcement.',
               'Communiqué de presse', 'Rédigez un communiqué de presse professionnel pour toute annonce.'),
    category: 'writing',
    nodes: [
      n('role',        'You are a PR specialist who writes press releases that get picked up by journalists.', 0),
      n('audience',    'Tech and business journalists at {{target publications}}.', 1),
      n('objective',   'Write a press release for the announcement described in the Input block.', 2),
      n('input',       '{{announcement: what, who, when, where, why it matters}}', 3),
      n('constraints', '- Inverted pyramid: most important info first\n- Quote from a spokesperson\n- Under 400 words\n- No hype — journalistic, factual tone', 4),
      n('output_format', 'FOR IMMEDIATE RELEASE · Headline · Subheadline · Lead · Body · Quote · About · Contact', 5),
    ],
  },
  {
    id: 'essay-intro',
    i18n: meta('Essay Introduction', 'Write a compelling introduction for any academic or opinion essay.',
               'Introduction d\'essai', 'Rédigez une introduction percutante pour tout essai.'),
    category: 'writing',
    nodes: [
      n('role',        'You are an academic writing tutor who helps students write compelling essays.', 0),
      n('audience',    '{{audience}} — e.g. "university professor", "general public"', 1),
      n('input',       '{{essay topic and thesis}} — e.g. "Social media harms teenagers. Thesis: platforms exploit psychological vulnerabilities."', 2),
      n('constraints', '- Hook (surprising fact, question, or quote)\n- Context (2–3 sentences)\n- Clear thesis statement at the end\n- 150–200 words total', 3),
    ],
  },
  {
    id: 'linkedin-post',
    i18n: meta('LinkedIn Post', 'Write an engaging, authentic LinkedIn post that drives engagement.',
               'Post LinkedIn', 'Rédigez un post LinkedIn engageant et authentique.'),
    category: 'writing',
    nodes: [
      n('role',        'You are a LinkedIn content strategist known for high-engagement posts.', 0),
      n('audience',    '{{professional audience}} — e.g. "startup founders", "software engineers"', 1),
      n('input',       '{{topic, story or insight to share}}', 2),
      n('constraints', '- Hook as the first line (no "I\'m excited to announce")\n- Personal story or data point\n- Max 1300 characters\n- 3–5 hashtags at the end\n- End with a question to drive comments', 3),
    ],
  },
  {
    id: 'faq-generator',
    i18n: meta('FAQ Generator', 'Generate a comprehensive FAQ section for any product or service.',
               'Générateur de FAQ', 'Générez une FAQ complète pour n\'importe quel produit ou service.'),
    category: 'writing',
    nodes: [
      n('role',        'You are a UX writer and customer experience specialist.', 0),
      n('objective',   'Generate a comprehensive FAQ section for the product/service described in the Input block.', 1),
      n('input',       '{{product/service name + description + target audience}}', 2),
      n('constraints', '- 10–15 questions minimum\n- Cover: pricing, how it works, edge cases, troubleshooting\n- Conversational, human tone\n- Answers under 50 words each', 3),
      n('output_format', 'Q: [question]\nA: [concise answer]\n\n(repeated for each question)', 4),
    ],
  },
  {
    id: 'apology-letter',
    i18n: meta('Apology Letter', 'Write a sincere, professional apology for any situation.',
               'Lettre d\'excuse', 'Rédigez des excuses sincères et professionnelles.'),
    category: 'writing',
    nodes: [
      n('role',        'You are an expert in conflict resolution and professional communication.', 0),
      n('audience',    '{{recipient}} — e.g. "a disappointed client", "a colleague", "a partner"', 1),
      n('context',     '{{what happened and the impact it caused}}', 2),
      n('constraints', '- Acknowledge the mistake specifically — no vague apologies\n- Take full responsibility (no "if you were offended")\n- State what you will do differently\n- Under 200 words', 3),
    ],
  },

  // ── CODE ─────────────────────────────────────────────────────────────────────

  {
    id: 'code-review',
    i18n: meta('Code Review', 'Review code for bugs, security issues and best practices.',
               'Revue de code', 'Analysez du code pour les bugs, problèmes de sécurité et bonnes pratiques.'),
    category: 'code',
    nodes: [
      n('role',             'You are a senior software engineer specializing in code quality and security.', 0),
      n('objective',        'Review the code in the Input block and identify all issues.', 1),
      n('input',            '{{paste your code here}}', 2),
      n('constraints',      '- Cover: bugs, security, performance, readability\n- One sentence per finding\n- Critical issues first\n- Skip purely stylistic nitpicks', 3),
      n('chain_of_thought', 'Scan for bugs first, then security, then performance, then style.', 4),
      n('output_format',    '🔴 Critical · 🟡 Warning · 🟢 Suggestion\nEnd with a 2-sentence overall assessment.', 5),
    ],
  },
  {
    id: 'unit-tests',
    i18n: meta('Unit Test Writer', 'Generate comprehensive unit tests for any function or class.',
               'Générateur de tests', 'Générez des tests unitaires complets pour toute fonction.'),
    category: 'code',
    nodes: [
      n('role',        'You are a senior developer who writes clean, comprehensive unit tests.', 0),
      n('objective',   'Write unit tests for the code in the Input block.', 1),
      n('input',       '{{paste the function or class to test}}', 2),
      n('context',     '{{testing framework}} — e.g. "Jest + TypeScript", "pytest", "JUnit"', 3),
      n('constraints', '- Cover: happy path, edge cases, error cases, boundary values\n- Descriptive test names\n- AAA pattern: Arrange / Act / Assert', 4),
    ],
  },
  {
    id: 'sql-query',
    i18n: meta('SQL Query', 'Generate a SQL query from a plain English description.',
               'Requête SQL', 'Générez une requête SQL depuis une description en langage naturel.'),
    category: 'code',
    nodes: [
      n('role',        'You are a database expert proficient in SQL.', 0),
      n('objective',   'Write the SQL query that matches the request in the Input block.', 1),
      n('input',       '{{describe what you want to query}} — e.g. "Top 10 users by order value in the last 30 days"', 2),
      n('context',     '{{schema}} — e.g. "users(id, name), orders(id, user_id, total, created_at)"', 3),
      n('constraints', '- PostgreSQL syntax unless specified\n- Comment each major clause\n- Handle NULLs and edge cases', 4),
      n('output_format', 'SQL in a code block + plain-English explanation.', 5),
    ],
  },
  {
    id: 'debug-assistant',
    i18n: meta('Debug Assistant', 'Diagnose an error, find root cause, and get a fix.',
               'Assistant débogage', 'Diagnostiquez une erreur, trouvez la cause racine et obtenez un correctif.'),
    category: 'code',
    nodes: [
      n('role',             'You are a debugging expert who methodically tracks down root causes.', 0),
      n('objective',        'Diagnose the error in the Input block and provide a complete fix.', 1),
      n('input',            '{{error message or stack trace}}\n\n{{relevant code snippet}}', 2),
      n('chain_of_thought', 'Identify error type → trace to root cause (not symptom) → propose minimal fix.', 3),
      n('output_format',    '1. Root cause (1–2 sentences)\n2. Fixed code (with inline comments on changed lines)\n3. Prevention tip (1 sentence)', 4),
    ],
  },
  {
    id: 'readme-generator',
    i18n: meta('README Generator', 'Generate a professional README.md for any project.',
               'Générateur README', 'Générez un README.md professionnel pour n\'importe quel projet.'),
    category: 'code',
    nodes: [
      n('role',        'You are a developer advocate who writes clear, developer-friendly documentation.', 0),
      n('objective',   'Write a complete README.md for the project in the Input block.', 1),
      n('input',       '{{project name + description + key features + tech stack}}', 2),
      n('constraints', '- Clear and scannable\n- Include real code examples\n- Add badges if relevant', 3),
      n('output_format', 'Markdown: Title + Badges, Description, Features, Installation, Usage, Configuration, Contributing, License.', 4),
    ],
  },
  {
    id: 'commit-message',
    i18n: meta('Commit Message', 'Write a clear, conventional commit message from a diff or description.',
               'Message de commit', 'Rédigez un message de commit clair et conventionnel.'),
    category: 'code',
    nodes: [
      n('role',        'You are a senior developer who writes precise, conventional commit messages.', 0),
      n('input',       '{{paste your git diff or describe your changes}}', 1),
      n('constraints', '- Conventional Commits: type(scope): description\n- Subject max 72 chars\n- Imperative mood\n- Body explains Why, not What', 2),
      n('output_format', 'Subject line only if simple. Subject + body if context needed.', 3),
    ],
  },
  {
    id: 'api-docs',
    i18n: meta('API Documentation', 'Generate clear API docs for any endpoint or function.',
               'Documentation API', 'Générez une documentation API claire pour tout endpoint.'),
    category: 'code',
    nodes: [
      n('role',        'You are a technical writer specializing in developer documentation.', 0),
      n('objective',   'Write documentation for the API endpoint or function in the Input block.', 1),
      n('input',       '{{endpoint/function signature + behavior description}}', 2),
      n('constraints', '- Include: description, parameters (name, type, required), response schema, error codes\n- Realistic code example', 3),
      n('output_format', 'Markdown: Endpoint · Method + URL · Description · Parameters table · Response · Example · Errors', 4),
    ],
  },
  {
    id: 'regex-generator',
    i18n: meta('Regex Generator', 'Generate and explain a regular expression for any pattern.',
               'Générateur Regex', 'Générez et expliquez une expression régulière pour tout motif.'),
    category: 'code',
    nodes: [
      n('role',        'You are a regex expert who writes precise, readable regular expressions.', 0),
      n('objective',   'Write a regex that matches the pattern described in the Input block.', 1),
      n('input',       '{{describe what to match}} — e.g. "Valid email addresses", "ISO 8601 dates", "hex color codes"', 2),
      n('constraints', '- Provide both a basic and strict version if applicable\n- Comment each part of the pattern\n- Include test cases (match/no-match examples)', 3),
      n('output_format', 'Regex in a code block + explanation of each group/token + test cases.', 4),
    ],
  },
  {
    id: 'architecture-review',
    i18n: meta('Architecture Review', 'Review a system architecture for scalability and best practices.',
               'Revue d\'architecture', 'Analysez une architecture système pour sa scalabilité et ses bonnes pratiques.'),
    category: 'code',
    nodes: [
      n('role',        'You are a principal engineer with deep experience in distributed systems and software architecture.', 0),
      n('objective',   'Review the architecture described in the Input block.', 1),
      n('input',       '{{describe your system: components, data flow, tech stack, scale, and any specific concerns}}', 2),
      n('constraints', '- Cover: scalability, single points of failure, security, data consistency, observability\n- Be specific — reference the exact components mentioned\n- Prioritize actionable recommendations', 3),
      n('output_format', 'Strengths · Risks (🔴 critical / 🟡 concern) · Recommendations with rationale · Priority order', 4),
    ],
  },
  {
    id: 'code-refactor',
    i18n: meta('Code Refactor', 'Refactor code for readability, performance and maintainability.',
               'Refactorisation', 'Refactorisez du code pour la lisibilité, performance et maintenabilité.'),
    category: 'code',
    nodes: [
      n('role',        'You are a senior software engineer who refactors code with surgical precision.', 0),
      n('objective',   'Refactor the code in the Input block while preserving its behavior.', 1),
      n('input',       '{{paste code to refactor}}', 2),
      n('context',     '{{optional: language, framework, constraints (e.g. "no external libraries")}}', 3),
      n('constraints', '- Preserve all existing behavior — no silent regressions\n- Explain each change with a one-line comment\n- Prefer readability over cleverness', 4),
      n('output_format', 'Refactored code in a code block + bullet list of changes made and why.', 5),
    ],
  },

  // ── MARKETING ────────────────────────────────────────────────────────────────

  {
    id: 'social-media',
    i18n: meta('Social Media Post', 'Create an engaging post for LinkedIn, Twitter or Instagram.',
               'Post réseaux sociaux', 'Créez un post engageant pour LinkedIn, Twitter ou Instagram.'),
    category: 'marketing',
    nodes: [
      n('role',        'You are a social media strategist who writes authentic, high-engagement content.', 0),
      n('audience',    '{{target audience}} — e.g. "startup founders on LinkedIn"', 1),
      n('input',       '{{topic or announcement}}', 2),
      n('constraints', '- Platform: {{Twitter / LinkedIn / Instagram}}\n- Twitter: max 280 chars · LinkedIn: max 1300 chars\n- Hook as the first line — no "I\'m excited to share"\n- 3–5 hashtags', 3),
    ],
  },
  {
    id: 'product-description',
    i18n: meta('Product Description', 'Write a persuasive product description that converts.',
               'Description produit', 'Rédigez une description produit persuasive qui convertit.'),
    category: 'marketing',
    nodes: [
      n('role',        'You are a conversion copywriter specializing in e-commerce and SaaS.', 0),
      n('audience',    '{{ideal customer}} — e.g. "busy professionals aged 25–40"', 1),
      n('input',       '{{product name, features, key differentiators}}', 2),
      n('constraints', '- Lead with benefits, not features\n- 150–250 words\n- Avoid unproven superlatives\n- End with a clear CTA', 3),
      n('output_format', 'Headline + 2–3 paragraphs + bullet features + CTA', 4),
    ],
  },
  {
    id: 'landing-page',
    i18n: meta('Landing Page Copy', 'Write high-converting copy for a product landing page.',
               'Texte de landing page', 'Rédigez des textes à fort taux de conversion pour une landing page.'),
    category: 'marketing',
    nodes: [
      n('role',        'You are a direct-response copywriter who has written landing pages generating millions in revenue.', 0),
      n('audience',    '{{target persona}} — e.g. "freelance designers who struggle to find clients"', 1),
      n('input',       '{{product/service name, what it does, main benefit, price (optional)}}', 2),
      n('goal',        'Visitor reads the page and clicks the CTA (sign up, buy, book a call).', 3),
      n('constraints', '- Lead with the pain point, not the product\n- Each section answers one objection\n- CTA repeated at least 3 times', 4),
      n('output_format', 'Hero (headline + sub + CTA) · Problem · Solution · Features→Benefits · Proof · Pricing · FAQ · Final CTA', 5),
    ],
  },
  {
    id: 'ad-copy',
    i18n: meta('Ad Copy', 'Write scroll-stopping ad copy for Google, Meta or LinkedIn.',
               'Texte publicitaire', 'Rédigez des textes publicitaires percutants pour Google, Meta ou LinkedIn.'),
    category: 'marketing',
    nodes: [
      n('role',        'You are a performance marketing specialist who writes ads that maximize CTR.', 0),
      n('audience',    '{{target audience + platform}} — e.g. "SaaS founders on LinkedIn"', 1),
      n('input',       '{{product/offer + key benefit + unique selling point}}', 2),
      n('constraints', '- Google: headline ≤30 chars × 3, description ≤90 chars × 2\n- Meta: hook (125 chars) + body + CTA\n- Focus on one benefit per ad\n- Use numbers and specifics', 3),
      n('output_format', '3 variations. Each labeled: Headline / Description / CTA. Note the platform format.', 4),
    ],
  },
  {
    id: 'newsletter',
    i18n: meta('Newsletter', 'Write an engaging email newsletter for any topic.',
               'Newsletter', 'Rédigez une newsletter engageante pour n\'importe quel sujet.'),
    category: 'marketing',
    nodes: [
      n('role',        'You are a newsletter writer known for high open rates and engaged subscribers.', 0),
      n('audience',    '{{subscriber persona}} — e.g. "product managers who follow industry trends"', 1),
      n('input',       '{{main topic or insight to share this week}}', 2),
      n('constraints', '- Conversational, first-person tone\n- 300–500 words\n- One main idea\n- End with a question or CTA to reply', 3),
      n('output_format', 'Subject line · Preview text · Body (intro + insight + example + takeaway) · Sign-off', 4),
    ],
  },
  {
    id: 'email-sequence',
    i18n: meta('Email Sequence', 'Write a 5-email nurture or onboarding sequence.',
               'Séquence email', 'Rédigez une séquence de 5 emails de nurturing ou d\'onboarding.'),
    category: 'marketing',
    nodes: [
      n('role',        'You are an email marketing specialist with expertise in lifecycle marketing.', 0),
      n('audience',    '{{subscriber type}} — e.g. "new SaaS trial users", "leads who downloaded a whitepaper"', 1),
      n('objective',   'Write a 5-email sequence that moves the reader from {{current state}} to {{desired action}}.', 2),
      n('input',       '{{product/service + key value proposition + main conversion goal}}', 3),
      n('constraints', '- Each email has one job (educate, overcome objection, social proof, urgency, CTA)\n- 150–250 words per email\n- Subject lines that create curiosity without misleading', 4),
      n('output_format', 'For each email: Day sent · Subject · Preview text · Body · CTA', 5),
    ],
  },
  {
    id: 'brand-positioning',
    i18n: meta('Brand Positioning', 'Define a clear, differentiated brand positioning statement.',
               'Positionnement de marque', 'Définissez un positionnement de marque clair et différencié.'),
    category: 'marketing',
    nodes: [
      n('role',        'You are a brand strategist who has worked with Fortune 500 companies and fast-growing startups.', 0),
      n('objective',   'Create a complete brand positioning framework for the company described in the Input block.', 1),
      n('input',       '{{company name + product/service + competitors + current differentiators + target customer}}', 2),
      n('constraints', '- Be specific and actionable — avoid generic positioning\n- The statement must be defensible (not easily copied)\n- Prioritize one primary differentiator', 3),
      n('output_format', 'Positioning statement (Geoffrey Moore format) · Key messages × 3 · Proof points × 3 · What to avoid saying', 4),
    ],
  },
  {
    id: 'case-study',
    i18n: meta('Case Study', 'Write a compelling customer case study or success story.',
               'Étude de cas', 'Rédigez une étude de cas client ou un témoignage de succès.'),
    category: 'marketing',
    nodes: [
      n('role',        'You are a content marketer who writes case studies that build trust and drive pipeline.', 0),
      n('objective',   'Write a customer case study based on the information in the Input block.', 1),
      n('input',       '{{customer name/industry + challenge + solution used + measurable results}}', 2),
      n('constraints', '- Lead with the result in the headline\n- Quantify everything possible (%, time saved, revenue impact)\n- Let the customer\'s voice come through with quotes\n- 400–600 words', 3),
      n('output_format', 'Headline (result) · Customer snapshot · Challenge · Solution · Results (metrics) · Quote · CTA', 4),
    ],
  },
  {
    id: 'content-calendar',
    i18n: meta('Content Calendar', 'Plan a month of content ideas for any brand or channel.',
               'Calendrier de contenu', 'Planifiez un mois d\'idées de contenu pour toute marque ou chaîne.'),
    category: 'marketing',
    nodes: [
      n('role',        'You are a content strategist who builds editorial calendars that drive consistent growth.', 0),
      n('audience',    '{{target audience}} for {{brand/niche}}', 1),
      n('objective',   'Generate a 4-week content calendar for {{platform}} based on the brand info in the Input block.', 2),
      n('input',       '{{brand name + niche + content pillars (3–5 themes) + posting frequency}}', 3),
      n('constraints', '- Balance: educational, entertaining, promotional (80/20 rule)\n- Vary formats: carousel, video idea, text post, poll, etc.\n- Include hooks for each post', 4),
      n('output_format', 'Table: Week · Day · Format · Topic · Hook · CTA', 5),
    ],
  },
  {
    id: 'seo-meta',
    i18n: meta('SEO Meta Tags', 'Write optimized title and meta description for any page.',
               'Balises SEO', 'Rédigez un titre et une meta description optimisés pour toute page.'),
    category: 'marketing',
    nodes: [
      n('role',        'You are an SEO specialist who writes meta tags that maximize click-through rates.', 0),
      n('objective',   'Write optimized title and meta description for the page described in the Input block.', 1),
      n('input',       '{{page topic + primary keyword + secondary keywords + content summary}}', 2),
      n('constraints', '- Title: 50–60 characters, include primary keyword near the start\n- Meta description: 140–155 characters, include a CTA\n- Both must be compelling enough to click\n- Provide 3 variations of each', 3),
      n('output_format', 'Variation 1/2/3 — each with: Title (X chars) · Meta description (X chars)', 4),
    ],
  },

  // ── PRODUCTIVITY ─────────────────────────────────────────────────────────────

  {
    id: 'meeting-summary',
    i18n: meta('Meeting Summary', 'Turn raw meeting notes into a clean, actionable summary.',
               'Compte-rendu de réunion', 'Transformez des notes brutes en compte-rendu structuré et actionnable.'),
    category: 'productivity',
    nodes: [
      n('role',        'You are an executive assistant specializing in meeting documentation.', 0),
      n('objective',   'Summarize the meeting notes in the Input block into a structured document.', 1),
      n('input',       '{{paste raw meeting notes or transcript}}', 2),
      n('output_format', '## Meeting Summary\n**Date:** · **Attendees:**\n### Key Decisions\n-\n### Action Items\n| Owner | Task | Due Date |\n|---|---|---|\n### Next Steps\n-', 3),
    ],
  },
  {
    id: 'project-brief',
    i18n: meta('Project Brief', 'Write a clear project brief to align stakeholders before kickoff.',
               'Brief de projet', 'Rédigez un brief de projet clair pour aligner les parties prenantes.'),
    category: 'productivity',
    nodes: [
      n('role',        'You are a senior project manager who writes briefs that prevent scope creep.', 0),
      n('objective',   'Write a complete project brief based on the information in the Input block.', 1),
      n('input',       '{{project name + goal + context + stakeholders + rough timeline}}', 2),
      n('constraints', '- Specific, measurable success criteria\n- Call out risks and open questions\n- Define what is OUT of scope\n- 1–2 pages max', 3),
      n('output_format', 'Summary · Objectives & Success Criteria · Scope (In/Out) · Timeline · Stakeholders · Risks & Open Questions', 4),
    ],
  },
  {
    id: 'performance-review',
    i18n: meta('Performance Review', 'Write a constructive, balanced performance review.',
               'Évaluation de performance', 'Rédigez une évaluation de performance constructive et équilibrée.'),
    category: 'productivity',
    nodes: [
      n('role',        'You are an experienced manager skilled at delivering clear, actionable feedback.', 0),
      n('objective',   'Write a performance review for the team member described in the Input block.', 1),
      n('input',       '{{name, role, period, key accomplishments, areas for improvement, specific incidents}}', 2),
      n('constraints', '- Specific examples for every point\n- Balanced: strengths + growth areas\n- Forward-looking: goals for next period\n- Professional and empathetic tone', 3),
      n('output_format', 'Overall Summary · Key Strengths (with examples) · Growth Areas · Goals for Next Period · Rating', 4),
    ],
  },
  {
    id: 'okr-definition',
    i18n: meta('OKR Definition', 'Write clear, measurable OKRs for a team or individual.',
               'Définition d\'OKR', 'Rédigez des OKR clairs et mesurables pour une équipe ou un individu.'),
    category: 'productivity',
    nodes: [
      n('role',        'You are a strategy consultant specializing in goal-setting frameworks.', 0),
      n('objective',   'Write well-structured OKRs based on the goal in the Input block.', 1),
      n('input',       '{{team/person + strategic goal + current state + desired state + timeframe}}', 2),
      n('constraints', '- 1 Objective + 3–4 Key Results max\n- Objective: inspiring, qualitative\n- Key Results: numeric, measurable, ambitious\n- No tasks or activities as KRs — only outcomes', 3),
      n('output_format', '**Objective:** [one sentence]\n**Key Results:**\n1. [metric] from X to Y by [date]\n**Why this matters:** [1–2 sentences]', 4),
    ],
  },
  {
    id: 'job-posting',
    i18n: meta('Job Posting', 'Write an attractive, inclusive job description for any role.',
               'Offre d\'emploi', 'Rédigez une offre d\'emploi attractive et inclusive pour tout poste.'),
    category: 'productivity',
    nodes: [
      n('role',        'You are a senior HR specialist and talent acquisition expert.', 0),
      n('objective',   'Write a compelling job posting for the role in the Input block.', 1),
      n('input',       '{{role title, team, responsibilities, must-have skills, nice-to-have}}', 2),
      n('constraints', '- Inclusive language — no gendered words\n- Highlight growth and culture\n- Separate must-have from nice-to-have\n- 400–600 words', 3),
      n('output_format', 'Role title · Hook · About the role · Responsibilities · Requirements · What we offer · How to apply', 4),
    ],
  },
  {
    id: 'support-response',
    i18n: meta('Support Response', 'Write an empathetic, effective customer support reply.',
               'Réponse support', 'Rédigez une réponse support empathique et efficace.'),
    category: 'productivity',
    nodes: [
      n('role',        'You are a senior customer support specialist known for first-contact resolution.', 0),
      n('audience',    '{{customer type}} — e.g. "frustrated paying customer", "confused new user"', 1),
      n('input',       '{{customer message or ticket content}}', 2),
      n('constraints', '- Acknowledge the issue first — never be defensive\n- One solution per response\n- Concrete next step\n- Under 150 words\n- Warm but professional', 3),
    ],
  },
  {
    id: 'retrospective',
    i18n: meta('Sprint Retrospective', 'Facilitate a structured sprint retrospective.',
               'Rétrospective de sprint', 'Facilitez une rétrospective de sprint structurée.'),
    category: 'productivity',
    nodes: [
      n('role',        'You are an agile coach who facilitates productive, psychologically safe retrospectives.', 0),
      n('objective',   'Generate a retrospective report based on the team feedback in the Input block.', 1),
      n('input',       '{{team feedback, observations, metrics from the sprint}}', 2),
      n('output_format', '## Sprint Retrospective\n### Went Well ✅\n-\n### To Improve 🔧\n-\n### Action Items 🎯\n| Action | Owner | By When |\n|---|---|---|\n### Team Mood: /5', 3),
    ],
  },
  {
    id: 'sop-writer',
    i18n: meta('SOP Writer', 'Write a clear Standard Operating Procedure for any process.',
               'Rédaction de procédure', 'Rédigez une procédure opérationnelle standard claire pour tout processus.'),
    category: 'productivity',
    nodes: [
      n('role',        'You are an operations specialist who writes clear, foolproof SOPs.', 0),
      n('objective',   'Write a Standard Operating Procedure for the process described in the Input block.', 1),
      n('input',       '{{process name + goal + involved roles + tools used + current steps (rough)}}', 2),
      n('constraints', '- Number every step\n- One action per step\n- Include decision points with If/Then branches\n- Add a troubleshooting section', 3),
      n('output_format', 'Title · Purpose · Scope · Prerequisites · Steps (numbered) · Troubleshooting · Version/Date', 4),
    ],
  },
  {
    id: 'one-pager',
    i18n: meta('One-Pager', 'Create a concise one-pager for any idea, project or proposal.',
               'One-pager', 'Créez un one-pager concis pour toute idée, projet ou proposition.'),
    category: 'productivity',
    nodes: [
      n('role',        'You are a strategy consultant who distills complex ideas into clear, compelling one-pagers.', 0),
      n('objective',   'Create a one-pager based on the information in the Input block.', 1),
      n('input',       '{{idea/project/proposal: what it is, why it matters, how it works, what you need}}', 2),
      n('constraints', '- Fits on one page (600 words max)\n- Executive audience — lead with the "so what"\n- Use visuals/tables if helpful\n- Clear ask or next step at the end', 3),
      n('output_format', 'Title · TL;DR (2 sentences) · Problem · Solution · Key Details · Impact/ROI · Ask · Next Steps', 4),
    ],
  },
  {
    id: 'risk-analysis',
    i18n: meta('Risk Analysis', 'Identify and assess risks for any project or decision.',
               'Analyse de risques', 'Identifiez et évaluez les risques d\'un projet ou d\'une décision.'),
    category: 'productivity',
    nodes: [
      n('role',        'You are a risk management consultant with experience across tech, finance, and operations.', 0),
      n('objective',   'Perform a risk analysis for the project or decision described in the Input block.', 1),
      n('input',       '{{project/decision description + context + constraints + timeline}}', 2),
      n('constraints', '- Identify at least 8 risks across: technical, financial, operational, reputational, legal\n- Rate each: Likelihood (Low/Med/High) × Impact (Low/Med/High)\n- Propose a mitigation for each', 3),
      n('output_format', 'Risk matrix table: Risk | Category | Likelihood | Impact | Mitigation\nThen: Top 3 priority risks with detailed mitigation plans.', 4),
    ],
  },

  // ── DESIGN ───────────────────────────────────────────────────────────────────

  {
    id: 'ux-audit',
    i18n: meta('UX Audit', 'Audit a product\'s UX and identify friction points.',
               'Audit UX', 'Auditez l\'UX d\'un produit et identifiez les points de friction.'),
    category: 'design',
    nodes: [
      n('role',        'You are a senior UX designer with 10 years of experience in SaaS and mobile apps.', 0),
      n('objective',   'Perform a UX audit on the product described in the Input block.', 1),
      n('input',       '{{product description + target user + core flows + known pain points}}', 2),
      n('constraints', '- Evaluate: navigation, onboarding, error states, empty states, mobile experience, accessibility\n- Be specific — reference actual elements\n- Prioritize by user impact', 3),
      n('output_format', '## UX Audit\n### Critical Issues 🔴\n### Improvements 🟡\n### Quick Wins 🟢\n### Recommended Next Steps', 4),
    ],
  },
  {
    id: 'design-brief',
    i18n: meta('Design Brief', 'Write a comprehensive design brief for any creative project.',
               'Brief créatif', 'Rédigez un brief créatif complet pour tout projet de design.'),
    category: 'design',
    nodes: [
      n('role',        'You are a creative director who writes briefs that inspire great design work.', 0),
      n('objective',   'Write a complete design brief based on the project info in the Input block.', 1),
      n('input',       '{{project type + brand/product + goals + audience + deliverables + constraints}}', 2),
      n('constraints', '- Be specific about tone, style, and what to avoid\n- Include visual references if relevant\n- Define success criteria for the design', 3),
      n('output_format', 'Project Overview · Goals · Target Audience · Design Direction · Tone & Style · Must-Haves · Must-Avoids · Deliverables · Timeline', 4),
    ],
  },
  {
    id: 'user-persona',
    i18n: meta('User Persona', 'Create detailed user personas for product or design work.',
               'Persona utilisateur', 'Créez des personas utilisateur détaillés pour votre produit.'),
    category: 'design',
    nodes: [
      n('role',        'You are a UX researcher who creates data-driven user personas.', 0),
      n('objective',   'Create 2–3 detailed user personas for the product described in the Input block.', 1),
      n('input',       '{{product/service + target market + any existing user data or assumptions}}', 2),
      n('constraints', '- Each persona: name, photo description, demographics, goals, frustrations, behaviors, tech savviness\n- Include a "Day in the life" scenario\n- Ground in realistic behavior, not stereotypes', 3),
      n('output_format', 'For each persona: Name · Tagline · Demographics · Goals × 3 · Frustrations × 3 · Behaviors · Day-in-the-life scenario · Quote', 4),
    ],
  },
  {
    id: 'color-palette',
    i18n: meta('Color Palette', 'Define a cohesive, purposeful color palette for any brand.',
               'Palette de couleurs', 'Définissez une palette de couleurs cohérente pour toute marque.'),
    category: 'design',
    nodes: [
      n('role',        'You are a brand designer who specializes in visual identity and color theory.', 0),
      n('objective',   'Define a complete color palette for the brand described in the Input block.', 1),
      n('input',       '{{brand name + values (3–5) + industry + competitors + tone (e.g. "trustworthy", "playful", "premium")}}', 2),
      n('constraints', '- 1 primary + 2 secondary + 2–3 neutral + semantic colors (success, error, warning)\n- Ensure WCAG AA contrast for text\n- Justify each color choice with brand rationale', 3),
      n('output_format', 'Each color: Name · Hex code · RGB · Usage · Rationale\nAccessibility notes at the end.', 4),
    ],
  },
  {
    id: 'microcopy',
    i18n: meta('Microcopy', 'Write effective microcopy for any UI element or user flow.',
               'Microcopy UI', 'Rédigez une microcopy efficace pour tout élément UI ou parcours utilisateur.'),
    category: 'design',
    nodes: [
      n('role',        'You are a UX writer who crafts microcopy that reduces friction and builds trust.', 0),
      n('objective',   'Write microcopy for the UI elements described in the Input block.', 1),
      n('input',       '{{UI elements or flows needing copy}} — e.g. "empty state for no results, error message for invalid credit card, onboarding tooltip for dashboard"', 2),
      n('constraints', '- Clear over clever — users are in task mode\n- Address the user\'s concern, not the system state\n- Provide alternatives (destructive actions need confirmation copy too)\n- 3 variations per element', 3),
    ],
  },
  {
    id: 'wireframe-spec',
    i18n: meta('Wireframe Spec', 'Write detailed specifications for a wireframe or screen.',
               'Spécifications wireframe', 'Rédigez des spécifications détaillées pour un wireframe ou un écran.'),
    category: 'design',
    nodes: [
      n('role',        'You are a product designer who writes clear, developer-friendly design specs.', 0),
      n('objective',   'Write detailed specifications for the screen or component described in the Input block.', 1),
      n('input',       '{{screen/component name + purpose + key user actions + data displayed}}', 2),
      n('constraints', '- Specify: layout, spacing, typography, states (empty, loading, error, success)\n- Include edge cases (long text, no data, error)\n- Reference design system tokens if applicable', 3),
      n('output_format', 'Screen Purpose · Layout Description · Components list · State matrix · Interactions · Edge Cases · Accessibility notes', 4),
    ],
  },
  {
    id: 'onboarding-flow',
    i18n: meta('Onboarding Flow', 'Design a product onboarding experience that activates users.',
               'Flux d\'onboarding', 'Concevez un onboarding produit qui active vos utilisateurs.'),
    category: 'design',
    nodes: [
      n('role',        'You are a product growth expert who designs onboarding flows with top activation rates.', 0),
      n('objective',   'Design a complete onboarding flow for the product described in the Input block.', 1),
      n('input',       '{{product + "aha moment" + target activation metric + current onboarding (if any)}}', 2),
      n('goal',        'New user reaches the "aha moment" within {{X minutes/actions}} and completes their first key action.', 3),
      n('constraints', '- Every step must have a clear purpose\n- Minimize steps to reach the aha moment\n- Include progress indicators and escape hatches\n- Define success metrics per step', 4),
      n('output_format', 'Step-by-step flow: Step name · Goal · Screen description · Copy · Success metric · Drop-off risk', 5),
    ],
  },
  {
    id: 'design-system',
    i18n: meta('Design System', 'Define a design system structure for a product.',
               'Design system', 'Définissez la structure d\'un design system pour un produit.'),
    category: 'design',
    nodes: [
      n('role',        'You are a design systems lead who has built systems used by 100+ designers and engineers.', 0),
      n('objective',   'Define the structure and key components of a design system for the product in the Input block.', 1),
      n('input',       '{{product type + tech stack + team size + current design maturity}}', 2),
      n('constraints', '- Prioritize the highest-ROI components first (don\'t boil the ocean)\n- Define naming conventions, token structure, and versioning approach\n- Include governance model (who owns what)', 3),
      n('output_format', 'Foundation (tokens, grid, typography) · Core components list · Documentation structure · Governance model · Rollout phases', 4),
    ],
  },

  // ── EDUCATION ────────────────────────────────────────────────────────────────

  {
    id: 'lesson-plan',
    i18n: meta('Lesson Plan', 'Create a structured lesson plan on any topic.',
               'Plan de cours', 'Créez un plan de cours structuré sur n\'importe quel sujet.'),
    category: 'education',
    nodes: [
      n('role',        'You are an experienced teacher who designs engaging, effective lessons.', 0),
      n('audience',    '{{student level}} — e.g. "high school students", "adult learners", "university undergraduates"', 1),
      n('objective',   'Create a complete lesson plan for the topic in the Input block.', 2),
      n('input',       '{{topic + duration (e.g. 60 min) + prerequisites + learning goals}}', 3),
      n('constraints', '- Include warm-up, main content, practice, and wrap-up\n- At least 2 interactive activities\n- Assessment method at the end', 4),
      n('output_format', 'Duration · Objectives · Materials · Activities (with timings) · Assessment · Differentiation tips', 5),
    ],
  },
  {
    id: 'quiz-generator',
    i18n: meta('Quiz Generator', 'Generate a quiz with questions and answers on any topic.',
               'Générateur de quiz', 'Générez un quiz avec questions et réponses sur tout sujet.'),
    category: 'education',
    nodes: [
      n('role',        'You are an instructional designer who creates effective assessment tools.', 0),
      n('audience',    '{{student level and context}}', 1),
      n('input',       '{{topic + number of questions + difficulty level + question types (MCQ, true/false, open)}}', 2),
      n('constraints', '- Mix question types\n- Include distractors that test common misconceptions\n- Avoid trick questions\n- Provide detailed explanations for each answer', 3),
      n('output_format', 'For each question: Q: [question] · A) B) C) D) · Correct: [X] · Explanation: [why]', 4),
    ],
  },
  {
    id: 'study-guide',
    i18n: meta('Study Guide', 'Create a comprehensive study guide for any subject.',
               'Guide d\'étude', 'Créez un guide d\'étude complet pour n\'importe quelle matière.'),
    category: 'education',
    nodes: [
      n('role',        'You are a learning specialist who creates study guides that maximize retention.', 0),
      n('audience',    '{{student level}} studying for {{exam/certification/course}}', 1),
      n('input',       '{{subject + key topics to cover + exam date (optional)}}', 2),
      n('constraints', '- Use spaced repetition principles\n- Include: key concepts, definitions, common mistakes, mnemonics\n- Summary at the end of each section\n- Practice questions', 3),
      n('output_format', 'For each topic: Key Concepts · Definitions · Common Mistakes · Memory Aid · Practice Questions', 4),
    ],
  },
  {
    id: 'course-outline',
    i18n: meta('Course Outline', 'Design a complete online or in-person course outline.',
               'Plan de formation', 'Concevez un plan de formation complet, en ligne ou présentiel.'),
    category: 'education',
    nodes: [
      n('role',        'You are an instructional designer who builds courses with measurable outcomes.', 0),
      n('audience',    '{{target learners + their current level + their goal}}', 1),
      n('objective',   'Design a complete course outline for the topic in the Input block.', 2),
      n('input',       '{{course topic + duration (e.g. 6 weeks) + format (video, live, self-paced)}}', 3),
      n('constraints', '- Define learning outcomes per module\n- Include: theory, practice, project/assignment\n- Each module ≤ 2 hours of content\n- Capstone project at the end', 4),
      n('output_format', 'Module list: Module # · Title · Duration · Learning outcomes · Content summary · Assignment', 5),
    ],
  },
  {
    id: 'feedback-essay',
    i18n: meta('Essay Feedback', 'Give detailed, constructive feedback on any essay or written work.',
               'Feedback sur dissertation', 'Donnez un feedback détaillé et constructif sur une dissertation.'),
    category: 'education',
    nodes: [
      n('role',        'You are an experienced writing tutor who gives specific, actionable feedback.', 0),
      n('audience',    '{{student level}} — e.g. "high school", "university", "professional"', 1),
      n('objective',   'Give detailed feedback on the essay provided in the Input block.', 2),
      n('input',       '{{paste the essay here}}', 3),
      n('constraints', '- Evaluate: thesis clarity, argument structure, evidence quality, writing style, grammar\n- Give specific quotes from the text\n- Balance positive feedback with improvement areas\n- End with 3 prioritized revision suggestions', 4),
      n('output_format', 'Overall assessment · Strengths (with quotes) · Areas to improve (with quotes + how-to) · 3 Priority revisions · Revised grade estimate', 5),
    ],
  },
  {
    id: 'tutoring-session',
    i18n: meta('Tutoring Session', 'Design a personalized tutoring session for any topic.',
               'Session de tutorat', 'Concevez une session de tutorat personnalisée sur tout sujet.'),
    category: 'education',
    nodes: [
      n('role',        'You are a patient, expert tutor who adapts to each student\'s learning style.', 0),
      n('audience',    '{{student: age, level, learning style (visual/auditory/kinesthetic), known gaps}}', 1),
      n('objective',   'Teach the concept in the Input block through a guided tutoring session.', 2),
      n('input',       '{{concept + what the student already knows + where they\'re stuck}}', 3),
      n('chain_of_thought', 'Diagnose the gap → start where the student is → build bridges → check understanding → apply.', 4),
      n('constraints', '- Ask Socratic questions rather than just explaining\n- Use examples from the student\'s interests if known\n- End with a self-assessment activity', 5),
    ],
  },
  {
    id: 'workshop-design',
    i18n: meta('Workshop Design', 'Design an engaging workshop for any topic or skill.',
               'Conception d\'atelier', 'Concevez un atelier engageant sur tout sujet ou compétence.'),
    category: 'education',
    nodes: [
      n('role',        'You are a facilitator and workshop designer who creates memorable learning experiences.', 0),
      n('audience',    '{{participants: number, role, experience level}}', 1),
      n('objective',   'Design a complete workshop for the topic and goal in the Input block.', 2),
      n('input',       '{{workshop topic + duration + desired outcome + format (in-person/virtual)}}', 3),
      n('constraints', '- Alternate between input and activity every 20 minutes\n- Include: icebreaker, group exercises, individual reflection, takeaways\n- Design for the lowest-experience participant', 4),
      n('output_format', 'Agenda (with times) · Materials needed · Facilitation notes · Discussion questions · Takeaway sheet · Follow-up actions', 5),
    ],
  },

  // ── SALES ────────────────────────────────────────────────────────────────────

  {
    id: 'cold-email',
    i18n: meta('Cold Outreach Email', 'Write a personalized cold email that gets replies.',
               'Email de prospection', 'Rédigez un email de prospection personnalisé qui obtient des réponses.'),
    category: 'sales',
    nodes: [
      n('role',        'You are a top-performing SDR who writes cold emails with 30%+ reply rates.', 0),
      n('audience',    '{{prospect: title, company type, industry}}', 1),
      n('objective',   'Write a cold email to the prospect described in the audience block.', 2),
      n('context',     '{{your product/service + why it\'s relevant to this prospect + any personalization hook}}', 3),
      n('constraints', '- Subject line: 3–6 words, no spam triggers\n- Under 100 words\n- One specific pain point\n- One soft CTA (not "book a demo" as first ask)\n- No attachments mentioned', 4),
    ],
  },
  {
    id: 'sales-pitch',
    i18n: meta('Sales Pitch', 'Write a compelling sales pitch for any product or service.',
               'Pitch commercial', 'Rédigez un pitch commercial percutant pour tout produit ou service.'),
    category: 'sales',
    nodes: [
      n('role',        'You are an elite sales consultant who trains reps at top SaaS companies.', 0),
      n('audience',    '{{buyer persona: role, company size, key concerns}}', 1),
      n('objective',   'Write a compelling sales pitch for the product/service in the Input block.', 2),
      n('input',       '{{product/service + key differentiators + relevant case study or proof point}}', 3),
      n('constraints', '- Open with the prospect\'s pain, not your product\n- Use the SPIN framework (Situation, Problem, Implication, Need-payoff)\n- One memorable proof point with numbers\n- Close with a clear next step', 4),
    ],
  },
  {
    id: 'objection-handling',
    i18n: meta('Objection Handling', 'Prepare responses to the most common sales objections.',
               'Réponses aux objections', 'Préparez des réponses aux objections commerciales les plus courantes.'),
    category: 'sales',
    nodes: [
      n('role',        'You are a sales coach who has trained hundreds of reps to handle objections with empathy.', 0),
      n('objective',   'Write responses to the sales objections listed in the Input block.', 1),
      n('input',       '{{objections list}} — e.g. "Too expensive", "We\'re happy with our current solution", "Not the right time", "Need to check with my boss"', 2),
      n('context',     '{{your product/service + target buyer + typical deal size}}', 3),
      n('constraints', '- Use the ACP framework: Acknowledge → Clarify → Position\n- Never argue or dismiss the concern\n- Include a pivot question after each response\n- Realistic and conversational tone', 4),
      n('output_format', 'For each objection: Acknowledge · Clarify (question) · Position (response) · Pivot', 5),
    ],
  },
  {
    id: 'proposal',
    i18n: meta('Sales Proposal', 'Write a professional sales proposal that closes deals.',
               'Proposition commerciale', 'Rédigez une proposition commerciale professionnelle qui conclut des ventes.'),
    category: 'sales',
    nodes: [
      n('role',        'You are a solution consultant who writes proposals with 60%+ close rates.', 0),
      n('audience',    '{{decision maker: role, company, key priorities, known concerns}}', 1),
      n('objective',   'Write a complete sales proposal based on the deal info in the Input block.', 2),
      n('input',       '{{prospect situation + pain points + proposed solution + pricing + timeline}}', 3),
      n('constraints', '- Lead with their problem, not your product\n- Tie every feature to a business outcome\n- Include ROI calculation if possible\n- Clear, simple pricing (no hidden fees)\n- Specific next steps and expiration date', 4),
      n('output_format', 'Executive Summary · Situation Analysis · Proposed Solution · Investment · Expected ROI · Timeline · Next Steps', 5),
    ],
  },
  {
    id: 'follow-up',
    i18n: meta('Follow-up Email', 'Write effective follow-up emails for any sales or business situation.',
               'Email de suivi', 'Rédigez des emails de suivi efficaces pour toute situation commerciale.'),
    category: 'sales',
    nodes: [
      n('role',        'You are a sales professional who writes follow-up emails that re-engage without being pushy.', 0),
      n('audience',    '{{prospect: where they are in the funnel, last interaction, time since last contact}}', 1),
      n('objective',   'Write a follow-up email based on the context in the Input block.', 2),
      n('input',       '{{what was discussed last + what was promised + any changes since + goal of this email}}', 3),
      n('constraints', '- Reference the previous conversation specifically\n- Add new value (insight, case study, relevant news)\n- Soft CTA — make it easy to say yes\n- Under 100 words', 4),
    ],
  },
  {
    id: 'discovery-questions',
    i18n: meta('Discovery Questions', 'Generate powerful discovery questions for any sales call.',
               'Questions de découverte', 'Générez des questions de découverte puissantes pour tout entretien commercial.'),
    category: 'sales',
    nodes: [
      n('role',        'You are a senior account executive known for running insightful discovery calls.', 0),
      n('audience',    '{{prospect: role, company type, likely pain points}}', 1),
      n('objective',   'Generate a discovery question bank for the sales call described in the Input block.', 2),
      n('input',       '{{product you sell + stage of the funnel + what you need to uncover}}', 3),
      n('constraints', '- Cover: current situation, pain, impact, timeline, decision process, budget\n- Mix open and probing questions\n- Avoid yes/no questions\n- Include escalating questions (surface → deep)', 4),
      n('output_format', 'Categories: Situation · Problem · Impact · Priority · Process/Timeline · Budget · Decision Makers\n5 questions per category.', 5),
    ],
  },
  {
    id: 'negotiation',
    i18n: meta('Negotiation Script', 'Prepare a negotiation strategy and script for any deal.',
               'Script de négociation', 'Préparez une stratégie et un script de négociation pour tout accord.'),
    category: 'sales',
    nodes: [
      n('role',        'You are a negotiation expert trained in Harvard-style principled negotiation.', 0),
      n('objective',   'Prepare a negotiation strategy and talking points for the deal in the Input block.', 1),
      n('input',       '{{deal context: what\'s being negotiated, current offer, desired outcome, walk-away point, counterpart\'s likely priorities}}', 2),
      n('constraints', '- Separate people from the problem\n- Focus on interests, not positions\n- Prepare 3 fallback positions (BATNA)\n- Prepare for their top 3 likely counter-moves', 3),
      n('output_format', 'Opening position · Key interests (yours and theirs) · Proposed trades · Fallback positions (BATNA) · Red lines · Opening script', 4),
    ],
  },
  {
    id: 'upsell-script',
    i18n: meta('Upsell Script', 'Write a natural upsell or cross-sell script for existing customers.',
               'Script d\'upsell', 'Rédigez un script d\'upsell ou de cross-sell naturel pour vos clients existants.'),
    category: 'sales',
    nodes: [
      n('role',        'You are a customer success manager who grows accounts through value-based conversations.', 0),
      n('audience',    '{{existing customer: plan/tier, usage patterns, goals, relationship quality}}', 1),
      n('objective',   'Write an upsell conversation script for the situation in the Input block.', 2),
      n('input',       '{{current product + upgrade option + trigger event (e.g. hitting limits, new use case, business growth)}}', 3),
      n('constraints', '- Lead with their success, not your quota\n- Connect the upgrade to their stated goals\n- Quantify the gap between current plan and what they need\n- No pressure — make saying yes the obvious choice', 4),
    ],
  },

  // ── DATA ─────────────────────────────────────────────────────────────────────

  {
    id: 'data-analysis',
    i18n: meta('Data Analysis', 'Analyze a dataset and extract meaningful insights.',
               'Analyse de données', 'Analysez un jeu de données et extrayez des insights pertinents.'),
    category: 'data',
    nodes: [
      n('role',        'You are a senior data analyst who turns raw data into actionable business insights.', 0),
      n('objective',   'Analyze the data described in the Input block and extract key insights.', 1),
      n('input',       '{{dataset description or sample data + business context + key questions to answer}}', 2),
      n('constraints', '- Focus on patterns, anomalies, and correlations\n- Separate observations from interpretations\n- Flag data quality issues\n- Quantify confidence levels', 3),
      n('output_format', 'Executive Summary · Key Findings (with numbers) · Anomalies & Outliers · Hypotheses · Recommended Actions · Data Quality Notes', 4),
    ],
  },
  {
    id: 'kpi-dashboard',
    i18n: meta('KPI Dashboard', 'Define the right KPIs and metrics for any business function.',
               'Tableau de bord KPI', 'Définissez les bons KPI et métriques pour toute fonction business.'),
    category: 'data',
    nodes: [
      n('role',        'You are a data strategy consultant who designs measurement frameworks.', 0),
      n('objective',   'Define a KPI framework for the business function described in the Input block.', 1),
      n('input',       '{{business function (e.g. "Marketing", "Customer Success") + goals + current metrics tracked}}', 2),
      n('constraints', '- Max 5–7 KPIs (avoid metric overload)\n- Include: metric name, formula, target, frequency, data source\n- Separate leading from lagging indicators\n- Tie each KPI to a business outcome', 3),
      n('output_format', 'Table: KPI · Formula · Current Benchmark · Target · Owner · Frequency · Data Source\nPriority order with rationale.', 4),
    ],
  },
  {
    id: 'ab-test',
    i18n: meta('A/B Test Design', 'Design a rigorous A/B test for any hypothesis.',
               'Design de test A/B', 'Concevez un test A/B rigoureux pour toute hypothèse.'),
    category: 'data',
    nodes: [
      n('role',        'You are a growth scientist who designs statistically valid experiments.', 0),
      n('objective',   'Design a complete A/B test for the hypothesis in the Input block.', 1),
      n('input',       '{{hypothesis + metric to optimize + current baseline + traffic/sample size available}}', 2),
      n('constraints', '- Define: control, variant(s), primary metric, guardrail metrics\n- Calculate required sample size and duration\n- Identify potential confounders\n- Define stopping rules (when to end early)', 3),
      n('output_format', 'Hypothesis · Test Design · Sample Size Calculation · Success Criteria · Duration · Guardrail Metrics · Rollout Plan', 4),
    ],
  },
  {
    id: 'data-story',
    i18n: meta('Data Storytelling', 'Transform data findings into a compelling narrative.',
               'Storytelling par les données', 'Transformez des données en narration convaincante.'),
    category: 'data',
    nodes: [
      n('role',        'You are a data storyteller who makes complex findings compelling to non-technical audiences.', 0),
      n('audience',    '{{audience}} — e.g. "C-suite", "board members", "marketing team"', 1),
      n('objective',   'Transform the data findings in the Input block into a compelling narrative.', 2),
      n('input',       '{{key data findings + business context + decision to be made}}', 3),
      n('constraints', '- One clear "so what" per slide/section\n- Use concrete comparisons (not raw percentages)\n- Build tension: current state → insight → implication → recommendation\n- Avoid chart junk and data overload', 4),
      n('output_format', 'Narrative arc: Context → Conflict (the insight) → Resolution (the recommendation) · Suggested visualizations · Key takeaway per section', 5),
    ],
  },
  {
    id: 'python-analysis',
    i18n: meta('Python Data Analysis', 'Write Python code for any data analysis or visualization task.',
               'Analyse données Python', 'Écrivez du code Python pour toute tâche d\'analyse ou visualisation de données.'),
    category: 'data',
    nodes: [
      n('role',        'You are a data scientist proficient in Python (pandas, numpy, matplotlib, seaborn, plotly).', 0),
      n('objective',   'Write Python code to perform the analysis described in the Input block.', 1),
      n('input',       '{{what to analyze + data structure (columns, types) + desired output (chart, table, stats)}}', 2),
      n('constraints', '- Clean, well-commented code\n- Handle missing values and edge cases\n- Include a brief explanation of each step\n- Suggest the best visualization type and explain why', 3),
      n('output_format', 'Python code in a code block + explanation of approach + interpretation of expected results', 4),
    ],
  },
  {
    id: 'funnel-analysis',
    i18n: meta('Funnel Analysis', 'Analyze a conversion funnel and identify where to improve.',
               'Analyse de funnel', 'Analysez un entonnoir de conversion et identifiez les points d\'amélioration.'),
    category: 'data',
    nodes: [
      n('role',        'You are a growth analyst who specializes in funnel optimization.', 0),
      n('objective',   'Analyze the conversion funnel described in the Input block and recommend improvements.', 1),
      n('input',       '{{funnel steps + conversion rates at each step + benchmarks if known + product context}}', 2),
      n('constraints', '- Identify the biggest drop-off point and focus 70% of recommendations there\n- Suggest both quick wins and structural changes\n- Quantify the impact of each recommendation', 3),
      n('output_format', 'Funnel visualization (text) · Drop-off analysis · Top 3 recommendations (with expected impact) · Testing roadmap', 4),
    ],
  },

  // ── CREATIVE ─────────────────────────────────────────────────────────────────

  {
    id: 'short-story',
    i18n: meta('Short Story', 'Write a compelling short story in any genre.',
               'Nouvelle', 'Écrivez une nouvelle captivante dans n\'importe quel genre.'),
    category: 'creative',
    nodes: [
      n('role',        'You are a literary fiction author known for vivid, emotionally resonant short stories.', 0),
      n('objective',   'Write a complete short story based on the prompt in the Input block.', 1),
      n('input',       '{{genre + premise or first line + any required elements (character, setting, object)}}', 2),
      n('constraints', '- 600–1000 words\n- Show, don\'t tell\n- Strong opening hook, rising tension, satisfying resolution\n- Distinct character voice', 3),
    ],
  },
  {
    id: 'poetry',
    i18n: meta('Poetry', 'Write a poem in any style or form.',
               'Poème', 'Rédigez un poème dans n\'importe quel style ou forme.'),
    category: 'creative',
    nodes: [
      n('role',        'You are a poet with mastery of multiple forms (sonnet, haiku, free verse, villanelle, ode).', 0),
      n('objective',   'Write a poem based on the request in the Input block.', 1),
      n('input',       '{{theme or subject + form (e.g. "sonnet", "free verse", "haiku") + mood or tone}}', 2),
      n('constraints', '- Follow the requested form\'s rules precisely\n- Use concrete imagery, not abstract statements\n- Avoid clichés and forced rhymes\n- Each line must earn its place', 3),
    ],
  },
  {
    id: 'screenplay',
    i18n: meta('Screenplay Scene', 'Write a cinematic screenplay scene for any genre.',
               'Scène de scénario', 'Rédigez une scène de scénario cinématographique pour tout genre.'),
    category: 'creative',
    nodes: [
      n('role',        'You are a professional screenwriter with credits on major productions.', 0),
      n('objective',   'Write a screenplay scene based on the description in the Input block.', 1),
      n('input',       '{{scene description: setting, characters, what happens, purpose in the story}}', 2),
      n('constraints', '- Proper screenplay format (INT./EXT., character names centered, action lines, dialogue)\n- Show characters through action and dialogue — no internal monologue\n- Each scene must move the story forward or reveal character\n- 1–3 pages max', 3),
    ],
  },
  {
    id: 'song-lyrics',
    i18n: meta('Song Lyrics', 'Write song lyrics in any genre or style.',
               'Paroles de chanson', 'Rédigez des paroles de chanson dans tout genre ou style.'),
    category: 'creative',
    nodes: [
      n('role',        'You are a professional songwriter who has written hits in multiple genres.', 0),
      n('objective',   'Write complete song lyrics based on the request in the Input block.', 1),
      n('input',       '{{genre + theme/story + mood + any specific phrases or constraints}}', 2),
      n('constraints', '- Structure: verse / chorus / verse / chorus / bridge / outro\n- Chorus: memorable, singable, captures the essence of the song\n- Internal rhyme and rhythm — reads aloud smoothly\n- Show the emotion through specific images, not just stating it', 3),
    ],
  },
  {
    id: 'world-building',
    i18n: meta('World Building', 'Create a rich, detailed fictional world for any story.',
               'Construction de monde', 'Créez un monde fictif riche et détaillé pour toute histoire.'),
    category: 'creative',
    nodes: [
      n('role',        'You are a world-building expert and fantasy/sci-fi author.', 0),
      n('objective',   'Create a detailed world based on the premise in the Input block.', 1),
      n('input',       '{{genre + core premise + any fixed elements you want to keep}}', 2),
      n('constraints', '- Cover: geography, history, society, magic/technology system, cultures, conflicts\n- Every element must serve the story — no details for their own sake\n- Include internal consistency rules\n- Define what makes this world unique', 3),
      n('output_format', 'World Overview · Geography & Climate · History · Society & Culture · Power System (magic/tech) · Current Conflict · Story hooks', 4),
    ],
  },
  {
    id: 'character-profile',
    i18n: meta('Character Profile', 'Create a deep, compelling character for any story.',
               'Profil de personnage', 'Créez un personnage profond et captivant pour toute histoire.'),
    category: 'creative',
    nodes: [
      n('role',        'You are a character development coach who creates three-dimensional, memorable characters.', 0),
      n('objective',   'Create a complete character profile based on the input in the Input block.', 1),
      n('input',       '{{character\'s role in the story + genre + any fixed traits you want}}', 2),
      n('constraints', '- Avoid archetypes without subversion\n- Define: want (surface goal) vs. need (deeper truth they must learn)\n- Backstory must explain present behavior\n- Include a fatal flaw and a redeeming quality', 3),
      n('output_format', 'Basics · Backstory · Want vs. Need · Fatal Flaw · Strength · Voice & Mannerisms · Arc · Key Relationships', 4),
    ],
  },
  {
    id: 'game-design',
    i18n: meta('Game Design Doc', 'Write a game design document for any type of game.',
               'Document de conception jeu', 'Rédigez un document de conception de jeu pour tout type de jeu.'),
    category: 'creative',
    nodes: [
      n('role',        'You are a game designer with experience across indie and AAA titles.', 0),
      n('objective',   'Write a game design document for the game concept in the Input block.', 1),
      n('input',       '{{game concept + genre + platform + target audience + core mechanics}}', 2),
      n('constraints', '- Define the core loop in one sentence\n- Every mechanic must serve the player fantasy\n- Include monetization and retention mechanics if applicable\n- Identify the biggest design risks', 3),
      n('output_format', 'High Concept · Core Loop · Mechanics · Player Fantasy · Progression System · Art Direction · Technical Requirements · Risks', 4),
    ],
  },
  {
    id: 'podcast-script',
    i18n: meta('Podcast Script', 'Write a structured podcast script for any topic or format.',
               'Script de podcast', 'Rédigez un script de podcast structuré pour tout sujet ou format.'),
    category: 'creative',
    nodes: [
      n('role',        'You are an experienced podcast producer and host who creates engaging audio content.', 0),
      n('audience',    '{{target listener}} — e.g. "tech entrepreneurs", "history enthusiasts"', 1),
      n('objective',   'Write a podcast script for the episode described in the Input block.', 2),
      n('input',       '{{episode topic + duration (e.g. 20 min) + format (solo/interview/narrative) + key points to cover}}', 3),
      n('constraints', '- Hook in the first 30 seconds — why listen now?\n- Conversational, not written-to-be-read\n- Smooth transitions between segments\n- Strong, memorable close', 4),
      n('output_format', 'Intro hook · Segment breakdown (with timings) · Full script · Outro · Show notes summary', 5),
    ],
  },

  // ── PERSONAL ─────────────────────────────────────────────────────────────────

  {
    id: 'life-coach',
    i18n: meta('Life Coaching Session', 'Get structured coaching for any personal challenge.',
               'Session de coaching', 'Obtenez un coaching structuré pour tout défi personnel.'),
    category: 'personal',
    nodes: [
      n('role',        'You are an ICF-certified life coach who specializes in helping people move from stuck to unstoppable.', 0),
      n('objective',   'Lead a structured coaching session on the challenge described in the Input block.', 1),
      n('input',       '{{challenge or goal + current situation + what you\'ve already tried + what success looks like}}', 2),
      n('chain_of_thought', 'Clarify → Explore root causes → Identify limiting beliefs → Generate options → Commit to action.', 3),
      n('constraints', '- Ask powerful questions rather than giving advice\n- Challenge assumptions gently\n- End with 1 specific action to take in the next 48 hours', 4),
    ],
  },
  {
    id: 'habit-plan',
    i18n: meta('Habit Building Plan', 'Design a science-based plan to build any habit.',
               'Plan de création d\'habitude', 'Concevez un plan basé sur la science pour créer n\'importe quelle habitude.'),
    category: 'personal',
    nodes: [
      n('role',        'You are a behavioral scientist and habit coach (Atomic Habits, BJ Fogg\'s Tiny Habits).', 0),
      n('objective',   'Design a habit-building plan for the goal described in the Input block.', 1),
      n('input',       '{{desired habit + current baseline + motivation (why) + past attempts and what failed}}', 2),
      n('constraints', '- Use the habit loop: cue → routine → reward\n- Start ridiculously small (2-minute rule)\n- Stack on existing habits\n- Include identity statement ("I am the type of person who...")\n- Define the minimum viable version', 3),
      n('output_format', 'Identity statement · Tiny habit (day 1 version) · Full habit (week 4 version) · Habit stack · Cue · Reward · Tracking method · Recovery plan for missed days', 4),
    ],
  },
  {
    id: 'journaling',
    i18n: meta('Journaling Prompts', 'Generate deep journaling prompts for self-reflection.',
               'Prompts de journaling', 'Générez des questions profondes pour la réflexion personnelle.'),
    category: 'personal',
    nodes: [
      n('role',        'You are a reflective writing coach and therapist-trained journaling guide.', 0),
      n('objective',   'Generate a set of journaling prompts based on the theme in the Input block.', 1),
      n('input',       '{{theme or area of life}} — e.g. "career transition", "relationship patterns", "fear of failure"', 2),
      n('constraints', '- Questions should be specific and introspective, not surface-level\n- Progress from easy to challenging\n- Include at least one future-visualization prompt\n- 10–15 prompts', 3),
    ],
  },
  {
    id: 'career-roadmap',
    i18n: meta('Career Roadmap', 'Plan a strategic career roadmap for the next 3–5 years.',
               'Feuille de route carrière', 'Planifiez une feuille de route carrière stratégique sur 3 à 5 ans.'),
    category: 'personal',
    nodes: [
      n('role',        'You are an executive career coach who has helped hundreds of professionals land dream jobs.', 0),
      n('objective',   'Create a strategic career roadmap based on the profile in the Input block.', 1),
      n('input',       '{{current role + skills + desired role/industry + timeline + constraints (location, salary, etc.)}}', 2),
      n('constraints', '- Identify the gap between where you are and where you want to be\n- Prioritize the highest-leverage skills to develop\n- Include: learning resources, network targets, milestone checkpoints', 3),
      n('output_format', 'Gap Analysis · 90-day plan · 1-year plan · 3-year vision · Key skills to develop · Network targets · Milestones', 4),
    ],
  },
  {
    id: 'decision-framework',
    i18n: meta('Decision Framework', 'Apply a structured framework to any important decision.',
               'Cadre de décision', 'Appliquez un cadre structuré à toute décision importante.'),
    category: 'personal',
    nodes: [
      n('role',        'You are a decision coach trained in cognitive science and behavioral economics.', 0),
      n('objective',   'Apply a structured decision framework to the choice described in the Input block.', 1),
      n('input',       '{{decision to make + options + constraints + what matters most to you + timeline}}', 2),
      n('chain_of_thought', 'Clarify the real decision → List all options (including "do nothing") → Evaluate by criteria → Check for biases → Stress-test the top choice.', 3),
      n('constraints', '- Surface cognitive biases that might be affecting the choice\n- Evaluate both short-term and long-term consequences\n- Include the reversibility of each option', 4),
      n('output_format', 'Decision framing · Options list · Evaluation matrix · Bias check · Recommendation · Pre-mortem (what could go wrong)', 5),
    ],
  },
  {
    id: 'salary-negotiation',
    i18n: meta('Salary Negotiation', 'Prepare for a salary negotiation with confidence.',
               'Négociation salariale', 'Préparez-vous à une négociation salariale avec confiance.'),
    category: 'personal',
    nodes: [
      n('role',        'You are a compensation expert and career coach who has helped people increase their salaries by 20%+.', 0),
      n('objective',   'Prepare a salary negotiation strategy for the situation in the Input block.', 1),
      n('input',       '{{current offer + target salary + market data if known + leverage points + company situation}}', 2),
      n('constraints', '- Never accept the first offer without negotiating\n- Anchor high but with rationale\n- Negotiate the whole package (equity, bonus, benefits, flexibility)\n- Prepare 3 counter scenarios', 3),
      n('output_format', 'Market research summary · Anchor number + rationale · Opening script · Counter-offer scenarios (low/medium/high) · Walk-away conditions · Follow-up plan', 4),
    ],
  },
  {
    id: 'networking-message',
    i18n: meta('Networking Message', 'Write a personalized message to connect with anyone.',
               'Message de networking', 'Rédigez un message personnalisé pour contacter n\'importe qui.'),
    category: 'personal',
    nodes: [
      n('role',        'You are a networking coach who believes in genuine, value-first outreach.', 0),
      n('audience',    '{{person you\'re reaching out to: name, role, why you admire them}}', 1),
      n('objective',   'Write a personalized networking message based on the context in the Input block.', 2),
      n('input',       '{{context: mutual connection, their work that inspired you, specific reason for reaching out}}', 3),
      n('constraints', '- Reference something specific about their work (not generic flattery)\n- Make the ask small and easy to say yes to\n- Under 100 words\n- No "picking your brain" or other clichés', 4),
    ],
  },
]
