import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { Scene } from './ImmersiveScene'
import './styles.css'

/* The Kage experience is a complete authored document with its own navigation
   and scroll scenes, so it cannot share a page with the portfolio - it is
   mounted on its own at #immersive while its final placement is decided.
   Everything else still gets the portfolio. */
const immersive = window.location.hash === '#immersive'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {immersive ? <Scene /> : <App />}
  </StrictMode>,
)

// The gate is read once at boot, so a hash change has to reload to switch modes.
window.addEventListener('hashchange', () => {
  if ((window.location.hash === '#immersive') !== immersive) window.location.reload()
})
