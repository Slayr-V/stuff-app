import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withDelay, withRepeat, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppButton, AppText, Icon, Logo, PlaceholderTile, theme } from '@/components';
import { signInWithEmail, signUpWithEmail } from '@/services/auth';
import { saveOnboardingAnswers } from '@/services/profile';

// The full "quiz first, account second" flow from the design handoff's
// turn 3: Welcome -> 4 quiz questions -> Building -> Ready -> Auth. Every
// interaction (chip/tile/row/budget selection, progress, back/skip, the
// real sign-up/sign-in) is real. Two things are deliberately example
// content rather than real data, called out where they appear below: the
// "Building your feed" sequence has nothing real to report progress on
// yet (Discover personalization doesn't exist), and the Ready screen's
// match count is the design's own placeholder number. The mockup's final
// "You're in, Mara" screen is a demo dead-end (hardcoded name, "run the
// flow again" button) and isn't built — a real successful sign-up/sign-in
// updates the session, and the root layout's Stack.Protected guard swaps
// this whole screen out for the real tab app automatically.

type AnswerKey = 'categories' | 'taste' | 'sources' | 'budget';

type QuestionOption = {
  id: string;
  label: string;
  sub?: string;
  slot?: string;
  initial?: string;
  bars?: number;
};

type Question = {
  key: AnswerKey;
  type: 'chips' | 'tiles' | 'rows' | 'budget';
  eyebrow: string;
  min: number;
  single?: boolean;
  title: string;
  hint: string;
  options: QuestionOption[];
};

const QUESTIONS: Question[] = [
  {
    key: 'categories',
    type: 'chips',
    eyebrow: 'Question 1 of 4',
    min: 2,
    title: 'What do you find yourself saving?',
    hint: 'Pick at least two — more is better.',
    options: [
      { id: 'furniture', label: 'Furniture' },
      { id: 'lighting', label: 'Lighting' },
      { id: 'ceramics', label: 'Ceramics' },
      { id: 'textiles', label: 'Textiles' },
      { id: 'kitchen', label: 'Kitchen' },
      { id: 'footwear', label: 'Footwear' },
      { id: 'clothing', label: 'Clothing' },
      { id: 'bags', label: 'Bags' },
      { id: 'jewellery', label: 'Jewellery' },
      { id: 'fragrance', label: 'Fragrance' },
      { id: 'audio', label: 'Audio' },
      { id: 'books', label: 'Books & print' },
      { id: 'plants', label: 'Plants' },
      { id: 'vintage', label: 'Vintage' },
    ],
  },
  {
    key: 'taste',
    type: 'tiles',
    eyebrow: 'Question 2 of 4',
    min: 1,
    title: 'Which of these feels like you?',
    hint: 'Tap the rooms you would happily live in.',
    options: [
      { id: 'warm-minimal', label: 'Warm minimal', sub: 'Oak, linen, quiet', slot: 'aesthetic' },
      { id: 'raw', label: 'Raw & material', sub: 'Concrete, steel, clay', slot: 'aesthetic' },
      { id: 'mid-century', label: 'Mid-century', sub: 'Walnut, brass, curves', slot: 'aesthetic' },
      { id: 'soft-brutal', label: 'Soft brutal', sub: 'Heavy forms, pale tones', slot: 'aesthetic' },
      { id: 'colour', label: 'Colour-led', sub: 'Bold, playful, graphic', slot: 'aesthetic' },
      { id: 'archive', label: 'Archive', sub: 'Second-hand, worn-in', slot: 'aesthetic' },
    ],
  },
  {
    key: 'sources',
    type: 'rows',
    eyebrow: 'Question 3 of 4',
    min: 1,
    title: 'Where do you spot things?',
    hint: 'We will prioritise these when matching your finds.',
    options: [
      { id: 'instagram', label: 'Instagram', sub: 'Reels, stories, posts', initial: 'IG' },
      { id: 'tiktok', label: 'TikTok', sub: 'Videos and lives', initial: 'TT' },
      { id: 'pinterest', label: 'Pinterest', sub: 'Pins and boards', initial: 'PI' },
      { id: 'irl', label: 'Out in the world', sub: 'Shops, cafés, friends’ places', initial: 'IRL' },
      { id: 'web', label: 'Around the web', sub: 'Newsletters, blogs, shops', initial: 'WEB' },
    ],
  },
  {
    key: 'budget',
    type: 'budget',
    eyebrow: 'Question 4 of 4',
    min: 1,
    single: true,
    title: 'What are you usually spending?',
    hint: 'Per item, roughly.',
    options: [
      { id: 'under50', label: 'Under £50', sub: 'Small treats and top-ups', bars: 1 },
      { id: '50-200', label: '£50 – £200', sub: 'Considered everyday pieces', bars: 2 },
      { id: '200-800', label: '£200 – £800', sub: 'Saving up for the good one', bars: 3 },
      { id: 'over800', label: '£800 and up', sub: 'Investment, keep-forever', bars: 4 },
    ],
  },
];

const LABELS: Record<string, string> = {};
QUESTIONS.forEach((q) => q.options.forEach((o) => { LABELS[o.id] = o.label; }));

const BUILD_LINES = ['Reading your picks', 'Finding brands that fit', 'Ranking your matches', 'Almost there'];

const EMPTY_ANSWERS: Record<AnswerKey, string[]> = { categories: [], taste: [], sources: [], budget: [] };

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState(0); // 0 welcome · 1-4 quiz · 5 building · 6 ready · 7 auth
  const [answers, setAnswers] = useState(EMPTY_ANSWERS);
  const [mode, setMode] = useState<'signup' | 'login'>('signup');
  const [buildIdx, setBuildIdx] = useState(0);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authInfo, setAuthInfo] = useState<string | null>(null);

  const qi = step - 1;
  const question = qi >= 0 && qi < QUESTIONS.length ? QUESTIONS[qi] : null;
  const picked = question ? answers[question.key] : [];
  const enough = question ? picked.length >= question.min : true;

  // Drives the Building step. Real advancement to Ready only happens
  // once this fixed sequence finishes — there's no real "feed build"
  // request to wait on instead, since Discover matching isn't built yet.
  useEffect(() => {
    if (step !== 5) return;
    setBuildIdx(0);
    const interval = setInterval(() => {
      setBuildIdx((i) => Math.min(i + 1, BUILD_LINES.length - 1));
    }, 620);
    const timeout = setTimeout(() => {
      clearInterval(interval);
      setStep(6);
    }, 2600);
    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [step]);

  function toggleAnswer(key: AnswerKey, id: string, single?: boolean) {
    setAnswers((prev) => {
      const cur = prev[key];
      const next = single ? [id] : cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id];
      return { ...prev, [key]: next };
    });
  }

  function goNext() {
    if (question && !enough) return;
    setStep((s) => Math.min(s + 1, 7));
  }
  function skip() {
    setStep((s) => Math.min(s + 1, 7));
  }
  function goBack() {
    setStep((s) => Math.max(s - 1, 0));
  }
  function toAuth(nextMode: 'signup' | 'login') {
    setMode(nextMode);
    setAuthError(null);
    setAuthInfo(null);
    setStep(7);
  }

  function handleSocial(provider: 'Apple' | 'Google') {
    Alert.alert(
      `Continue with ${provider}`,
      `${provider} sign-in needs a custom Expo dev build — Expo Go can't run native ${provider} auth modules. Use email for now; this will be wired to Supabase once that build exists.`,
    );
  }

  function handleForgotPassword() {
    Alert.alert(
      'Not set up yet',
      "Password reset isn't wired up yet — for now, use the same email and password you signed up with.",
    );
  }

  async function handleAuthSubmit() {
    setSubmitting(true);
    setAuthError(null);
    setAuthInfo(null);
    try {
      if (mode === 'signup') {
        const result = await signUpWithEmail(email.trim(), password);
        if (result.session) {
          saveOnboardingAnswers(result.session.user.id, answers).catch(() => {
            // Best-effort — nothing reads this yet, so a failed write
            // shouldn't block getting into the real app.
          });
        } else {
          setAuthInfo('Check your email to confirm your account, then log in.');
          setMode('login');
        }
      } else {
        const result = await signInWithEmail(email.trim(), password);
        if (result.session) {
          saveOnboardingAnswers(result.session.user.id, answers).catch(() => {});
        }
      }
      // On success, useAuth's session updates and the root layout's
      // Stack.Protected guard swaps this screen out for (tabs) — no
      // explicit navigation needed from here.
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : 'Something went wrong. Try again.');
    } finally {
      setSubmitting(false);
    }
  }

  const allPicks = ([] as string[])
    .concat(answers.categories, answers.taste, answers.sources, answers.budget)
    .map((id) => LABELS[id])
    .slice(0, 8);

  return (
    <View style={styles.root}>
      <StatusBar style={step === 0 ? 'light' : 'dark'} />

      {step === 0 ? (
        <WelcomeStep insets={insets} onStart={() => setStep(1)} onLogin={() => toAuth('login')} />
      ) : null}

      {question ? (
        <QuizStep
          insets={insets}
          question={question}
          qi={qi}
          selected={picked}
          enough={enough}
          onToggle={(id) => toggleAnswer(question.key, id, question.single)}
          onBack={goBack}
          onNext={goNext}
          onSkip={skip}
        />
      ) : null}

      {step === 5 ? <BuildingStep insets={insets} line={BUILD_LINES[buildIdx]} /> : null}

      {step === 6 ? (
        <ReadyStep insets={insets} picks={allPicks} onEdit={() => setStep(0)} onContinue={() => toAuth('signup')} />
      ) : null}

      {step === 7 ? (
        <AuthStep
          insets={insets}
          mode={mode}
          email={email}
          setEmail={setEmail}
          password={password}
          setPassword={setPassword}
          showPassword={showPassword}
          setShowPassword={setShowPassword}
          submitting={submitting}
          error={authError}
          info={authInfo}
          onBack={goBack}
          onSubmit={handleAuthSubmit}
          onToggleMode={() => toAuth(mode === 'login' ? 'signup' : 'login')}
          onSocial={handleSocial}
          onForgotPassword={handleForgotPassword}
        />
      ) : null}
    </View>
  );
}

type Insets = ReturnType<typeof useSafeAreaInsets>;

// ---------------------------------------------------------------------------
// Step 0 — Welcome

function WelcomeStep({ insets, onStart, onLogin }: { insets: Insets; onStart: () => void; onLogin: () => void }) {
  return (
    <View style={styles.welcomeRoot}>
      <View style={styles.welcomeHero}>
        <PlaceholderTile
          backgroundColor="#1c1c1c"
          stripeColor="rgba(255,255,255,0.05)"
          radius={26}
          style={[styles.heroTile, styles.heroTile1]}
        />
        <PlaceholderTile
          backgroundColor="#171717"
          stripeColor="rgba(255,255,255,0.05)"
          radius={26}
          style={[styles.heroTile, styles.heroTile2]}
        />
        <PlaceholderTile
          backgroundColor="#141414"
          stripeColor="rgba(255,255,255,0.05)"
          radius={26}
          style={[styles.heroTile, styles.heroTile3]}
        />
        <View style={styles.heroFade} />
      </View>
      <View style={[styles.welcomeFooter, { paddingBottom: insets.bottom + 24 }]}>
        {/* The raster logo asset is black wordmark on a white ground — it
            can't be recolored white for this dark screen without a
            transparent export (same limitation noted in Logo.tsx), so
            this one spot uses styled text instead. */}
        <AppText style={styles.welcomeWordmark}>stuff</AppText>
        <View style={styles.welcomeCopy}>
          <AppText style={styles.welcomeHeadline}>Everything you{'\n'}liked, in one place.</AppText>
          <AppText style={styles.welcomeSub}>
            Answer four quick questions and we&apos;ll build your Discover feed before you even sign up.
          </AppText>
        </View>
        <AppButton title="Start" onPress={onStart} variant="secondary" />
        <Pressable onPress={onLogin} hitSlop={6}>
          <AppText style={styles.welcomeLoginLink}>I already have an account</AppText>
        </Pressable>
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Steps 1-4 — Quiz

function QuizStep({
  insets,
  question,
  qi,
  selected,
  enough,
  onToggle,
  onBack,
  onNext,
  onSkip,
}: {
  insets: Insets;
  question: Question;
  qi: number;
  selected: string[];
  enough: boolean;
  onToggle: (id: string) => void;
  onBack: () => void;
  onNext: () => void;
  onSkip: () => void;
}) {
  const pct = Math.round((Math.max(qi, 0) / QUESTIONS.length) * 100) + 25;
  const isLast = qi === QUESTIONS.length - 1;
  const showCount = !question.single && selected.length > 0;

  return (
    <View style={styles.quizRoot}>
      <View style={[styles.quizNav, { paddingTop: insets.top + 12 }]}>
        <Pressable onPress={onBack} style={styles.roundIconButton} hitSlop={6}>
          <Icon name="back" size={16} color={theme.colors.ink} strokeWidth={1.7} />
        </Pressable>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${pct}%` }]} />
        </View>
        <AppText variant="metadata" style={styles.stepLabel}>
          {qi + 1}/{QUESTIONS.length}
        </AppText>
      </View>

      <ScrollView contentContainerStyle={styles.quizScrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.quizHeader}>
          <AppText variant="eyebrow">{question.eyebrow}</AppText>
          <AppText style={styles.quizTitle}>{question.title}</AppText>
          <AppText variant="body" style={styles.mutedBody}>
            {question.hint}
          </AppText>
        </View>

        {question.type === 'chips' ? <ChipGrid options={question.options} selected={selected} onToggle={onToggle} /> : null}
        {question.type === 'tiles' ? <TileGrid options={question.options} selected={selected} onToggle={onToggle} /> : null}
        {question.type === 'rows' ? <RowList options={question.options} selected={selected} onToggle={onToggle} /> : null}
        {question.type === 'budget' ? <BudgetList options={question.options} selected={selected} onToggle={onToggle} /> : null}
      </ScrollView>

      <View style={[styles.quizFooter, { paddingBottom: insets.bottom + 20 }]}>
        <Pressable onPress={onNext} style={[styles.ctaButton, enough ? styles.ctaEnabled : styles.ctaDisabled]}>
          <AppText variant="buttonLabel" style={enough ? styles.ctaLabelEnabled : styles.ctaLabelDisabled}>
            {isLast ? 'Build my feed' : 'Continue'}
          </AppText>
          {showCount ? (
            <View style={styles.ctaCount}>
              <AppText variant="matchBadge" style={styles.ctaCountText}>
                {selected.length}
              </AppText>
            </View>
          ) : null}
        </Pressable>
        <Pressable onPress={onSkip} hitSlop={6}>
          <AppText variant="body" style={styles.skipText}>
            Skip
          </AppText>
        </Pressable>
      </View>
    </View>
  );
}

function ChipGrid({ options, selected, onToggle }: { options: QuestionOption[]; selected: string[]; onToggle: (id: string) => void }) {
  return (
    <View style={styles.chipWrap}>
      {options.map((o) => {
        const on = selected.includes(o.id);
        return (
          <Pressable key={o.id} onPress={() => onToggle(o.id)} style={[styles.chip, on ? styles.chipOn : styles.chipOff]}>
            <AppText style={[styles.chipLabel, on && styles.chipLabelOn]}>{o.label}</AppText>
            {on ? <Icon name="checkmark" size={11} color={theme.colors.primaryText} strokeWidth={2.1} /> : null}
          </Pressable>
        );
      })}
    </View>
  );
}

function TileGrid({ options, selected, onToggle }: { options: QuestionOption[]; selected: string[]; onToggle: (id: string) => void }) {
  return (
    <View style={styles.tileGrid}>
      {options.map((o) => {
        const on = selected.includes(o.id);
        return (
          <Pressable key={o.id} onPress={() => onToggle(o.id)} style={styles.tileItem}>
            <View style={[styles.tileImageWrap, on && styles.tileImageWrapOn]}>
              <PlaceholderTile caption={o.slot} radius={16} style={StyleSheet.absoluteFillObject} />
              <View style={[styles.tileDot, on ? styles.tileDotOn : styles.tileDotOff]}>
                {on ? <Icon name="checkmark" size={11} color={theme.colors.primaryText} strokeWidth={2.2} /> : null}
              </View>
            </View>
            <AppText style={styles.tileLabel}>{o.label}</AppText>
            <AppText variant="metadata">{o.sub}</AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

function RowList({ options, selected, onToggle }: { options: QuestionOption[]; selected: string[]; onToggle: (id: string) => void }) {
  return (
    <View style={styles.optionRowList}>
      {options.map((o) => {
        const on = selected.includes(o.id);
        return (
          <Pressable key={o.id} onPress={() => onToggle(o.id)} style={[styles.optionRow, on && styles.optionRowOn]}>
            <View style={[styles.rowIconTile, on && styles.rowIconTileOn]}>
              <AppText style={[styles.rowIconText, on && styles.rowIconTextOn]}>{o.initial}</AppText>
            </View>
            <View style={styles.rowText}>
              <AppText style={styles.rowLabel}>{o.label}</AppText>
              <AppText variant="metadata">{o.sub}</AppText>
            </View>
            <View style={[styles.selectionDot, on ? styles.selectionDotOn : styles.selectionDotOff]}>
              {on ? <Icon name="checkmark" size={11} color={theme.colors.primaryText} strokeWidth={2.2} /> : null}
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

function BudgetList({ options, selected, onToggle }: { options: QuestionOption[]; selected: string[]; onToggle: (id: string) => void }) {
  return (
    <View style={styles.budgetList}>
      {options.map((o) => {
        const on = selected.includes(o.id);
        const bars = o.bars ?? 0;
        return (
          <Pressable key={o.id} onPress={() => onToggle(o.id)} style={[styles.budgetRow, on && styles.budgetRowOn]}>
            <View>
              <AppText style={[styles.budgetLabel, on && styles.budgetLabelOn]}>{o.label}</AppText>
              <AppText style={[styles.budgetSub, on && styles.budgetSubOn]}>{o.sub}</AppText>
            </View>
            <View style={styles.budgetBars}>
              {[1, 2, 3, 4].map((n) => (
                <View
                  key={n}
                  style={[
                    styles.budgetBar,
                    { height: 8 + (n - 1) * 6, opacity: bars >= n ? 1 : 0.25 },
                    on ? styles.budgetBarOn : styles.budgetBarOff,
                  ]}
                />
              ))}
            </View>
          </Pressable>
        );
      })}
      <AppText variant="metadata" style={styles.budgetFooter}>
        You can change this any time — it only shapes what Discover shows first.
      </AppText>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Step 5 — Building

function BuildingStep({ insets, line }: { insets: Insets; line: string }) {
  return (
    <View style={[styles.buildingRoot, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={styles.buildGrid}>
        {Array.from({ length: 9 }).map((_, i) => (
          <PulseTile key={i} delay={(i % 3) * 180 + Math.floor(i / 3) * 120} />
        ))}
      </View>
      <View style={styles.buildTextWrap}>
        <AppText style={styles.buildTitle}>Building your feed</AppText>
        {/* This sequence has no real progress to report — Discover
            personalization isn't built yet, so there's nothing to poll.
            It's a fixed, honestly-cosmetic transition, not a fake status
            for a real background job. */}
        <AppText variant="body" style={[styles.buildLine, styles.mutedBody]}>
          {line}
        </AppText>
      </View>
    </View>
  );
}

function PulseTile({ delay }: { delay: number }) {
  const opacity = useSharedValue(0.35);

  useEffect(() => {
    opacity.value = withDelay(
      delay,
      withRepeat(withTiming(1, { duration: 750, easing: Easing.inOut(Easing.ease) }), -1, true),
    );
  }, [delay, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return <Animated.View style={[styles.buildTile, animatedStyle]} />;
}

// ---------------------------------------------------------------------------
// Step 6 — Ready

function ReadyStep({
  insets,
  picks,
  onEdit,
  onContinue,
}: {
  insets: Insets;
  picks: string[];
  onEdit: () => void;
  onContinue: () => void;
}) {
  return (
    <View style={styles.readyRoot}>
      <View style={[styles.readyHeader, { paddingTop: insets.top + 22 }]}>
        <View style={styles.readyCheck}>
          <Icon name="checkmark" size={18} color={theme.colors.primaryText} strokeWidth={2.2} />
        </View>
        <AppText style={styles.readyTitle}>Your feed is ready</AppText>
        <AppText variant="body" style={styles.mutedBody}>
          Create an account to save it — without one it disappears when you close the app.
        </AppText>
      </View>

      <View style={styles.readyPanel}>
        <View style={styles.readyPanelHead}>
          <AppText variant="eyebrow">Your profile</AppText>
          <Pressable onPress={onEdit} hitSlop={6}>
            <AppText variant="metadata" style={styles.readyEdit}>
              Edit
            </AppText>
          </Pressable>
        </View>
        {picks.length > 0 ? (
          <View style={styles.readyChips}>
            {picks.map((label, i) => (
              <View key={`${label}-${i}`} style={styles.readyChip}>
                <AppText variant="filterChip">{label}</AppText>
              </View>
            ))}
          </View>
        ) : null}
        <View style={styles.readyTiles}>
          {['#ececec', '#e9e9e9', '#efefef', '#ebebeb'].map((bg, i) => (
            <PlaceholderTile key={i} backgroundColor={bg} radius={12} style={styles.readyTile} />
          ))}
        </View>
        {/* Example content straight from the design handoff — Discover
            matching isn't built, so there's no real count to show here
            yet. Left in deliberately (fake data was explicitly okay'd
            for this pass) rather than silently dropped, so the screen
            still reads the way the design intends. */}
        <AppText variant="metadata" style={styles.readyMatchLine}>
          212 products and 34 brands matched so far
        </AppText>
      </View>

      <View style={{ flex: 1 }} />

      <View style={[styles.readyFooter, { paddingBottom: insets.bottom + 24 }]}>
        <AppButton title="Save my feed" onPress={onContinue} />
        <Pressable onPress={onContinue} hitSlop={6}>
          <AppText variant="body" style={styles.readyMaybeLater}>
            Maybe later
          </AppText>
        </Pressable>
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Step 7 — Auth

function AuthStep({
  insets,
  mode,
  email,
  setEmail,
  password,
  setPassword,
  showPassword,
  setShowPassword,
  submitting,
  error,
  info,
  onBack,
  onSubmit,
  onToggleMode,
  onSocial,
  onForgotPassword,
}: {
  insets: Insets;
  mode: 'signup' | 'login';
  email: string;
  setEmail: (v: string) => void;
  password: string;
  setPassword: (v: string) => void;
  showPassword: boolean;
  setShowPassword: (fn: (v: boolean) => boolean) => void;
  submitting: boolean;
  error: string | null;
  info: string | null;
  onBack: () => void;
  onSubmit: () => void;
  onToggleMode: () => void;
  onSocial: (provider: 'Apple' | 'Google') => void;
  onForgotPassword: () => void;
}) {
  const isLogin = mode === 'login';

  return (
    <View style={styles.authRoot}>
      <View style={[styles.authNav, { paddingTop: insets.top + 12 }]}>
        <Pressable onPress={onBack} style={styles.roundIconButton} hitSlop={6}>
          <Icon name="back" size={16} color={theme.colors.ink} strokeWidth={1.7} />
        </Pressable>
        <Logo height={18} />
        <View style={styles.roundIconButton} />
      </View>

      <ScrollView contentContainerStyle={styles.authScroll} keyboardShouldPersistTaps="handled">
        <View style={styles.authHeader}>
          <AppText style={styles.authTitle}>{isLogin ? 'Welcome back' : 'Save your feed'}</AppText>
          <AppText variant="body" style={styles.mutedBody}>
            {isLogin
              ? 'Log in and your boards, finds and feed come straight back.'
              : 'One account keeps your finds, boards and this feed in sync.'}
          </AppText>
        </View>

        <View style={styles.authFields}>
          <Pressable onPress={() => onSocial('Apple')} style={styles.socialButtonPrimary}>
            <Icon name="appleLogo" size={17} color={theme.colors.primaryText} />
            <AppText variant="buttonLabel" style={styles.socialLabelPrimary}>
              Continue with Apple
            </AppText>
          </Pressable>
          <Pressable onPress={() => onSocial('Google')} style={styles.socialButtonSecondary}>
            <Icon name="googleLogo" size={17} color={theme.colors.ink} />
            <AppText variant="buttonLabel">Continue with Google</AppText>
          </Pressable>

          <View style={styles.authDivider}>
            <View style={styles.dividerLine} />
            <AppText variant="metadata" style={styles.dividerText}>
              or
            </AppText>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.authFieldPanel}>
            <View style={styles.authFieldRow}>
              <AppText variant="eyebrow">Email</AppText>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="you@email.com"
                placeholderTextColor={theme.colors.textTertiary}
                style={styles.authFieldInput}
                autoCapitalize="none"
                autoComplete="email"
                keyboardType="email-address"
                textContentType="emailAddress"
              />
            </View>
            <View style={[styles.authFieldRow, styles.authFieldRowDivider]}>
              <AppText variant="eyebrow">Password</AppText>
              <View style={styles.passwordInputRow}>
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="••••••••"
                  placeholderTextColor={theme.colors.textTertiary}
                  secureTextEntry={!showPassword}
                  style={[styles.authFieldInput, styles.passwordInput]}
                  autoCapitalize="none"
                  autoComplete={isLogin ? 'password' : 'password-new'}
                  textContentType={isLogin ? 'password' : 'newPassword'}
                />
                <Pressable onPress={() => setShowPassword((v) => !v)} hitSlop={8}>
                  <AppText variant="metadata" style={styles.showToggle}>
                    {showPassword ? 'Hide' : 'Show'}
                  </AppText>
                </Pressable>
              </View>
            </View>
          </View>

          {isLogin ? (
            <Pressable onPress={onForgotPassword} style={styles.forgotRow} hitSlop={6}>
              <AppText variant="metadata" style={styles.forgotText}>
                Forgot password?
              </AppText>
            </Pressable>
          ) : null}

          {error ? (
            <AppText variant="caption" style={styles.authError}>
              {error}
            </AppText>
          ) : null}
          {info ? (
            <AppText variant="metadata" style={styles.authInfo}>
              {info}
            </AppText>
          ) : null}

          <AppButton
            title={isLogin ? 'Log in' : 'Create account'}
            onPress={onSubmit}
            loading={submitting}
            disabled={!email.trim() || !password}
            style={styles.authSubmit}
          />
        </View>
      </ScrollView>

      <View style={[styles.authFooter, { paddingBottom: insets.bottom + 24 }]}>
        {!isLogin ? (
          <AppText variant="metadata" style={styles.termsText}>
            By continuing you agree to our Terms and Privacy Policy.
          </AppText>
        ) : null}
        <Pressable onPress={onToggleMode} hitSlop={6}>
          <AppText variant="body" style={styles.authSwitchText}>
            {isLogin ? 'New to stuff? ' : 'Already have an account? '}
            <AppText style={styles.authSwitchCta}>{isLogin ? 'Create an account' : 'Log in'}</AppText>
          </AppText>
        </Pressable>
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  mutedBody: {
    color: theme.colors.textSecondary,
  },

  // Welcome
  welcomeRoot: {
    flex: 1,
    backgroundColor: theme.colors.ink,
  },
  welcomeHero: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  heroTile: {
    position: 'absolute',
  },
  heroTile1: { top: 78, left: -6, width: 150, height: 150, transform: [{ rotate: '-7deg' }] },
  heroTile2: { top: 150, right: -14, width: 172, height: 214, transform: [{ rotate: '5deg' }] },
  heroTile3: { top: 300, left: 26, width: 158, height: 196, transform: [{ rotate: '3deg' }] },
  heroFade: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 190,
    backgroundColor: theme.colors.ink,
    opacity: 0.9,
  },
  welcomeFooter: {
    paddingHorizontal: 24,
    gap: 22,
  },
  welcomeWordmark: {
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: -0.6,
    color: theme.colors.primaryText,
  },
  welcomeCopy: {
    gap: 10,
  },
  welcomeHeadline: {
    fontSize: 34,
    fontWeight: '700',
    letterSpacing: -1.2,
    lineHeight: 37,
    color: theme.colors.primaryText,
  },
  welcomeSub: {
    fontSize: 15.5,
    lineHeight: 22,
    color: 'rgba(255,255,255,0.6)',
    maxWidth: 300,
  },
  welcomeLoginLink: {
    textAlign: 'center',
    fontSize: 14.5,
    color: 'rgba(255,255,255,0.55)',
  },

  // Quiz shared chrome
  quizRoot: {
    flex: 1,
  },
  quizNav: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 20,
    paddingBottom: 14,
  },
  roundIconButton: {
    width: 36,
    height: 36,
    borderRadius: theme.radii.full,
    backgroundColor: theme.colors.tile,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressTrack: {
    flex: 1,
    height: 4,
    borderRadius: theme.radii.full,
    backgroundColor: '#efefef',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.ink,
    borderRadius: theme.radii.full,
  },
  stepLabel: {
    fontVariant: ['tabular-nums'],
  },
  quizScrollContent: {
    paddingHorizontal: 20,
    paddingTop: 14,
  },
  quizHeader: {
    gap: 7,
    paddingBottom: 22,
  },
  quizTitle: {
    fontSize: 27,
    fontWeight: '700',
    letterSpacing: -0.85,
    lineHeight: 31,
    color: theme.colors.ink,
  },
  quizFooter: {
    paddingHorizontal: 20,
    paddingTop: 12,
    backgroundColor: theme.colors.background,
  },
  ctaButton: {
    height: 54,
    borderRadius: theme.radii.full,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
  },
  ctaEnabled: {
    backgroundColor: theme.colors.ink,
  },
  ctaDisabled: {
    backgroundColor: '#ececec',
  },
  ctaLabelEnabled: {
    color: theme.colors.primaryText,
  },
  ctaLabelDisabled: {
    color: '#b0b0b0',
  },
  ctaCount: {
    minWidth: 22,
    height: 22,
    paddingHorizontal: 7,
    borderRadius: theme.radii.full,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaCountText: {
    color: theme.colors.primaryText,
  },
  skipText: {
    textAlign: 'center',
    paddingTop: 12,
    color: '#a5a5a5',
  },

  // Chips (Q1)
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    paddingBottom: 28,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    paddingVertical: 13,
    paddingHorizontal: 17,
    borderRadius: theme.radii.full,
  },
  chipOff: {
    backgroundColor: theme.colors.background,
    borderWidth: 1.5,
    borderColor: '#ececec',
  },
  chipOn: {
    backgroundColor: theme.colors.ink,
  },
  chipLabel: {
    fontSize: 15.5,
    fontWeight: '500',
    color: theme.colors.ink,
  },
  chipLabelOn: {
    fontWeight: '600',
    color: theme.colors.primaryText,
  },

  // Tiles (Q2)
  tileGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
    paddingBottom: 28,
  },
  tileItem: {
    width: '47%',
    gap: 9,
  },
  tileImageWrap: {
    position: 'relative',
    aspectRatio: 0.86,
    borderRadius: 18,
    overflow: 'hidden',
  },
  tileImageWrapOn: {
    borderWidth: 2.5,
    borderColor: theme.colors.ink,
  },
  tileDot: {
    position: 'absolute',
    top: 9,
    right: 9,
    width: 24,
    height: 24,
    borderRadius: theme.radii.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileDotOn: {
    backgroundColor: theme.colors.ink,
  },
  tileDotOff: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderWidth: 1.6,
    borderColor: '#dcdcdc',
  },
  tileLabel: {
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: -0.3,
    color: theme.colors.ink,
  },

  // Rows (Q3)
  optionRowList: {
    gap: 9,
    paddingBottom: 28,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 15,
    paddingHorizontal: 16,
    borderRadius: theme.radii.panel,
    backgroundColor: theme.colors.surface,
  },
  optionRowOn: {
    backgroundColor: '#f0f0f0',
    borderWidth: 1.6,
    borderColor: theme.colors.ink,
  },
  rowIconTile: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: '#e8e8e8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowIconTileOn: {
    backgroundColor: theme.colors.ink,
  },
  rowIconText: {
    fontFamily: theme.fontFamily.monospace,
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.textSecondary,
  },
  rowIconTextOn: {
    color: theme.colors.primaryText,
  },
  rowText: {
    flex: 1,
    gap: 2,
  },
  rowLabel: {
    fontSize: 15.5,
    fontWeight: '600',
    color: theme.colors.ink,
  },
  selectionDot: {
    width: 24,
    height: 24,
    borderRadius: theme.radii.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectionDotOn: {
    backgroundColor: theme.colors.ink,
  },
  selectionDotOff: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderWidth: 1.6,
    borderColor: '#dcdcdc',
  },

  // Budget (Q4)
  budgetList: {
    gap: 22,
    paddingBottom: 28,
  },
  budgetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingVertical: 17,
    paddingHorizontal: 18,
    borderRadius: theme.radii.panel,
    backgroundColor: theme.colors.surface,
    marginBottom: 10,
  },
  budgetRowOn: {
    backgroundColor: theme.colors.ink,
  },
  budgetLabel: {
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: -0.4,
    color: theme.colors.ink,
  },
  budgetLabelOn: {
    color: theme.colors.primaryText,
  },
  budgetSub: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    opacity: 0.9,
  },
  budgetSubOn: {
    color: 'rgba(255,255,255,0.6)',
  },
  budgetBars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 3,
    height: 26,
  },
  budgetBar: {
    width: 5,
    borderRadius: 2,
  },
  budgetBarOn: {
    backgroundColor: theme.colors.primaryText,
  },
  budgetBarOff: {
    backgroundColor: theme.colors.ink,
  },
  budgetFooter: {
    color: '#a5a5a5',
  },

  // Building
  buildingRoot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 30,
    paddingHorizontal: 34,
  },
  buildGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 9,
    width: '100%',
    maxWidth: 250,
  },
  buildTile: {
    width: '31%',
    aspectRatio: 1,
    borderRadius: 14,
    backgroundColor: theme.colors.tile,
  },
  buildTextWrap: {
    alignItems: 'center',
    gap: 9,
  },
  buildTitle: {
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: -0.7,
    color: theme.colors.ink,
  },
  buildLine: {
    textAlign: 'center',
  },

  // Ready
  readyRoot: {
    flex: 1,
  },
  readyHeader: {
    paddingHorizontal: 20,
    gap: 9,
  },
  readyCheck: {
    width: 44,
    height: 44,
    borderRadius: theme.radii.full,
    backgroundColor: theme.colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  readyTitle: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.9,
    lineHeight: 32,
    color: theme.colors.ink,
  },
  readyPanel: {
    marginTop: 22,
    marginHorizontal: 20,
    borderRadius: 22,
    backgroundColor: theme.colors.surface,
    padding: 16,
    gap: 14,
  },
  readyPanelHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  readyEdit: {
    color: theme.colors.textSecondary,
  },
  readyChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
  },
  readyChip: {
    paddingVertical: 8,
    paddingHorizontal: 13,
    borderRadius: theme.radii.full,
    backgroundColor: theme.colors.background,
  },
  readyTiles: {
    flexDirection: 'row',
    gap: 7,
  },
  readyTile: {
    flex: 1,
    aspectRatio: 1,
  },
  readyMatchLine: {
    color: theme.colors.textSecondary,
  },
  readyFooter: {
    paddingHorizontal: 20,
    gap: 9,
  },
  readyMaybeLater: {
    textAlign: 'center',
    paddingTop: 4,
    color: theme.colors.textSecondary,
  },

  // Auth
  authRoot: {
    flex: 1,
  },
  authNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  authScroll: {
    paddingHorizontal: 20,
    paddingTop: 26,
    paddingBottom: 20,
  },
  authHeader: {
    gap: 8,
    paddingBottom: 22,
  },
  authTitle: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.9,
    lineHeight: 32,
    color: theme.colors.ink,
  },
  authFields: {
    gap: 9,
  },
  socialButtonPrimary: {
    height: 54,
    borderRadius: theme.radii.full,
    backgroundColor: theme.colors.ink,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
  },
  socialLabelPrimary: {
    color: theme.colors.primaryText,
  },
  socialButtonSecondary: {
    height: 54,
    borderRadius: theme.radii.full,
    backgroundColor: theme.colors.tile,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
  },
  authDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: theme.colors.hairline,
  },
  dividerText: {
    color: '#a5a5a5',
  },
  authFieldPanel: {
    borderRadius: theme.radii.panel,
    backgroundColor: theme.colors.surface,
    overflow: 'hidden',
  },
  authFieldRow: {
    paddingVertical: 13,
    paddingHorizontal: 17,
    gap: 3,
  },
  authFieldRowDivider: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.hairline,
  },
  authFieldInput: {
    fontSize: 15.5,
    color: theme.colors.ink,
    padding: 0,
  },
  passwordInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  passwordInput: {
    flex: 1,
    letterSpacing: 2,
  },
  showToggle: {
    color: theme.colors.textSecondary,
  },
  forgotRow: {
    alignItems: 'flex-end',
    paddingTop: 2,
    paddingHorizontal: 4,
  },
  forgotText: {
    color: theme.colors.textSecondary,
  },
  authError: {
    color: theme.colors.danger,
  },
  authInfo: {
    color: theme.colors.textSecondary,
  },
  authSubmit: {
    marginTop: 4,
  },
  authFooter: {
    paddingHorizontal: 20,
    gap: 14,
  },
  termsText: {
    textAlign: 'center',
    color: '#a5a5a5',
  },
  authSwitchText: {
    textAlign: 'center',
    color: theme.colors.textSecondary,
  },
  authSwitchCta: {
    color: theme.colors.ink,
    fontWeight: '600',
  },
});
