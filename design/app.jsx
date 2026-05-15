// app.jsx — root app: phone shell, routing, tweaks

const { useState: useStateA, useEffect: useEffectA, useMemo: useMemoA, useRef: useRefA } = React;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accent": "#a35a1c",
  "bgTone": "cream",
  "typePair": "fraunces",
  "bodySize": 18,
  "citationStyle": "inline",
  "dark": false
}/*EDITMODE-END*/;

// Curated accent palette — keyed by hex for the swatch picker.
// soft is the same hue but with alpha for callouts/highlights.
const ACCENTS = {
  "#a35a1c": { name: "Ochre",       light: "oklch(52% 0.13 55)",  dark: "oklch(74% 0.13 65)",  soft: "oklch(52% 0.13 55 / 0.10)",  veil: "oklch(52% 0.13 55 / 0.05)" },
  "#a14633": { name: "Terracotta",  light: "oklch(54% 0.13 32)",  dark: "oklch(72% 0.13 35)",  soft: "oklch(54% 0.13 32 / 0.10)",  veil: "oklch(54% 0.13 32 / 0.05)" },
  "#1e4a5f": { name: "Ink blue",    light: "oklch(38% 0.08 225)", dark: "oklch(74% 0.08 215)", soft: "oklch(38% 0.08 225 / 0.10)", veil: "oklch(38% 0.08 225 / 0.05)" },
  "#2c5340": { name: "Forest",      light: "oklch(40% 0.09 150)", dark: "oklch(74% 0.09 150)", soft: "oklch(40% 0.09 150 / 0.10)", veil: "oklch(40% 0.09 150 / 0.05)" },
};

const BG_TONES = {
  cream: { name: "Cream",  light: "oklch(96% 0.018 80)",  ink: "oklch(20% 0.008 65)", muted: "oklch(82% 0.012 70)", veil: "oklch(92% 0.014 75)" },
  bone:  { name: "Bone",   light: "oklch(98% 0.008 85)",  ink: "oklch(18% 0.006 65)", muted: "oklch(85% 0.008 75)", veil: "oklch(94% 0.008 80)" },
  ivory: { name: "Ivory",  light: "oklch(96% 0.005 95)",  ink: "oklch(19% 0.005 70)", muted: "oklch(85% 0.006 85)", veil: "oklch(93% 0.006 90)" },
};

const TYPE_PAIRS = {
  fraunces:   { name: "Fraunces / Newsreader",        display: "'Fraunces', Georgia, serif",       body: "'Newsreader', Georgia, serif",          meta: "'Public Sans', system-ui, sans-serif" },
  instrument: { name: "Instrument / Source",          display: "'Instrument Serif', Georgia, serif", body: "'Source Serif 4', Georgia, serif",     meta: "'Geist Mono', ui-monospace, monospace" },
  bricolage:  { name: "Fraunces / Source / Bricolage", display: "'Fraunces', Georgia, serif",      body: "'Source Serif 4', Georgia, serif",      meta: "'Bricolage Grotesque', system-ui, sans-serif" },
};

const CITATION_STYLES = {
  inline:   { name: "Inline expand" },
  sheet:    { name: "Bottom sheet" },
  footnote: { name: "Footnote" },
};

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [route, setRoute] = useStateA({ view: "home" });
  const [menuOpen, setMenuOpen] = useStateA(false);
  const [showSplash, setShowSplash] = useStateA(true);
  const scrollRef = useRefA(null);

  // Splash on first paint to feel a touch editorial
  useEffectA(() => {
    const t = setTimeout(() => setShowSplash(false), 900);
    return () => clearTimeout(t);
  }, []);

  // Apply theme variables to the phone screen root
  const accent = ACCENTS[t.accent] || ACCENTS["#a35a1c"];
  const bg = BG_TONES[t.bgTone] || BG_TONES.cream;
  const tp = TYPE_PAIRS[t.typePair] || TYPE_PAIRS.fraunces;

  const themeStyle = {
    "--accent":      t.dark ? accent.dark  : accent.light,
    "--accent-soft": accent.soft,
    "--accent-veil": accent.veil,
    "--bg":          t.dark ? "oklch(17% 0.006 60)" : bg.light,
    "--ink":         t.dark ? "oklch(92% 0.008 75)" : bg.ink,
    "--ink-soft":    t.dark ? "oklch(75% 0.008 75)" : "oklch(40% 0.008 65)",
    "--ink-faint":   t.dark ? "oklch(45% 0.006 65)" : "oklch(65% 0.006 65)",
    "--rule":        t.dark ? "oklch(28% 0.006 60)" : bg.muted,
    "--veil":        t.dark ? "oklch(22% 0.008 60)" : bg.veil,
    "--font-display": tp.display,
    "--font-body":   tp.body,
    "--font-meta":   tp.meta,
    "--body-size":   `${t.bodySize}px`,
  };

  // Reset scroll on route change
  useEffectA(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [route.view, route.slug]);

  const onNav = (r) => {
    setRoute(r);
    setMenuOpen(false);
  };

  let body;
  switch (route.view) {
    case "article":    body = <ArticlePage slug={route.slug} onNav={onNav} citationStyle={t.citationStyle} />; break;
    case "synthesis":  body = <SynthesisPage onNav={onNav} />; break;
    case "rebuttals":  body = <RebuttalIndex onNav={onNav} />; break;
    case "topic":      body = <TopicPage slug={route.slug} onNav={onNav} />; break;
    case "newsletter": body = <NewsletterPage onNav={onNav} />; break;
    default:           body = <HomePage onNav={onNav} />;
  }

  return (
    <div className="stage">
      <div className="bezel" style={themeStyle} data-dark={t.dark || undefined}>
        <div className="screen">
          <PhoneStatusBar dark={t.dark} />
          <Masthead
            onMenu={() => setMenuOpen(true)}
            onHome={() => onNav({ view: "home" })}
            view={route.view}
            onSearch={() => onNav({ view: "topic", slug: "behavioural" })}
          />
          <div className="phone-scroll" ref={scrollRef}>
            {body}
          </div>
          <PhoneGestureBar dark={t.dark} />
          <SideMenu open={menuOpen} onClose={() => setMenuOpen(false)} onNav={onNav} />
          {showSplash && <SplashOverlay />}
        </div>
      </div>

      <TweaksUI t={t} setTweak={setTweak} />
    </div>
  );
}

function PhoneStatusBar({ dark }) {
  return (
    <div className="status-bar" aria-hidden="true">
      <span className="status-time">9:41</span>
      <span className="status-notch" />
      <span className="status-icons">
        <svg width="14" height="10" viewBox="0 0 14 10"><path d="M0 8h2v2H0zM4 6h2v4H4zM8 3h2v7H8zM12 0h2v10h-2z" fill="currentColor"/></svg>
        <svg width="14" height="10" viewBox="0 0 14 10"><path d="M2 1c2-1 8-1 10 0l-1 1c-2-1-6-1-8 0L2 1zM3 4c1.5-1 6-1 8 0l-1 1c-1.5-1-4.5-1-6 0L3 4zm1 3c1-.7 4-.7 5 0l-1 1c-1-.6-2-.6-3 0L4 7z" fill="currentColor"/></svg>
        <svg width="20" height="10" viewBox="0 0 20 10"><rect x="0.5" y="1.5" width="16" height="7" rx="1.5" stroke="currentColor" fill="none"/><rect x="2" y="3" width="11" height="4" fill="currentColor"/><rect x="17" y="3.5" width="1.5" height="3" fill="currentColor"/></svg>
      </span>
    </div>
  );
}
function PhoneGestureBar() {
  return <div className="gesture-bar" aria-hidden="true"><span /></div>;
}

function SplashOverlay() {
  return (
    <div className="splash">
      <div className="splash-mark">
        <span className="splash-the">The</span>
        <span className="splash-ne">Nigerian Economists</span>
        <span className="splash-rule" />
        <span className="splash-tag">Rigorous economic commentary on Nigeria</span>
      </div>
    </div>
  );
}

// ───────────────────────── Tweaks UI ─────────────────────────
function TweaksUI({ t, setTweak }) {
  const accentOpts = Object.keys(ACCENTS);
  return (
    <TweaksPanel title="Tweaks">
      <TweakSection label="Theme" />
      <TweakRadio label="Mode" value={t.dark ? "dark" : "light"}
        options={["light","dark"]}
        onChange={(v) => setTweak("dark", v === "dark")} />
      <TweakColor label="Accent" value={t.accent}
        options={accentOpts}
        onChange={(v) => setTweak("accent", v)} />
      <TweakRadio label="Paper" value={t.bgTone}
        options={["cream","bone","ivory"]}
        onChange={(v) => setTweak("bgTone", v)} />

      <TweakSection label="Typography" />
      <TweakSelect label="Type pairing" value={t.typePair}
        options={Object.entries(TYPE_PAIRS).map(([k,v]) => ({ value: k, label: v.name }))}
        onChange={(v) => setTweak("typePair", v)} />
      <TweakSlider label="Body size" value={t.bodySize} min={16} max={20} step={1} unit="px"
        onChange={(v) => setTweak("bodySize", v)} />

      <TweakSection label="Reading" />
      <TweakSelect label="Citations" value={t.citationStyle}
        options={Object.entries(CITATION_STYLES).map(([k,v]) => ({ value: k, label: v.name }))}
        onChange={(v) => setTweak("citationStyle", v)} />
    </TweaksPanel>
  );
}

// Mount
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
