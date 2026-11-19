import { motion, useReducedMotion } from 'motion/react';
import {
  Wallet,
  ArrowRight,
  PieChart,
  Target,
  Cloud,
  Moon,
  Tags,
  Download,
  Utensils,
  Car,
  ShoppingBag,
  Home,
} from 'lucide-react';

type AuthMode = 'signin' | 'signup';

interface LandingPageProps {
  theme: 'light' | 'dark';
  onAuth: (mode: AuthMode) => void;
}

const FEATURES = [
  {
    icon: PieChart,
    title: 'See where it goes',
    body: 'Daily, weekly and monthly totals with a clear breakdown by category.',
    tint: 'text-blue-500 bg-blue-500/10',
  },
  {
    icon: Target,
    title: 'Set a monthly budget',
    body: 'Pick a limit and watch how much you have left before payday.',
    tint: 'text-emerald-500 bg-emerald-500/10',
  },
  {
    icon: Tags,
    title: 'Simple categories',
    body: 'Food, transport, bills, shopping and more — log an expense in seconds.',
    tint: 'text-orange-500 bg-orange-500/10',
  },
  {
    icon: Cloud,
    title: 'Synced to your account',
    body: 'Sign in with Google and your expenses follow you to any device.',
    tint: 'text-sky-500 bg-sky-500/10',
  },
  {
    icon: Moon,
    title: 'Light and dark mode',
    body: 'Easy on the eyes, day or night.',
    tint: 'text-purple-500 bg-purple-500/10',
  },
  {
    icon: Download,
    title: 'Back up anytime',
    body: 'Export your data to a file and restore it whenever you need.',
    tint: 'text-pink-500 bg-pink-500/10',
  },
];

const STEPS = [
  { n: '1', title: 'Create your account', body: 'One tap with your Google account. No passwords to remember.' },
  { n: '2', title: 'Log your expenses', body: 'Add the amount, pick a category and you are done.' },
  { n: '3', title: 'Spend smarter', body: 'Review your totals and stay within your monthly budget.' },
];

const PREVIEW_ITEMS = [
  { icon: Utensils, label: 'Lunch', category: 'Food & Dining', amount: '₱185', tint: 'text-orange-500 bg-orange-500/10' },
  { icon: Car, label: 'Grab to work', category: 'Transportation', amount: '₱240', tint: 'text-blue-500 bg-blue-500/10' },
  { icon: ShoppingBag, label: 'Groceries', category: 'Shopping', amount: '₱1,320', tint: 'text-pink-500 bg-pink-500/10' },
  { icon: Home, label: 'Electric bill', category: 'Housing & Bills', amount: '₱2,450', tint: 'text-emerald-500 bg-emerald-500/10' },
];

export default function LandingPage({ theme, onAuth }: LandingPageProps) {
  const reduceMotion = useReducedMotion();
  const fadeUp = (delay = 0) =>
    reduceMotion
      ? {}
      : {
          initial: { opacity: 0, y: 16 },
          whileInView: { opacity: 1, y: 0 },
          viewport: { once: true, margin: '-40px' },
          transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1], delay },
        };

  const PrimaryButton = ({ label = 'Create account', className = '' }: { label?: string; className?: string }) => (
    <button
      type="button"
      onClick={() => onAuth('signup')}
      className={`inline-flex items-center justify-center gap-2 h-12 px-6 rounded-2xl bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold shadow-lg shadow-blue-500/25 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[#0A0A0C] ${className}`}
    >
      {label}
      <ArrowRight size={16} aria-hidden="true" />
    </button>
  );

  const SecondaryButton = ({ className = '' }: { className?: string }) => (
    <button
      type="button"
      onClick={() => onAuth('signin')}
      className={`inline-flex items-center justify-center h-12 px-6 rounded-2xl bg-white dark:bg-[#1C1C1E] border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white text-sm font-semibold hover:bg-neutral-50 dark:hover:bg-[#2C2C2E] transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[#0A0A0C] ${className}`}
    >
      Sign in
    </button>
  );

  return (
    <div className={`${theme} min-h-screen`} id="landing-root">
      <div className="min-h-screen overflow-x-clip bg-[#F4F4F7] dark:bg-[#0A0A0C] text-neutral-900 dark:text-white font-sans antialiased transition-colors">
        {/* Nav */}
        <header className="sticky top-0 z-30 bg-[#F4F4F7]/85 dark:bg-[#0A0A0C]/85 backdrop-blur-md border-b border-neutral-200/60 dark:border-neutral-800/60">
          <nav className="max-w-6xl mx-auto px-4 sm:px-5 h-16 flex items-center justify-between" aria-label="Main">
            <a href="#top" className="flex items-center gap-2 sm:gap-2.5 font-bold tracking-tight whitespace-nowrap">
              <span className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-blue-500 text-white shadow-md shadow-blue-500/25">
                <Wallet size={18} aria-hidden="true" />
              </span>
              Pesus Tracker
            </a>
            <div className="flex items-center gap-1 sm:gap-2">
              <button
                type="button"
                onClick={() => onAuth('signin')}
                className="h-9 sm:h-10 px-3 sm:px-4 whitespace-nowrap rounded-xl text-[13px] sm:text-sm font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200/60 dark:hover:bg-neutral-800/60 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                Sign in
              </button>
              <button
                type="button"
                onClick={() => onAuth('signup')}
                className="h-9 sm:h-10 px-3 sm:px-4 whitespace-nowrap rounded-xl text-[13px] sm:text-sm font-semibold bg-blue-500 hover:bg-blue-600 text-white transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
              >
                Create account
              </button>
            </div>
          </nav>
        </header>

        <main id="top">
          {/* Hero */}
          <section className="max-w-6xl mx-auto px-5 pt-14 pb-20 md:pt-24 md:pb-28 grid md:grid-cols-2 gap-14 items-center">
            <motion.div {...fadeUp()}>
              <span className="inline-flex items-center gap-2 text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-500/10 px-3 py-1.5 rounded-full">
                Free expense tracker
              </span>
              <h1 className="mt-5 text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.05]">
                Know where every peso goes.
              </h1>
              <p className="mt-5 text-base md:text-lg text-neutral-600 dark:text-neutral-400 max-w-md leading-relaxed">
                Track your daily, weekly and monthly expenses in one place, stay on budget, and make smarter money decisions.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <PrimaryButton label="Create free account" />
                <SecondaryButton />
              </div>
              <p className="mt-4 text-xs text-neutral-500 dark:text-neutral-500">Sign in with your Google account — no password needed.</p>
            </motion.div>

            {/* App preview */}
            <motion.div {...fadeUp(0.1)} className="relative" aria-hidden="true">
              <div className="absolute -inset-6 bg-blue-500/10 dark:bg-blue-500/5 blur-3xl rounded-full" />
              <div className="relative mx-auto max-w-sm bg-white dark:bg-[#1C1C1E] rounded-[2rem] border border-neutral-200/70 dark:border-neutral-800 shadow-2xl p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">This month</p>
                    <p className="mt-1 text-3xl font-bold tracking-tight">₱4,195</p>
                  </div>
                  <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full">
                    On budget
                  </span>
                </div>
                <div className="mt-4">
                  <div className="flex justify-between text-[11px] font-medium text-neutral-500 dark:text-neutral-400">
                    <span>Budget ₱10,000</span>
                    <span>₱5,805 left</span>
                  </div>
                  <div className="mt-1.5 h-2 rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
                    <div className="h-full w-[42%] rounded-full bg-blue-500" />
                  </div>
                </div>
                <ul className="mt-5 space-y-2.5">
                  {PREVIEW_ITEMS.map((item) => (
                    <li key={item.label} className="flex items-center gap-3 p-2.5 rounded-2xl bg-neutral-50 dark:bg-neutral-900/60">
                      <span className={`inline-flex items-center justify-center w-9 h-9 rounded-xl ${item.tint}`}>
                        <item.icon size={16} />
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate">{item.label}</p>
                        <p className="text-[11px] text-neutral-500 dark:text-neutral-400">{item.category}</p>
                      </div>
                      <span className="text-sm font-semibold tabular-nums">{item.amount}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          </section>

          {/* Features */}
          <section className="bg-white dark:bg-[#111113] border-y border-neutral-200/60 dark:border-neutral-800/60" aria-labelledby="features-title">
            <div className="max-w-6xl mx-auto px-5 py-20 md:py-24">
              <motion.div {...fadeUp()} className="max-w-xl">
                <h2 id="features-title" className="text-3xl md:text-4xl font-bold tracking-tight">Everything you need, nothing you don't.</h2>
                <p className="mt-3 text-neutral-600 dark:text-neutral-400">A clean, simple tracker built for everyday spending.</p>
              </motion.div>
              <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {FEATURES.map((f, i) => (
                  <motion.div
                    key={f.title}
                    {...fadeUp(reduceMotion ? 0 : i * 0.05)}
                    className="p-6 rounded-3xl bg-[#F4F4F7] dark:bg-[#1C1C1E] border border-neutral-200/60 dark:border-neutral-800"
                  >
                    <span className={`inline-flex items-center justify-center w-11 h-11 rounded-2xl ${f.tint}`}>
                      <f.icon size={20} aria-hidden="true" />
                    </span>
                    <h3 className="mt-4 text-base font-semibold">{f.title}</h3>
                    <p className="mt-1.5 text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">{f.body}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* How it works */}
          <section className="max-w-6xl mx-auto px-5 py-20 md:py-24" aria-labelledby="steps-title">
            <motion.h2 {...fadeUp()} id="steps-title" className="text-3xl md:text-4xl font-bold tracking-tight text-center">
              Start in under a minute
            </motion.h2>
            <ol className="mt-12 grid md:grid-cols-3 gap-6">
              {STEPS.map((s, i) => (
                <motion.li key={s.n} {...fadeUp(reduceMotion ? 0 : i * 0.08)} className="text-center md:text-left">
                  <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-blue-500 text-white text-sm font-bold">
                    {s.n}
                  </span>
                  <h3 className="mt-4 text-lg font-semibold">{s.title}</h3>
                  <p className="mt-1.5 text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed max-w-xs mx-auto md:mx-0">{s.body}</p>
                </motion.li>
              ))}
            </ol>
          </section>

          {/* Final CTA */}
          <section className="max-w-6xl mx-auto px-5 pb-20 md:pb-24">
            <motion.div
              {...fadeUp()}
              className="rounded-[2rem] bg-blue-500 text-white px-6 py-14 md:px-14 md:py-16 text-center shadow-xl shadow-blue-500/20"
            >
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Take control of your spending today.</h2>
              <p className="mt-3 text-blue-50/90 max-w-md mx-auto">It's free. Create your account with Google and log your first expense in seconds.</p>
              <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  type="button"
                  onClick={() => onAuth('signup')}
                  className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-2xl bg-white text-blue-600 text-sm font-semibold hover:bg-blue-50 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-blue-500"
                >
                  Create account
                  <ArrowRight size={16} aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => onAuth('signin')}
                  className="inline-flex items-center justify-center h-12 px-6 rounded-2xl border border-white/40 text-white text-sm font-semibold hover:bg-white/10 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-blue-500"
                >
                  Sign in
                </button>
              </div>
            </motion.div>
          </section>
        </main>

        <footer className="border-t border-neutral-200/60 dark:border-neutral-800/60">
          <div className="max-w-6xl mx-auto px-5 py-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-neutral-500">
            <span className="flex items-center gap-2 font-semibold text-neutral-700 dark:text-neutral-300">
              <Wallet size={14} className="text-blue-500" aria-hidden="true" />
              Pesus Tracker
            </span>
            <span>© {new Date().getFullYear()} Pesus Tracker. All rights reserved.</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
