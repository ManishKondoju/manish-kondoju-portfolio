import { useEffect, useRef, useState } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import {
  ArrowDownRight,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  ChevronDown,
  Download,
  ExternalLink,
  Github,
  Linkedin,
  Mail,
  MapPin,
  Menu,
  Pause,
  Phone,
  Play,
  X,
} from 'lucide-react'
import { ProjectVisual } from './ProjectVisual'
import { HeroBackdrop } from './HeroBackdrop'
import { CustomCursor } from './CustomCursor'
import { LoadingIntro } from './LoadingIntro'

gsap.registerPlugin(ScrollTrigger, useGSAP)

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
    tone: 'sage',
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
    tone: 'ink',
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
    tone: 'clay',
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
    tone: 'sand',
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
    tone: 'sky',
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
    className: 'capability-medium capability-dark',
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
    className: 'capability-small capability-warm',
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

const proofPoints = [
  { value: 'Zero', label: 'SLA breaches, 1,200+ cases' },
  { value: '45%', label: 'Faster response via automation' },
  { value: '80%', label: 'Questions self-resolved' },
  { value: '3 yrs', label: 'Citi trading systems' },
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

const manifesto = 'I would rather learn a technology by shipping something with it than by reading about it. That is why the reliability work and the building work are the same job.'

function Header() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    // Flip the header treatment when the dark hero clears it, not at an arbitrary
    // offset - otherwise the light monogram sits on the dark hero for ~800px.
    const onScroll = () => {
      const hero = document.querySelector<HTMLElement>('.hero')
      const threshold = hero ? hero.offsetHeight - 90 : 120
      setScrolled(window.scrollY > threshold)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
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
          Let&apos;s talk <ArrowUpRight size={16} aria-hidden="true" />
        </a>
      </nav>
      <button className="menu-button" onClick={() => setOpen(!open)} aria-label="Toggle menu">
        {open ? <X /> : <Menu />}
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
  const [expandedProject, setExpandedProject] = useState<string | null>(projects[0].name)

  useGSAP(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduceMotion) return

    const intro = gsap.timeline({ defaults: { ease: 'power3.out' } })
    intro
      .from('.site-header', { y: -28, opacity: 0, duration: 0.7 })
      .from('.hero-copy > *', { y: 42, opacity: 0, stagger: 0.1, duration: 0.9 }, '-=0.3')
      .from('.hero-system', { clipPath: 'inset(0 0 100% 0)', duration: 1.25 }, '-=0.85')

    gsap.utils.toArray<HTMLElement>('.reveal').forEach((element) => {
      gsap.from(element, {
        y: 55,
        opacity: 0,
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: { trigger: element, start: 'top 86%', once: true },
      })
    })

    gsap.utils.toArray<HTMLElement>('.project-tile-visual svg').forEach((visual) => {
      gsap.fromTo(
        visual,
        { scale: 0.9, opacity: 0.6 },
        {
          scale: 1,
          opacity: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: visual,
            start: 'top bottom',
            end: 'center center',
            scrub: 1,
          },
        },
      )
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

    const media = gsap.matchMedia()
    media.add('(min-width: 1101px)', () => {
      ScrollTrigger.create({
        trigger: '.experience-layout',
        start: 'top 12%',
        end: 'bottom 62%',
        pin: '.experience-heading',
        pinSpacing: false,
      })
    })
  }, { scope: main })

  // Expanding/collapsing a project tile shifts every section below it, which
  // leaves later ScrollTriggers (the pinned experience heading) measuring
  // against stale positions until the next resize. Refresh once the CSS
  // grid-row transition on the panel has finished.
  useEffect(() => {
    const id = window.setTimeout(() => ScrollTrigger.refresh(), 360)
    return () => window.clearTimeout(id)
  }, [expandedProject])

  return (
    <main ref={main} id="top" className="page-shell">
      <LoadingIntro />
      <CustomCursor />
      <a className="skip-link" href="#work">Skip to main content</a>
      <Header />

      <section className="hero" aria-labelledby="hero-title">
        <HeroBackdrop />
        <div className="hero-copy">
          <p className="eyebrow"><span /> Solutions engineer + business systems analyst</p>
          <h1 id="hero-title">
            I keep critical <span className="inline-image" aria-hidden="true" /> systems running, and build what comes next.
          </h1>
          <p className="hero-intro">
            I&apos;m Manish. For three years I&apos;ve owned production reliability and requirements delivery for
            enterprise trading systems on Citi&apos;s Fixed Income and Currencies desk. Outside of that, I build AI
            tools end-to-end - because I&apos;d rather learn a technology by shipping something with it.
          </p>
          <div className="hero-actions">
            <a className="button button-primary" href="#work">Explore my work <ArrowDownRight size={18} aria-hidden="true" /></a>
            <a className="button button-quiet" href="/Manish_Kumar_Kondoju_Resume.pdf" download>
              Résumé <Download size={17} aria-hidden="true" />
            </a>
          </div>
          <div className="hero-meta">
            <span><MapPin size={15} aria-hidden="true" /> Boston, MA</span>
            <span>Open to relocation anywhere in the US</span>
            <span>MS Information Systems, Northeastern</span>
          </div>
          <div className="hero-system" aria-hidden="true">
            <div className="system-label system-label-a">Production reliability</div>
            <div className="system-label system-label-b">Requirements</div>
            <div className="system-label system-label-c">Shipped software</div>
            <span className="system-node node-a" />
            <span className="system-node node-b" />
            <span className="system-node node-c" />
            <span className="system-node node-d" />
            <div className="system-orbit orbit-a" />
            <div className="system-orbit orbit-b" />
            <div className="system-core">MK</div>
            <svg viewBox="0 0 1200 360" preserveAspectRatio="none">
              <path d="M70 270 C 260 40, 420 335, 590 150 S 920 30, 1130 220" />
              <path d="M45 100 C 310 310, 460 30, 690 260 S 1010 320, 1160 70" />
            </svg>
          </div>
        </div>
      </section>

      <section className="proof-bar" aria-label="Track record at a glance">
        <dl>
          {proofPoints.map((point) => (
            <div key={point.label}>
              <dt>{point.value}</dt>
              <dd>{point.label}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="capabilities section-wrap" id="approach">
        <div className="section-heading reveal">
          <p className="eyebrow"><span /> How I create value</p>
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
          <p className="eyebrow light"><span /> My point of view</p>
          <p>Useful intelligence needs more than a model. It needs context, judgment, and operational discipline.</p>
        </div>
        <p className="manifesto-copy" aria-label={manifesto}>
          {manifesto.split(' ').map((word, index) => (
            <span className="manifesto-word" key={`${word}-${index}`}>{word} </span>
          ))}
        </p>
      </section>

      <section className="work section-wrap" id="work">
        <div className="work-heading reveal">
          <div>
            <p className="eyebrow light"><span /> Selected work</p>
            <h2>Things I built.</h2>
          </div>
          <p>Five projects taken from an idea to working software - with the numbers that show they actually work.</p>
        </div>
        <div className="project-grid">
          {projects.map((project, index) => {
            const isOpen = expandedProject === project.name
            const panelId = `project-panel-${index}`
            return (
              <article
                className={`project-tile project-${project.tone}${isOpen ? ' project-tile-open' : ''} reveal`}
                key={project.name}
              >
                <div className="project-tile-visual">
                  <ProjectVisual variant={project.visual} />
                </div>
                <div className="project-tile-copy">
                  <button
                    type="button"
                    className="project-tile-toggle"
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => setExpandedProject(isOpen ? null : project.name)}
                  >
                    <span className="project-tile-head">
                      <span className="project-tile-kicker">{project.kicker}</span>
                      <span className="project-index">{String(index + 1).padStart(2, '0')}</span>
                    </span>
                    <span className="project-tile-title-row">
                      <h3>{project.name}</h3>
                      <ChevronDown className="project-tile-chevron" size={20} aria-hidden="true" />
                    </span>
                  </button>
                  <div className="project-tile-panel" id={panelId}>
                    <div className="project-tile-panel-inner">
                      <span className="project-tile-desc">{project.description}</span>
                      <dl className="project-metrics">
                        {project.metrics.map((metric) => (
                          <div key={metric.label}>
                            <dt>{metric.value}</dt>
                            <dd>{metric.label}</dd>
                          </div>
                        ))}
                      </dl>
                      <ul>
                        {project.stack.map((tool) => <li key={tool}>{tool}</li>)}
                      </ul>
                      <div className="project-footer">
                        <strong>{project.detail}</strong>
                        <div className="project-links">
                          {project.demo && (
                            <a
                              className="project-link"
                              href={project.demo}
                              target="_blank"
                              rel="noreferrer"
                              tabIndex={isOpen ? 0 : -1}
                            >
                              <ExternalLink size={15} aria-hidden="true" /> Live demo <ArrowUpRight size={14} aria-hidden="true" />
                            </a>
                          )}
                          {project.repo && (
                            <a
                              className="project-link"
                              href={project.repo}
                              target="_blank"
                              rel="noreferrer"
                              tabIndex={isOpen ? 0 : -1}
                            >
                              <Github size={15} aria-hidden="true" /> View source <ArrowUpRight size={14} aria-hidden="true" />
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      </section>

      <section className="experience section-wrap" id="experience">
        <div className="experience-layout">
          <div className="experience-heading reveal">
            <p className="eyebrow"><span /> Experience</p>
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
          <p className="eyebrow"><span /> Tooling</p>
          <h2>What I work with.</h2>
          <p>Certified where it counts, and hands-on with the rest through production work or shipped side projects.</p>
        </div>
        <div className="skill-grid reveal">
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
          <p className="eyebrow light"><span /> Evidence over adjectives</p>
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
    </main>
  )
}

export default App
