type Variant = 'graph' | 'agents' | 'pipeline' | 'wireframe' | 'health'

const graphNodes = [
  { x: 300, y: 120, r: 30, label: 'Crime', key: true },
  { x: 140, y: 250, r: 20, label: 'Person' },
  { x: 462, y: 240, r: 20, label: 'Org' },
  { x: 300, y: 330, r: 22, label: 'Evidence' },
  { x: 95, y: 430, r: 15, label: 'Weapon' },
  { x: 240, y: 500, r: 15, label: 'Vehicle' },
  { x: 470, y: 430, r: 15, label: 'Location' },
  { x: 380, y: 560, r: 13, label: 'M.O.' },
  { x: 150, y: 610, r: 13, label: 'Officer' },
]

const graphEdges: [number, number][] = [
  [0, 1], [0, 2], [0, 3], [1, 3], [2, 3], [1, 4], [1, 5],
  [2, 6], [3, 6], [3, 7], [5, 8], [4, 8], [7, 6], [5, 7],
]

function GraphVisual() {
  return (
    <svg viewBox="0 0 600 700" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Knowledge graph of crime entities and their relationships">
      <g className="pv-edges">
        {graphEdges.map(([a, b]) => (
          <line key={`${a}-${b}`} x1={graphNodes[a].x} y1={graphNodes[a].y} x2={graphNodes[b].x} y2={graphNodes[b].y} />
        ))}
      </g>
      {graphNodes.map((node) => (
        <g key={node.label} className={node.key ? 'pv-node pv-node-key' : 'pv-node'}>
          <circle cx={node.x} cy={node.y} r={node.r} />
          <text x={node.x} y={node.y + node.r + 18} textAnchor="middle">{node.label}</text>
        </g>
      ))}
      <g className="pv-cypher">
        <rect x="42" y="40" width="240" height="26" rx="4" />
        <text x="54" y="58">MATCH (p:Person)-[:LINKED_TO]-&gt;(c)</text>
      </g>
    </svg>
  )
}

const agents = ['Ingest', 'Profile', 'Table QA', 'Detect', 'Explain', 'Report']

function AgentsVisual() {
  return (
    <svg viewBox="0 0 600 700" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Six coordinated agents passing structured results down a pipeline">
      {agents.map((agent, index) => {
        const y = 70 + index * 98
        const offset = index % 2 === 0 ? 60 : 150
        return (
          <g key={agent} className="pv-agent">
            {index < agents.length - 1 && (
              <path
                className="pv-flow"
                d={`M ${offset + 95} ${y + 52} C ${offset + 95} ${y + 80}, ${(index % 2 === 0 ? 150 : 60) + 95} ${y + 70}, ${(index % 2 === 0 ? 150 : 60) + 95} ${y + 98}`}
              />
            )}
            <rect x={offset} y={y} width="190" height="52" rx="6" />
            <circle className="pv-agent-dot" cx={offset + 24} cy={y + 26} r="6" />
            <text x={offset + 44} y={y + 31}>{agent}</text>
            <text className="pv-agent-index" x={offset + 168} y={y + 31} textAnchor="end">
              0{index + 1}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

function PipelineVisual() {
  const models = [
    { label: 'GPT-4', sub: 'lyrics', y: 250 },
    { label: 'DALL-E 3', sub: 'album art', y: 340 },
    { label: 'MusicGen', sub: 'audio', y: 430 },
  ]
  const bars = Array.from({ length: 42 }, (_, i) => {
    const wave = Math.abs(Math.sin(i * 0.55)) * 0.7 + Math.abs(Math.cos(i * 0.21)) * 0.3
    return Math.max(8, wave * 92)
  })

  return (
    <svg viewBox="0 0 600 700" preserveAspectRatio="xMidYMid meet" role="img" aria-label="One prompt fanning out to three generative models and merging into an audio track">
      <g className="pv-prompt">
        <rect x="120" y="90" width="360" height="58" rx="8" />
        <text x="146" y="125">&quot;a slow synth track about rain&quot;</text>
      </g>

      {models.map((model) => (
        <g key={model.label} className="pv-model">
          <path className="pv-flow" d={`M 300 148 C 300 200, ${model.y === 340 ? 300 : 300} 200, 210 ${model.y + 22}`} />
          <rect x="210" y={model.y} width="180" height="44" rx="6" />
          <text x="228" y={model.y + 28}>{model.label}</text>
          <text className="pv-model-sub" x="372" y={model.y + 28} textAnchor="end">{model.sub}</text>
        </g>
      ))}

      <g className="pv-wave">
        {bars.map((height, index) => (
          <rect
            key={index}
            x={72 + index * 11.4}
            y={600 - height / 2}
            width="5"
            height={height}
            rx="2.5"
          />
        ))}
      </g>
      <text className="pv-caption" x="300" y="672" textAnchor="middle">99.7% pipeline success rate</text>
    </svg>
  )
}

function WireframeVisual() {
  return (
    <svg viewBox="0 0 600 700" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Wireframe screens for plan selection, profile setup, and watchlist">
      <g className="pv-wire">
        <rect x="60" y="70" width="330" height="200" rx="8" />
        <rect className="pv-fill" x="82" y="94" width="120" height="12" rx="6" />
        <rect className="pv-fill pv-dim" x="82" y="120" width="220" height="8" rx="4" />
        <rect className="pv-fill pv-dim" x="82" y="138" width="180" height="8" rx="4" />
        <rect x="82" y="170" width="130" height="72" rx="6" />
        <rect x="226" y="170" width="130" height="72" rx="6" />
        <rect className="pv-accent" x="82" y="170" width="130" height="72" rx="6" />

        <rect x="230" y="300" width="310" height="180" rx="8" />
        <circle cx="272" cy="342" r="18" />
        <rect className="pv-fill" x="302" y="335" width="90" height="10" rx="5" />
        <rect className="pv-fill pv-dim" x="252" y="382" width="266" height="8" rx="4" />
        <rect className="pv-fill pv-dim" x="252" y="400" width="200" height="8" rx="4" />
        <rect className="pv-accent" x="252" y="428" width="104" height="30" rx="15" />

        <rect x="60" y="510" width="250" height="130" rx="8" />
        <rect className="pv-fill pv-dim" x="82" y="534" width="60" height="8" rx="4" />
        <rect x="82" y="556" width="62" height="62" rx="5" />
        <rect x="156" y="556" width="62" height="62" rx="5" />
        <rect x="230" y="556" width="62" height="62" rx="5" />
      </g>
      <g className="pv-annotate">
        <text x="404" y="86">MoSCoW</text>
        <text x="60" y="294">Use cases</text>
        <text x="230" y="672">Garrett&apos;s UX planes</text>
      </g>
    </svg>
  )
}

const sources = ['MedlinePlus', 'CDC', 'WHO', 'NHS']

function HealthVisual() {
  return (
    <svg viewBox="0 0 600 700" preserveAspectRatio="xMidYMid meet" role="img" aria-label="A medical question retrieving cited sources and returning an evidence-based answer">
      <g className="pv-prompt">
        <rect x="130" y="60" width="340" height="70" rx="14" />
        <text x="156" y="102">&quot;What does this lab value mean?&quot;</text>
      </g>

      <path className="pv-flow" d="M300 130 C 300 175, 300 175, 300 215" />

      <g className="pv-agent">
        {sources.map((source, index) => {
          const x = 78 + index * 118
          return (
            <g key={source}>
              <rect x={x} y="230" width="98" height="56" rx="8" />
              <text x={x + 16} y="264" style={{ fontSize: 13 }}>{source}</text>
            </g>
          )
        })}
      </g>

      <path className="pv-flow" d="M300 286 C 300 330, 300 330, 300 372" />

      <g className="pv-cypher">
        <rect x="120" y="388" width="360" height="150" rx="10" />
        <text x="144" y="418">700+ indexed documents</text>
        <text x="144" y="444">ChromaDB - cosine similarity</text>
        <text x="144" y="470">Top-k retrieval, threshold 0.7</text>
        <text x="144" y="496">sentence-transformers embeddings</text>
      </g>

      <path className="pv-flow" d="M300 538 C 300 578, 300 578, 300 612" />

      <g className="pv-model">
        <rect x="130" y="612" width="340" height="66" rx="14" />
        <text x="154" y="640">Evidence-based answer</text>
        <text className="pv-model-sub" x="154" y="662">with clickable source citations</text>
      </g>
    </svg>
  )
}

export function ProjectVisual({ variant }: { variant: Variant }) {
  if (variant === 'graph') return <GraphVisual />
  if (variant === 'agents') return <AgentsVisual />
  if (variant === 'pipeline') return <PipelineVisual />
  if (variant === 'health') return <HealthVisual />
  return <WireframeVisual />
}
