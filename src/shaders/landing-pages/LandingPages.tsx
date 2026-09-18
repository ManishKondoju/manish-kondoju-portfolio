/* ThreeUI landing pages - Kage.
 *
 * The registered LandingPages.tsx is a barrel exporting ~23 packaged pages, and
 * it imports the document builders and ?raw sources for all of them (Sylva,
 * Tidecrest, Meridian, ASCII field, Betawise, Nocturne, Axonis). Those modules
 * are not part of this component's registered file set and do not exist here,
 * so a byte-for-byte copy of the barrel could not compile.
 *
 * What is reproduced below is verbatim: the KageLandingPage function and the
 * import lines its own path needs, lifted unmodified from the registered
 * source (SHA-256 4d379461ad00eb4de7900df312878035383de7e1ed4e13283b8143a2eea9d30a).
 * Its dependencies - LandingPageFrame.tsx, pageTypography.ts, pageRecipes.ts,
 * threeui.css, public/landing-pages/kage.html and the 14 webp assets - are all
 * installed byte-exact and hash-verified against that revision.
 */

import {
  splitTypographyProps,
  usePageTypography,
  type PageTypographyProps,
} from "./pageTypography";
import { LandingPageFrame, type LandingPageProps } from "./LandingPageFrame";
export { LandingPageFrame, applyBackgroundPresentation } from "./LandingPageFrame";
export type { LandingPageFrameProps, LandingPageProps } from "./LandingPageFrame";
import { KAGE_TYPOGRAPHY } from "./pageRecipes";

export function KageLandingPage(props: LandingPageProps & PageTypographyProps) {
  const [type, frame] = splitTypographyProps(props);
  const customization = usePageTypography(KAGE_TYPOGRAPHY, type);
  return <LandingPageFrame {...frame} customization={customization} title="Kage — Where stillness reveals the unseen" sourceUrl="/landing-pages/kage.html" />;
}
