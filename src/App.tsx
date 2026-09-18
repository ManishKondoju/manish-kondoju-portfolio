import { useEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ScrollSmoother } from 'gsap/ScrollSmoother'
import { CustomEase } from 'gsap/CustomEase'
import { SplitText } from 'gsap/SplitText'
import {
  ArrowDownRight,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Download,
  ExternalLink,
  Github,
  Linkedin,
  Mail,
  Pause,
  Phone,
  Play,
} from 'lucide-react'
import { ProjectVisual } from './ProjectVisual'
import { HeroBackdrop } from './HeroBackdrop'
import { CustomCursor } from './CustomCursor'
import { LoadingIntro } from './LoadingIntro'
import { HeroFigure } from './HeroFigure'

gsap.registerPlugin(ScrollTrigger, ScrollSmoother, CustomEase, SplitText, useGSAP)

const projects = [
  {
    name: 'CrimeGraphRAG',
    kicker: 'Knowledge graphs + RAG',
    description:
      'A zero-hallucination crime investigation platform. Every question is compiled into Cypher and run against a Neo4j knowledge graph before the model sees anything, so the LLM can only format what the database actually returned.',
    stack: ['Python 3.11', 'Neo4j', 'LangChain', 'Streamlit', 'D3.js', 'scikit-learn'],
    metrics: [
      { value: '0%', label: 'Hallucination rate across 50 test questions' },
      { value: '1,307', label: 'Nodes, 3,500+ relationships, 9-entity schema' },
      { value: '4-6s', label: 'Average end-to-end Graph RAG response' },
    ],
    detail: 'Built solo over one semester - DAMG 7374, Northeastern',
    repo: 'https://github.com/ManishKondoju/CrimeInvestigationGraph',
    visual: 'graph' as const,
  },
  {
    name: 'AgenticSystem',
    kicker: 'Multi-agent automation',
    description:
      'Six coordinated agents that take a raw dataset through profiling, table question-answering, anomaly detection, and reporting. Agents hand off structured intermediate results rather than raw text, which keeps errors from compounding down the chain.',
    stack: ['CrewAI', 'Python', 'Google TAPAS', 'Isolation Forest', 'Streamlit', 'Plotly'],
    metrics: [
      { value: '6', label: 'Coordinated agents, one per pipeline stage' },
      { value: 'TAPAS', label: 'Table QA paired with classical ML detection' },
      { value: 'Auto', label: 'Statistics and visualizations generated end-to-end' },
    ],
    detail: 'Personal project - agentic orchestration',
    repo: 'https://github.com/ManishKondoju/AgenticSystem',
    visual: 'agents' as const,
  },
  {
    name: 'Prompt2Track',
    kicker: 'Generative AI, full-stack',
    description:
      'One text prompt becomes a finished track: lyrics, album art, and generated music. Three separate generative models are orchestrated behind a single request, with long-running audio jobs handled asynchronously so the interface never blocks.',
    stack: ['React 18', 'FastAPI', 'MusicGen Large', 'DALL-E 3', 'GPT-4', 'Tailwind'],
    metrics: [
      { value: '99.7%', label: 'Success rate across the generation pipeline' },
      { value: '3', label: 'External model APIs in one request flow' },
      { value: 'Async', label: 'Long-running audio jobs, responsive frontend' },
    ],
    detail: 'Personal project - multimodal pipeline',
    repo: 'https://github.com/ManishKondoju/Prompt2Track',
    visual: 'pipeline' as const,
  },
  {
    name: 'Apple TV UX Redesign',
    kicker: 'Product + UX research',
    description:
      'A two-week team sprint attacking navigation, personalization, and subscription friction in the Apple TV app. Research through to interactive prototype, structured on Garrett’s UX planes and prioritized with MoSCoW.',
    stack: ['Figma', 'MoSCoW', 'Card sorting', 'Use case docs', 'Personas', 'IA design'],
    metrics: [
      { value: '3', label: 'Personas, storyboards, and documented core flows' },
      { value: '5', label: 'Person team, two-week research-to-prototype sprint' },
      { value: 'SWOT', label: 'Benchmarked against Netflix, Disney+, Prime Video' },
    ],
    detail: 'Academic team project - research to interactive prototype',
    repo: null,
    visual: 'wireframe' as const,
  },
  {
    name: 'Health Compass',
    kicker: 'RAG + healthcare literacy',
    description:
      'A RAG platform that turns medical questions, lab reports, and symptom logs into evidence-based answers cited straight back to MedlinePlus, CDC, WHO, and NHS - built to make health information legible without replacing a doctor.',
    stack: ['Python', 'ChromaDB', 'Streamlit', 'Sentence-Transformers', 'OpenRouter (Llama 3.2)', 'OCR'],
    metrics: [
      { value: '700+', label: 'Indexed documents across 4 trusted health sources' },
      { value: '6', label: 'Modules: Q&A, doc analyzer, symptom tracker, specialist match' },
      { value: '13', label: 'Specialist categories with urgency-level detection' },
    ],
    detail: 'Academic project, INFO 7390 - Northeastern - live demo + walkthrough',
    repo: 'https://github.com/ManishKondoju/Health_Compass',
    demo: 'https://healthcompass22.streamlit.app/',
    visual: 'health' as const,
  },
]

const capabilities = [
  {
    title: 'Production reliability at scale',
    body: 'Three years owning 15+ enterprise trading applications on Citi’s Fixed Income and Currencies desk, in a 24x7 APAC/EMEA/NAM rotation. Zero SLA breaches across 1,200+ annual cases.',
    className: 'capability-large',
    accent: 'Nothing goes down on my watch',
  },
  {
    title: 'Requirements to shipped software',
    body: 'Translating what the desk actually needs into use cases, acceptance criteria, and configuration that survives a Change Advisory Board.',
    className: 'capability-medium',
    accent: 'Business language to system behavior',
  },
  {
    title: 'Applied AI, built not read',
    body: 'RAG pipelines, knowledge graphs, and multi-agent systems - learned by shipping working software with them.',
    className: 'capability-small capability-sage',
    accent: 'Ship to learn',
  },
  {
    title: 'Automation that pays for itself',
    body: 'Python tooling that cut operational response time 45%, plus a 50-article knowledge base that now resolves ~80% of questions without a human.',
    className: 'capability-small',
    accent: '45% faster, 80% self-served',
  },
  {
    title: 'Governed AI in regulated environments',
    body: 'SR 11-7 model risk management, PII masking ahead of LLM calls, and infosec-approved vendor review - AI that clears bank compliance.',
    className: 'capability-small',
    accent: 'Compliance is a design input',
  },
]

const evidence = [
  {
    metric: 'Zero',
    title: 'SLA breaches, 1,200+ annual cases',
    copy: 'Sustained over 18 months across 15+ enterprise trading applications in a 24x7 global production rotation.',
  },
  {
    metric: '45%',
    title: 'Faster operational response',
    copy: 'Achieved by replacing manual triage and reconciliation steps with Python automation on the Citi FIC desk.',
  },
  {
    metric: '80%',
    title: 'Questions resolved without a human',
    copy: 'From 50+ knowledge base articles I authored, turning repeat escalations into self-service resolution.',
  },
  {
    metric: '0%',
    title: 'Hallucination rate on CrimeGraphRAG',
    copy: 'Verified across 50 test questions by making retrieval structurally mandatory: no graph result, no answer.',
  },
]

const skillGroups = [
  {
    title: 'Languages & scripting',
    items: ['Python', 'SQL', 'JavaScript', 'Java (reading)', 'Shell / Bash', 'PowerShell'],
  },
  {
    title: 'AI & automation',
    items: ['LangChain', 'CrewAI', 'AutoGen', 'RAG pipelines', 'MCP integrations', 'Claude Code', 'OpenAI Codex', 'n8n'],
  },
  {
    title: 'Cloud & DevOps',
    items: ['AWS', 'Azure DevOps', 'GitHub', 'Terraform', 'Docker', 'Kubernetes'],
  },
  {
    title: 'Data & analytics',
    items: ['Oracle SQL', 'Power BI', 'Tableau', 'BigQuery', 'Snowflake', 'Neo4j', 'SharePoint'],
  },
  {
    title: 'ITSM & monitoring',
    items: ['ServiceNow', 'Jira', 'Confluence', 'Splunk', 'ITRS Geneos', 'Grafana', 'Datadog'],
  },
  {
    title: 'Design & product',
    items: ['Figma', 'MoSCoW', 'UX research', 'Wireframing', 'Use case documentation'],
  },
]

const certifications = [
  { name: 'AWS Certified Solutions Architect - Associate', year: '2024' },
  { name: 'Oracle Database SQL Certified Associate', year: '2024' },
  { name: 'ITIL v4 Foundation', year: '2022' },
]

const targetRoles = [
  'Solutions Engineer',
  'Business Analyst',
  'Application Analyst',
  'System Analyst',
  'Product Owner',
  'AI Consultant',
]

// Two counter-rotating rings of the things he actually works with.
// Inner ring turns clockwise, outer anticlockwise, both slowly.
// One elliptical orbit, sized to the panel (roughly 570x249) rather than a
// circle - a circular path needs vertical room the panel does not have, which
// is what pushed terms into each other and off the frame. Six is the most that
// fit without labels touching at this radius.
const orbit = {
  rx: 186,
  ry: 78,
  duration: 64,
  terms: ['Reliability', 'Applied AI', 'Requirements', 'Automation', 'Governance', 'Solution Design'],
}

const manifesto = 'I would rather learn a technology by shipping something with it than by reading about it. That is why the reliability work and the building work are the same job.'

function Header() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    // Flip the header treatment when the dark hero clears it, not at an arbitrary
    // offset - otherwise the light monogram sits on the dark hero for ~800px.
    // Driven by ScrollTrigger rather than a raw scroll listener: it batches with
    // every other trigger on the page and stays correct under ScrollSmoother,
    // which owns the scroll position and does not emit native scroll events 1:1.
    const trigger = ScrollTrigger.create({
      trigger: '.hero',
      start: 'bottom 90px',
      onEnter: () => setScrolled(true),
      onLeaveBack: () => setScrolled(false),
    })
    return () => trigger.kill()
  }, [])

  return (
    <header className={scrolled ? 'site-header is-scrolled' : 'site-header'}>
      <a className="monogram" href="#top" aria-label="Back to top">
        MK
      </a>
      <nav className={open ? 'nav-links nav-open' : 'nav-links'} aria-label="Primary navigation">
        <a href="#work" onClick={() => setOpen(false)}>Work</a>
        <a href="#experience" onClick={() => setOpen(false)}>Experience</a>
        <a href="#skills" onClick={() => setOpen(false)}>Skills</a>
        <a href="#approach" onClick={() => setOpen(false)}>Approach</a>
        <a className="nav-contact" href="#contact" onClick={() => setOpen(false)}>
          Let&apos;s talk
          <span className="btn-icon"><ArrowUpRight size={14} aria-hidden="true" /></span>
        </a>
      </nav>
      {/* Two bars that rotate into an X, rather than swapping one glyph for another. */}
      <button
        className={open ? 'menu-button is-open' : 'menu-button'}
        onClick={() => setOpen(!open)}
        aria-label="Toggle menu"
        aria-expanded={open}
      >
        <span /><span />
      </button>
    </header>
  )
}

function EvidenceCarousel() {
  const [active, setActive] = useState(0)
  const [playing, setPlaying] = useState(true)
  const [hovered, setHovered] = useState(false)

  const go = (direction: number) => {
    setActive((current) => (current + direction + evidence.length) % evidence.length)
  }

  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduceMotion || !playing || hovered) return
    const interval = window.setInterval(() => go(1), 6500)
    return () => window.clearInterval(interval)
  }, [playing, hovered])

  return (
    <div
      className="evidence-carousel"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
    >
      <div className="evidence-counter">
        {String(active + 1).padStart(2, '0')} / {String(evidence.length).padStart(2, '0')}
      </div>
      <div className="evidence-content" key={active}>
        <strong>{evidence[active].metric}</strong>
        <div>
          <h3>{evidence[active].title}</h3>
          <p>{evidence[active].copy}</p>
        </div>
      </div>
      <div className="carousel-controls">
        <button
          onClick={() => setPlaying((value) => !value)}
          aria-label={playing ? 'Pause auto-rotation' : 'Resume auto-rotation'}
        >
          {playing ? <Pause size={16} aria-hidden="true" /> : <Play size={16} aria-hidden="true" />}
        </button>
        <button onClick={() => go(-1)} aria-label="Previous statistic"><ArrowLeft size={18} aria-hidden="true" /></button>
        <button onClick={() => go(1)} aria-label="Next statistic"><ArrowRight size={18} aria-hidden="true" /></button>
      </div>
    </div>
  )
}

function App() {
  const main = useRef<HTMLElement>(null)

  useGSAP(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduceMotion) return

    // One curve for the whole page, matching the CSS --ease token.
    const EASE = CustomEase.create('signature', '0.32, 0.72, 0, 1')

    // Headline arrives line by line from behind a mask, which reads as
    // typesetting rather than a fade. SplitText is reverted on cleanup so the
    // original text nodes go back for assistive tech.
    const headline = document.querySelector<HTMLElement>('#hero-title')
    let split: SplitText | null = null
    if (headline) {
      split = new SplitText(headline, { type: 'lines', linesClass: 'hero-line' })
      split.lines.forEach((line) => {
        const wrap = document.createElement('span')
        wrap.className = 'hero-line-mask'
        line.parentNode?.insertBefore(wrap, line)
        wrap.appendChild(line)
      })
    }

    // Held until the preloader starts clearing. It used to run on mount, which
    // meant the whole hero animation played behind the overlay and the page was
    // already static by the time anyone saw it.
    const intro = gsap.timeline({ defaults: { ease: EASE }, paused: true })
    intro
      .from('.site-header', { y: -24, opacity: 0, duration: 0.8 })
      .from('.eyebrow', { y: 16, opacity: 0, duration: 0.7 }, '-=0.45')
      .from('.hero-line', { yPercent: 108, duration: 1.15, stagger: 0.11 }, '-=0.4')
      .from('.hero-intro, .hero-actions', { y: 26, opacity: 0, stagger: 0.1, duration: 0.9 }, '-=0.75')
      .from('.hero-system', { opacity: 0, scale: 0.96, duration: 1.2 }, '-=1')

    // These are .from() tweens, so the hero is sitting at opacity 0 right now.
    // If the release never arrives the page would stay blank, so every path
    // out of here has to end in play(): the event, or a hard fallback.
    let released = false
    const releaseIntro = () => {
      if (released) return
      released = true
      intro.play()
    }
    window.addEventListener('preloader:done', releaseIntro, { once: true })
    // No preloader runs under reduced motion, so nothing would ever fire.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) releaseIntro()
    const introFallback = window.setTimeout(releaseIntro, 6000)

    // Heavy fade-up: elements arrive with mass rather than popping in.
    gsap.utils.toArray<HTMLElement>('.reveal').forEach((element) => {
      gsap.from(element, {
        y: 48,
        opacity: 0,
        duration: 1,
        ease: EASE,
        scrollTrigger: { trigger: element, start: 'top 86%', once: true },
      })
    })

    // Bento cells arrive as a wave rather than one flat block. grid:'auto'
    // lets GSAP infer rows/columns from the CSS grid for the stagger order.
    const waveIn = (container: string, child: string) => {
      const root = document.querySelector(container)
      if (!root) return
      gsap.from(root.querySelectorAll(child), {
        y: 26,
        opacity: 0,
        scale: 0.985,
        duration: 0.7,
        ease: EASE,
        stagger: { each: 0.06, from: 'start', grid: 'auto' },
        scrollTrigger: { trigger: root, start: 'top 85%', once: true },
      })
    }
    waveIn('.capability-grid', '.capability-card')

    // The tool cards assemble instead of fading up: each one starts pushed out
    // from the middle of the grid and set back on the z-axis, then converges
    // into place as the section arrives. Travel is proportional to how far the
    // card sits from the grid centre, so the outer cards move furthest and the
    // toolset reads as coming together. Replaces the waveIn stagger this grid
    // used to share with the capability cards.
    const skillGrid = document.querySelector<HTMLElement>('.skill-grid')
    if (skillGrid) {
      // Measured once here, into plain numbers, rather than through
      // function-based tween values with invalidateOnRefresh. Those re-read
      // layout from inside ScrollTrigger's own refresh pass, which re-entered
      // the refresh and left the pinned work section without its pin spacing -
      // every section below it then scrolled straight over the card stack.
      // Offsets come from layout geometry (offsetLeft/offsetTop), not
      // getBoundingClientRect, so they are unaffected by the transforms this
      // tween applies. They are ratios of the grid box, so they stay sensible
      // if a resize changes the column count without a re-measure; only the
      // starting displacement drifts slightly, and it animates to 0 regardless.
      const gridMidX = skillGrid.offsetLeft + skillGrid.offsetWidth / 2
      const gridMidY = skillGrid.offsetTop + skillGrid.offsetHeight / 2

      gsap.utils.toArray<HTMLElement>('.skill-group').forEach((card) => {
        const fromCentreX =
          (card.offsetLeft + card.offsetWidth / 2 - gridMidX) / (skillGrid.offsetWidth || 1)
        const fromCentreY =
          (card.offsetTop + card.offsetHeight / 2 - gridMidY) / (skillGrid.offsetHeight || 1)

        gsap.fromTo(
          card,
          {
            x: fromCentreX * 320,
            y: fromCentreY * 110 + 44,
            z: -240,
            rotateY: fromCentreX * -10,
            scale: 0.9,
            opacity: 0,
          },
          {
            x: 0,
            y: 0,
            z: 0,
            rotateY: 0,
            scale: 1,
            opacity: 1,
            ease: 'none',
            scrollTrigger: {
              trigger: skillGrid,
              start: 'top 92%',
              end: 'center 62%',
              scrub: 0.6,
            },
          },
        )
      })
    }

    // Section headings get the same masked-line treatment as the hero, so every
    // major moment on the page opens the same way.
    const splits: SplitText[] = []
    gsap.utils.toArray<HTMLElement>(
      '.section-heading h2, .work-heading h2, .experience-heading h2, .evidence-lead h2, .contact-inner h2',
    ).forEach((h2) => {
      const sp = new SplitText(h2, { type: 'lines', linesClass: 'hero-line' })
      splits.push(sp)
      sp.lines.forEach((line) => {
        const mask = document.createElement('span')
        mask.className = 'hero-line-mask'
        line.parentNode?.insertBefore(mask, line)
        mask.appendChild(line)
      })
      gsap.from(sp.lines, {
        yPercent: 110,
        duration: 1.05,
        stagger: 0.09,
        ease: EASE,
        scrollTrigger: { trigger: h2, start: 'top 88%', once: true },
      })
    })

    // Hero drifts out of frame at two speeds as you leave it - copy rises
    // faster than the panel, which gives the exit some depth.
    gsap.to('.hero-copy', {
      yPercent: -18,
      opacity: 0,
      ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'center center', end: 'bottom top', scrub: 1 },
    })
    gsap.to('.hero-system', {
      yPercent: -8,
      ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'center center', end: 'bottom top', scrub: 1 },
    })

    // Cycle the role in the eyebrow. Held long enough to read, swapped on the
    // same masked-line language the headings use.
    const roleEls = gsap.utils.toArray<HTMLElement>('.eyebrow-role')
    if (roleEls.length > 1) {
      gsap.set(roleEls, { opacity: 0, yPercent: 100 })
      gsap.set(roleEls[0], { opacity: 1, yPercent: 0 })

      const roleCycle = gsap.timeline({ repeat: -1 })
      roleEls.forEach((role, i) => {
        const next = roleEls[(i + 1) % roleEls.length]
        roleCycle
          .to(role, { duration: 2.6 })
          .to(role, { yPercent: -100, opacity: 0, duration: 0.55, ease: EASE })
          .fromTo(
            next,
            { yPercent: 100, opacity: 0 },
            // Without this every fromTo applies its from-state at build time,
            // which blanks all six roles before the timeline ever runs.
            { yPercent: 0, opacity: 1, duration: 0.55, ease: EASE, immediateRender: false },
            '<',
          )
      })

      ScrollTrigger.create({
        trigger: '.hero',
        start: 'top bottom',
        end: 'bottom top',
        onToggle: (self) => (self.isActive ? roleCycle.play() : roleCycle.pause()),
      })
    }

    // Orbiting terms. Positions are computed per frame on an ellipse rather
    // than by rotating a container, because rotating a container would tumble
    // the whole ellipse instead of moving terms along it. Labels therefore need
    // no counter-rotation - they simply never rotate. sin(theta) doubles as a
    // depth cue: terms at the back of the path sit smaller and dimmer.
    const orbitTerms = gsap.utils.toArray<HTMLElement>('.orbit-term')
    if (orbitTerms.length) {
      // Radii are measured from the panel at runtime. They were hardcoded, and
      // when the panel changed shape the path overflowed it and clipped labels.
      let rx = 0
      let ry = 0
      const measure = () => {
        const panel = document.querySelector<HTMLElement>('.hero-system')
        if (!panel) return
        const widest = Math.max(
          ...orbitTerms.map((t) => t.firstElementChild?.getBoundingClientRect().width ?? 0),
        )
        rx = Math.max(70, panel.clientWidth / 2 - widest / 2 - 10)
        ry = Math.max(46, panel.clientHeight / 2 - 24)
      }
      measure()

      const place = (progress: number) => {
        orbitTerms.forEach((el, i) => {
          const theta = (i / orbitTerms.length + progress) * Math.PI * 2
          const depth = (Math.sin(theta) + 1) / 2
          gsap.set(el, {
            x: rx * Math.cos(theta),
            y: ry * Math.sin(theta),
            scale: 0.86 + depth * 0.14,
            opacity: 0.45 + depth * 0.55,
            zIndex: Math.round(depth * 10),
          })
        })
      }
      place(0)

      const cycle = { t: 0 }
      const spin = gsap.to(cycle, {
        t: 1,
        duration: orbit.duration,
        repeat: -1,
        ease: 'none',
        onUpdate: () => place(cycle.t),
      })

      const onResize = () => {
        measure()
        place(cycle.t)
      }
      window.addEventListener('resize', onResize)

      // Infinite loops are a battery cost when nobody is looking at them.
      ScrollTrigger.create({
        trigger: '.hero',
        start: 'top bottom',
        end: 'bottom top',
        onToggle: (self) => (self.isActive ? spin.play() : spin.pause()),
      })
    }

    // Sticky card stack: the section holds still and each project slides up
    // over the one before it, which shrinks and tilts back into a fanned pile -
    // so the card you are reading is always the only one at full size.
    const media = gsap.matchMedia()

    // This query must stay identical to the one in CSS that makes the deck a
    // clipped box and the cards absolute. If the two ever disagree, the cards
    // sit stacked on top of each other with no animation to separate them.
    media.add('(min-width: 821px) and (prefers-reduced-motion: no-preference)', () => {
      const cards = gsap.utils.toArray<HTMLElement>('.project-card')
      const bar = document.querySelector<HTMLElement>('.stack-progress span')
      if (cards.length < 2) return

      // Card one is in frame; the rest wait a full deck-height below, clipped
      // by the deck's overflow until their turn.
      gsap.set(cards[0], { yPercent: 0, scale: 1, rotate: 0 })
      gsap.set(cards.slice(1), { yPercent: 100, scale: 1, rotate: 0 })

      const stack = gsap.timeline({
        defaults: { duration: 1, ease: 'none' },
        scrollTrigger: {
          trigger: '.stack-wrap',
          start: 'top top',
          end: 'bottom bottom',
          // Only the one-viewport stage is pinned, and it adds no spacing of
          // its own: the scroll length is the wrapper's CSS height (one
          // viewport per card), which is why end is simply 'bottom bottom'.
          // Reserving that height in CSS rather than through GSAP's pin-spacer
          // is deliberate - StrictMode's double mount can leave an orphaned
          // spacer behind, and when the layout depends on that spacer the
          // sections below collapse 3,500px up over the card deck. With the
          // height in CSS, a stale spacer costs nothing.
          pin: '.stack-stage',
          pinSpacing: false,
          scrub: 0.5,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            if (bar) gsap.set(bar, { scaleX: self.progress })
          },
        },
      })

      cards.forEach((card, index) => {
        const next = cards[index + 1]
        if (!next) return

        // The tilt alternates so the pile fans out. Rotating every card the
        // same way would park each one exactly behind the last and the depth
        // would be invisible.
        stack.to(card, { scale: 0.72, rotate: index % 2 ? -4.5 : 4.5 }, index)
        stack.to(next, { yPercent: 0 }, index)
      })

      // kill(true) - the revert flag is what takes the pinned element back out
      // of its spacer. Without it a stale spacer is left in the DOM on every
      // remount.
      return () => {
        stack.scrollTrigger?.kill(true)
        stack.kill()
      }
    })

    gsap.fromTo(
      '.manifesto-word',
      { opacity: 0.12 },
      {
        opacity: 1,
        stagger: 0.08,
        ease: 'none',
        scrollTrigger: {
          trigger: '.manifesto-copy',
          start: 'top 78%',
          end: 'bottom 48%',
          scrub: 1,
        },
      },
    )

    // Cabinet Grotesk loads async; without this every trigger position is measured
    // against fallback-font metrics and fires at the wrong scroll offset.
    document.fonts?.ready.then(() => ScrollTrigger.refresh())

    media.add('(min-width: 1101px)', () => {
      ScrollTrigger.create({
        trigger: '.experience-layout',
        start: 'top 12%',
        end: 'bottom 62%',
        pin: '.experience-heading',
        pinSpacing: false,
      })
    })

    // Inertia-smoothed scrolling. Skipped on touch/coarse pointers - phones and
    // tablets already have great native momentum scrolling, and driving this
    // transform-based wrapper on top of that fights the OS instead of helping.
    if (window.matchMedia('(pointer: fine)').matches) {
      // The global CSS scroll-behavior:smooth is redundant once ScrollSmoother
      // owns the scroll - left on, the two fight (native smooth-scroll nudges
      // scrollY, ScrollSmoother's own ticker reads that mid-flight and snaps
      // back), which is exactly the stutter this is meant to remove.
      document.documentElement.style.scrollBehavior = 'auto'
      ScrollSmoother.create({
        wrapper: '#smooth-wrapper',
        content: '#smooth-content',
        smooth: 1.1,
        effects: true,
      })
    }

    return () => {
      split?.revert()
      splits.forEach((sp) => sp.revert())
    }
    return () => {
      window.removeEventListener('preloader:done', releaseIntro)
      window.clearTimeout(introFallback)
    }
  }, { scope: main })

  // Internal "#anchor" links (nav, hero CTA, footer) need to route through the
  // smoother when it's active, or the native instant jump fights ScrollSmoother's
  // next animation frame and the page visibly stutters into place instead of
  // gliding. scroll-margin-top (in CSS) isn't read by ScrollSmoother's own
  // scrollTo, so the fixed-header clearance is reproduced here via the offset.
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const link = (event.target as HTMLElement)?.closest?.('a[href^="#"]')
      if (!link) return
      const smoother = ScrollSmoother.get()
      if (!smoother) return
      const hash = link.getAttribute('href') ?? ''
      if (hash === '#top') {
        event.preventDefault()
        smoother.scrollTo(0, true)
        return
      }
      const target = hash.length > 1 ? document.querySelector(hash) : null
      if (!target) return
      event.preventDefault()
      smoother.scrollTo(target, true, 'top top+=96')
    }
    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [])

  return (
    <main ref={main} id="top" className="page-shell">
      <LoadingIntro />
      <CustomCursor />
      <a className="skip-link" href="#work">Skip to main content</a>
      <Header />

      {/* ScrollSmoother needs a wrapper/content pair to transform - kept out of
          the fixed-position elements above (header, cursor, loading intro),
          which would otherwise inherit the transform and stop behaving as fixed. */}
      <div id="smooth-wrapper">
        <div id="smooth-content">

      <section className="hero" aria-labelledby="hero-title">
        <HeroBackdrop />
        <div className="hero-inner">
          <div className="hero-copy">
            {/* All six target roles cycle through one slot. Every role is in the
                DOM, so screen readers and crawlers get the full list; CSS shows
                only the first until GSAP takes over, which keeps it sane with
                JS off or reduced motion on. */}
            <p className="eyebrow">
              <span />
              <span className="eyebrow-roles">
                {targetRoles.map((role) => (
                  <span className="eyebrow-role" key={role}>{role}</span>
                ))}
              </span>
            </p>
            <h1 id="hero-title">
              I keep critical <span className="inline-image" aria-hidden="true" /> systems running, and build what comes next.
            </h1>
            <p className="hero-intro">
              Three years owning production reliability for Citi&apos;s trading systems. Now building AI tools end to end.
            </p>
            <div className="hero-actions">
              <a className="button button-primary" href="#work">
                Explore my work
                <span className="btn-icon"><ArrowDownRight size={15} aria-hidden="true" /></span>
              </a>
              <a className="button button-quiet" href="/Manish_Kumar_Kondoju_Resume.pdf" download>
                Résumé
                <span className="btn-icon"><Download size={14} aria-hidden="true" /></span>
              </a>
            </div>
          </div>
          {/* Figure and orbit share one centre, so they read as a single focal
              element rather than two competing ones. Depth already drives each
              term's z-index, so terms at the back of the path pass behind him. */}
          <div className="hero-stage" aria-hidden="true">
          <HeroFigure />
          <div className="hero-system">
            <div className="system-orbit orbit-a" />
            <div className="system-orbit orbit-b" />

            <div className="orbit-ring">
              {orbit.terms.map((term) => (
                <span className="orbit-term" key={term}>
                  <span className="orbit-label">{term}</span>
                </span>
              ))}
            </div>

            <div className="system-core">MK</div>
          </div>
          </div>
        </div>
      </section>

      <section className="capabilities section-wrap" id="approach">
        <div className="section-heading reveal">
          <h2>Reliability on one side, shipped software on the other.</h2>
          <p>
            Most people pick one. I&apos;ve spent three years doing both: keeping mission-critical trading systems up
            in a 24x7 global rotation, and building AI tools on my own time to understand them properly.
          </p>
        </div>
        <div className="capability-grid reveal">
          {capabilities.map((item) => (
            <article className={`capability-card ${item.className}`} key={item.title}>
              <p>{item.accent}</p>
              <h3>{item.title}</h3>
              <span>{item.body}</span>
              <ArrowUpRight size={22} aria-hidden="true" />
            </article>
          ))}
        </div>
      </section>

      <section className="manifesto section-wrap">
        <div className="manifesto-aside reveal">
          <p>Useful intelligence needs more than a model. It needs context, judgment, and operational discipline.</p>
        </div>
        <p className="manifesto-copy" aria-label={manifesto}>
          {manifesto.split(' ').map((word, index) => (
            <span className="manifesto-word" key={`${word}-${index}`}>{word} </span>
          ))}
        </p>
      </section>

      {/* Sticky card stack. The section pins and each project slides up over
          the one before it, so every card gets a full-attention moment at full
          size and its numbers sit on the card face rather than behind a click.
          Below 821px, and under reduced motion, this degrades to a plain
          vertical list - pinning four extra viewport heights is the wrong
          trade on a phone. */}
      <section className="work" id="work">
        <div className="work-heading section-wrap reveal">
          <div>
            <p className="eyebrow"><span /> Selected work</p>
            <h2>Things I built.</h2>
          </div>
          <p>Five projects taken from an idea to working software - with the numbers that show they actually work.</p>
        </div>

        {/* One viewport of scroll per card - read by the CSS that gives the
            wrapper its height, so adding a project extends the section
            automatically. */}
        <div className="stack-wrap" style={{ '--stack-count': projects.length } as CSSProperties}>
          <div className="stack-stage">
            <div className="stack-deck">
              {projects.map((project, index) => (
                <article className="project-card" key={project.name}>
                  <div className="project-card-core">
                    <div className="project-card-visual">
                      <ProjectVisual variant={project.visual} />
                    </div>

                    <span className="project-card-index">
                      {String(index + 1).padStart(2, '0')} / {String(projects.length).padStart(2, '0')}
                    </span>

                    <div className="project-card-body">
                      <p className="project-card-kicker">{project.kicker}</p>
                      <h3>{project.name}</h3>
                      <p className="project-card-desc">{project.description}</p>

                      <dl className="project-metrics">
                        {project.metrics.map((metric) => (
                          <div key={metric.label}>
                            <dt>{metric.value}</dt>
                            <dd>{metric.label}</dd>
                          </div>
                        ))}
                      </dl>

                      <ul className="project-card-stack">
                        {project.stack.map((tool) => <li key={tool}>{tool}</li>)}
                      </ul>

                      <div className="project-card-foot">
                        <strong>{project.detail}</strong>
                        <div className="project-links">
                          {project.demo && (
                            <a className="project-link" href={project.demo} target="_blank" rel="noreferrer">
                              <ExternalLink size={14} aria-hidden="true" /> Live demo
                            </a>
                          )}
                          {project.repo && (
                            <a className="project-link" href={project.repo} target="_blank" rel="noreferrer">
                              <Github size={14} aria-hidden="true" /> Source
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <div className="stack-progress" aria-hidden="true"><span /></div>
          </div>
        </div>
      </section>

      <section className="experience section-wrap" id="experience">
        <div className="experience-layout">
          <div className="experience-heading reveal">
            <h2>Three years inside a bank&apos;s trading floor.</h2>
            <p>
              That range shapes how I evaluate AI: ambitious about its potential, precise about what makes it
              survivable in production.
            </p>
          </div>
          <div className="timeline">
            <article className="timeline-item reveal">
              <div className="timeline-date">Jun 2022 - Aug 2024</div>
              <div>
                <h3>Solutions Engineer / Business Systems Analyst</h3>
                <p className="timeline-place">Virtusa, embedded at Citi Bank - Fixed Income &amp; Currencies</p>
                <p>
                  Owned reliability and configuration for 15+ enterprise trading applications in a 24x7 global
                  (APAC/EMEA/NAM) environment. Zero SLA breaches across 1,200+ annual cases over 18 months. Authored
                  50+ knowledge base articles driving ~80% self-service resolution, and cut operational response time
                  45% with Python automation. Built NLP-based trade break reconciliation tooling and research
                  summarization pipelines over Bloomberg and Reuters feeds, all within formal banking AI governance -
                  SR 11-7 model risk management, PII masking before LLM calls, and Change Advisory Board review for
                  prompt and model changes.
                </p>
              </div>
            </article>
            <article className="timeline-item reveal">
              <div className="timeline-date">Jan 2022 - May 2022</div>
              <div>
                <h3>Engineering Intern</h3>
                <p className="timeline-place">Virtusa</p>
                <p>
                  Onboarded onto the Citi FIC application estate, supporting production triage and documentation ahead
                  of converting to a full-time analyst role.
                </p>
              </div>
            </article>
            <article className="timeline-item reveal timeline-education">
              <div className="timeline-date">2024 - 2026</div>
              <div>
                <h3>MS, Information Systems</h3>
                <p className="timeline-place">Northeastern University, College of Engineering - GPA 3.62</p>
                <p>Graduate work across knowledge graphs with generative AI, intelligent systems, data analytics, and product design.</p>
              </div>
            </article>
            <article className="timeline-item reveal timeline-education">
              <div className="timeline-date">2018 - 2022</div>
              <div>
                <h3>BE, Electronics and Communication</h3>
                <p className="timeline-place">Geethanjali College of Engineering and Technology</p>
                <p>Foundation in systems, signals, and embedded computing.</p>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section className="skills section-wrap" id="skills">
        <div className="section-heading reveal">
          <h2>What I work with.</h2>
          <p>Certified where it counts, and hands-on with the rest through production work or shipped side projects.</p>
        </div>
        <div className="skill-grid">
          {skillGroups.map((group) => (
            <div className="skill-group" key={group.title}>
              <h3>{group.title}</h3>
              <ul>
                {group.items.map((item) => <li key={item}>{item}</li>)}
              </ul>
            </div>
          ))}
        </div>
        <div className="cert-row reveal">
          <h3>Certifications</h3>
          <ul>
            {certifications.map((cert) => (
              <li key={cert.name}>
                <span>{cert.name}</span>
                <em>{cert.year}</em>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="evidence section-wrap">
        <div className="evidence-lead reveal">
          <h2>Outcomes that make the work matter.</h2>
        </div>
        <EvidenceCarousel />
      </section>

      <section className="contact section-wrap" id="contact">
        <div className="contact-inner reveal">
          <p className="eyebrow"><span /> Start a conversation</p>
          <h2>Have a complex system worth making reliable?</h2>
          <a className="contact-email" href="mailto:kondoju.m@northeastern.edu">
            kondoju.m@northeastern.edu <ArrowUpRight aria-hidden="true" />
          </a>
          <div className="contact-roles">
            <p>Open to</p>
            <ul>
              {targetRoles.map((role) => <li key={role}>{role}</li>)}
            </ul>
          </div>
          <div className="contact-bottom">
            <p>Based in Boston, MA and open to relocation anywhere in the US.</p>
            <div className="social-links">
              <a href="https://www.linkedin.com/in/manishkumarkondoju" target="_blank" rel="noreferrer"><Linkedin size={18} aria-hidden="true" /> LinkedIn</a>
              <a href="https://github.com/ManishKondoju" target="_blank" rel="noreferrer"><Github size={18} aria-hidden="true" /> GitHub</a>
              <a href="tel:+16172384147"><Phone size={18} aria-hidden="true" /> (617) 238-4147</a>
              <a href="mailto:kondoju.m@northeastern.edu"><Mail size={18} aria-hidden="true" /> Email</a>
            </div>
          </div>
        </div>
      </section>

      <footer>
        <p>Manish Kumar Kondoju</p>
        <p>Designed with intention. Built for clarity.</p>
        <a href="#top">Back to top <ArrowUpRight size={15} aria-hidden="true" /></a>
      </footer>

        </div>
      </div>
    </main>
  )
}

export default App
