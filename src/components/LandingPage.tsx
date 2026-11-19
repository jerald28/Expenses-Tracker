import { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './landing.css';

gsap.registerPlugin(ScrollTrigger);

type AuthMode = 'signin' | 'signup';

interface LandingPageProps {
  theme?: 'light' | 'dark';
  onAuth: (mode: AuthMode) => void;
}

// Free-to-use photos from Pexels (https://www.pexels.com/license/)
const px = (id: string, w: number) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${w}`;
const srcSet = (id: string, widths: number[]) => widths.map((w) => `${px(id, w)} ${w}w`).join(', ');

const RECEIPT = [
  ['Jeep fare, Cubao to Ortigas', 13],
  ['Kape sa umaga', 120],
  ['Lunch sa carinderia', 95],
  ['Load', 50],
  ['Merienda', 45],
  ['Grab pauwi', 238],
] as const;
const RECEIPT_TOTAL = RECEIPT.reduce((s, [, v]) => s + v, 0);

const SHOTS = [
  { id: '37400607', title: 'Jeep and Grab rides', sub: 'Commute', amount: '₱1,260', alt: 'A colorful jeepney on a sunny street in the Philippines' },
  { id: '6747870', title: 'The daily kape', sub: 'Coffee', amount: '₱2,400', alt: 'A cup of latte with latte art on a saucer' },
  { id: '20089299', title: 'Lunch and merienda', sub: 'Food', amount: '₱3,150', alt: 'A table full of Filipino dishes' },
  { id: '4177709', title: 'The weekly grocery run', sub: 'Groceries', amount: '₱4,800', alt: 'A shopper with a basket in a grocery aisle' },
  { id: '2604843', title: 'Bills and everything else', sub: 'Bills', amount: '₱5,600', alt: 'Busy Manila street on a rainy day' },
];

const peso = (n: number) => '₱' + n.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function LandingPage({ onAuth }: LandingPageProps) {
  const root = useRef<HTMLDivElement>(null);
  const totalRef = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        // Hero: headline rises out of its lines, then the receipt prints
        const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });
        tl.from('.lp-h1 .ln > span', { yPercent: 110, duration: 1.1, stagger: 0.09 })
          .from('.lp-lede, .lp-cta, .lp-note', { autoAlpha: 0, y: 18, duration: 0.8, stagger: 0.08 }, '-=0.7')
          .from('.lp-slot', { autoAlpha: 0, y: -12, duration: 0.5 }, '-=0.9')
          .from('.lp-receipt', { yPercent: -101, duration: 1.6, ease: 'steps(14)' }, '-=0.4')
          .from('.lp-receipt .lp-r-row', { autoAlpha: 0, duration: 0.01, stagger: 0.1 }, '<0.25');

        const counter = { v: 0 };
        tl.to(counter, {
          v: RECEIPT_TOTAL,
          duration: 1.1,
          ease: 'power2.out',
          onUpdate: () => {
            if (totalRef.current) totalRef.current.textContent = peso(Math.round(counter.v));
          },
        }, '-=0.6')
          .from('.lp-stamp', { autoAlpha: 0, scale: 1.6, rotate: -18, duration: 0.45, ease: 'back.out(2.2)' }, '-=0.2');

        // Final CTA background drifts slightly as it scrolls past
        gsap.to('.lp-final-bg', {
          yPercent: 10,
          ease: 'none',
          scrollTrigger: { trigger: '.lp-final', start: 'top bottom', end: 'bottom top', scrub: true },
        });
      });

      // Gallery: pinned horizontal scroll on larger screens
      mm.add('(min-width: 901px) and (prefers-reduced-motion: no-preference)', () => {
        const track = document.querySelector<HTMLElement>('.lp-track');
        if (!track) return;
        const distance = () => track.scrollWidth - window.innerWidth;
        const tween = gsap.to(track, {
          x: () => -distance(),
          ease: 'none',
          scrollTrigger: {
            trigger: '.lp-gallery',
            start: 'top top',
            end: () => '+=' + distance(),
            pin: true,
            scrub: 0.6,
            invalidateOnRefresh: true,
          },
        });
        gsap.utils.toArray<HTMLElement>('.lp-shot-img img').forEach((img) => {
          gsap.fromTo(img, { xPercent: 4 }, {
            xPercent: -4,
            ease: 'none',
            scrollTrigger: { trigger: img, containerAnimation: tween, start: 'left right', end: 'right left', scrub: true },
          });
        });
      });

      return () => mm.revert();
    }, root);

    // Recalculate pin distances once photos have loaded
    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener('load', refresh);
    return () => {
      window.removeEventListener('load', refresh);
      ctx.revert();
    };
  }, []);

  return (
    <div className="lp" ref={root} id="landing-root">
      <header className="lp-nav">
        <nav className="lp-wrap" aria-label="Main">
          <a className="lp-brand" href="#top">
            <span className="lp-coin" aria-hidden="true">₱</span>
            pesus
          </a>
          <div className="lp-nav-actions">
            <button type="button" className="lp-link" onClick={() => onAuth('signin')}>Sign in</button>
            <button type="button" className="lp-btn lp-btn--primary lp-btn--sm" onClick={() => onAuth('signup')}>Create account</button>
          </div>
        </nav>
      </header>

      <main id="top">
        <section className="lp-hero">
          <div className="lp-wrap">
            <div>
              <h1 className="lp-h1">
                <span className="ln"><span>Where did</span></span>
                <span className="ln"><span>my pesos</span></span>
                <span className="ln"><span>go?</span></span>
              </h1>
              <p className="lp-lede">
                Pesus answers that. Log what you spend in a few taps, see it by day, week and month, and stay under the budget you set.
              </p>
              <div className="lp-cta">
                <button type="button" className="lp-btn lp-btn--primary" onClick={() => onAuth('signup')}>Create free account</button>
                <button type="button" className="lp-btn lp-btn--ghost" onClick={() => onAuth('signin')}>Sign in</button>
              </div>
              <p className="lp-note">Uses your Google account. No new password to remember.</p>
            </div>

            <div className="lp-printer" aria-label="Example receipt of a day's spending">
              <div className="lp-slot" aria-hidden="true" />
              <div className="lp-feed">
                <div className="lp-receipt">
                  <div className="lp-r-head">
                    <strong>PESUS</strong>
                    <span>Thursday, 19 Nov</span>
                  </div>
                  {RECEIPT.map(([label, amount]) => (
                    <div className="lp-r-row" key={label}>
                      <span>{label}</span>
                      <span>{peso(amount)}</span>
                    </div>
                  ))}
                  <div className="lp-r-sep" />
                  <div className="lp-r-row lp-r-total">
                    <span>Total today</span>
                    <span ref={totalRef}>{peso(RECEIPT_TOTAL)}</span>
                  </div>
                  <div className="lp-r-row lp-r-left">
                    <span>Left this month</span>
                    <span>{peso(6439)}</span>
                  </div>
                  <div className="lp-r-foot">Salamat! Logged to your account.</div>
                </div>
              </div>
              <div className="lp-stamp" aria-hidden="true">Under<br />budget</div>
            </div>
          </div>
        </section>

        <section className="lp-gallery" aria-labelledby="gallery-title">
          <div className="lp-gallery-inner">
            <div className="lp-wrap lp-gallery-head">
              <h2 className="lp-h2" id="gallery-title">Small amounts<br />add up fast.</h2>
              <p>A ₱13 jeep ride and a ₱120 coffee don't feel like much. A month of them does. Pesus puts every category side by side.</p>
            </div>
            <div className="lp-gallery-scroller">
              <div className="lp-track">
                {SHOTS.map((s) => (
                  <figure className="lp-shot" key={s.id}>
                    <div className="lp-shot-img">
                      <img
                        src={px(s.id, 800)}
                        srcSet={srcSet(s.id, [480, 800, 1200])}
                        sizes="(max-width: 900px) 78vw, 30vw"
                        alt={s.alt}
                        loading="lazy"
                        decoding="async"
                      />
                    </div>
                    <span className="lp-tag">{s.amount}<small>a month</small></span>
                    <figcaption>
                      <b>{s.title}</b>
                      <span>{s.sub}</span>
                    </figcaption>
                  </figure>
                ))}
              </div>
            </div>
            <p className="lp-wrap lp-gallery-note">Sample monthly amounts, for illustration.</p>
          </div>
        </section>

        <section className="lp-steps" aria-labelledby="steps-title">
          <div className="lp-wrap lp-steps-grid">
            <h2 className="lp-h2" id="steps-title">Set up before your jeep gets to the next stop.</h2>
            <ol className="lp-step-list">
              <li className="lp-step">
                <span className="lp-coin" aria-hidden="true">1</span>
                <div>
                  <h3>Create your account</h3>
                  <p>Sign up with Google in one tap. Your data is tied to your account, so it's there on your phone and your laptop.</p>
                </div>
              </li>
              <li className="lp-step">
                <span className="lp-coin" aria-hidden="true">2</span>
                <div>
                  <h3>Log what you spend</h3>
                  <p>Type the amount, pick a category like Food, Transport or Bills, and save. That's the whole routine.</p>
                </div>
              </li>
              <li className="lp-step">
                <span className="lp-coin" aria-hidden="true">3</span>
                <div>
                  <h3>Check before you spend</h3>
                  <p>Your dashboard shows today, this week and this month, plus how much is left in your budget.</p>
                </div>
              </li>
            </ol>
          </div>
        </section>

        <section className="lp-features" aria-labelledby="features-title">
          <div className="lp-wrap lp-feat-grid">
            <div className="lp-feat-photo">
              <img
                src={px('13929418', 1200)}
                srcSet={srcSet('13929418', [600, 1000, 1400])}
                sizes="(max-width: 900px) 100vw, 55vw"
                alt="A woman checking her phone"
                loading="lazy"
                decoding="async"
              />
              <div className="lp-mini" aria-hidden="true">
                <div className="lp-mini-top"><span>Spent in November</span><span>64%</span></div>
                <div className="lp-mini-amt">₱9,610</div>
                <div className="lp-bar"><i /></div>
                <div className="lp-mini-bottom"><span>Budget ₱15,000</span><span>₱5,390 left</span></div>
              </div>
            </div>
            <div className="lp-feat-card">
              <h2 className="lp-h3" id="features-title">Everything a budget needs. Nothing it doesn't.</h2>
              <ul className="lp-feat-list">
                <li><b>Daily, weekly and monthly totals</b><span>See what you spent today and how the month is going.</span></li>
                <li><b>A monthly budget limit</b><span>Set it once and watch what's left shrink or hold.</span></li>
                <li><b>Categories that make sense</b><span>Food, transport, bills, shopping, entertainment and more.</span></li>
                <li><b>Synced to your Google account</b><span>Sign in anywhere and your expenses are there.</span></li>
                <li><b>Backups you control</b><span>Export your data to a file and restore it whenever you need.</span></li>
              </ul>
            </div>
          </div>
        </section>

        <section className="lp-final" aria-labelledby="final-title">
          <div className="lp-final-bg" aria-hidden="true">
            <img src={px('188916', 1600)} srcSet={srcSet('188916', [800, 1600, 2400])} sizes="100vw" alt="" loading="lazy" decoding="async" />
          </div>
          <div className="lp-wrap">
            <h2 className="lp-h2" id="final-title">Next payday, know exactly where it went.</h2>
            <p>Pesus is free. Create your account with Google and log your first expense today.</p>
            <div className="lp-cta">
              <button type="button" className="lp-btn lp-btn--light" onClick={() => onAuth('signup')}>Create free account</button>
              <button type="button" className="lp-btn lp-btn--outline-light" onClick={() => onAuth('signin')}>Sign in</button>
            </div>
          </div>
        </section>
      </main>

      <footer className="lp-foot">
        <div className="lp-wrap">
          <span className="lp-brand"><span className="lp-coin" aria-hidden="true">₱</span>pesus</span>
          <span>© {new Date().getFullYear()} Pesus. Photos from <a href="https://www.pexels.com" target="_blank" rel="noreferrer">Pexels</a>.</span>
        </div>
      </footer>
    </div>
  );
}
