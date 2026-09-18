import { KageLandingPage } from './shaders/landing-pages/LandingPages'
import './shaders/threeui.css'

/* The configured ThreeUI usage, unchanged. Every prop value here is also the
   KAGE_TYPOGRAPHY default, so this renders the packaged document exactly as
   authored; they are passed explicitly so the controls stay visible and
   editable at the call site.

   .shader-frame is the host's sizing box, not part of the ThreeUI package -
   the frame itself is width/height 100%, so whatever mounts it has to give it
   a real height. See styles.css. */
export function Scene() {
  return (
    <div className="shader-frame">
      <KageLandingPage
        headingFont="onest"
        bodyFont="onest"
        headingWeight="400"
        bodyWeight="300"
        primaryColor="#e0231c"
        headingSize={46}
        bodySize={17}
        headingLetterSpacing={-0.012}
      />
    </div>
  )
}
