import { MotionConfig } from 'framer-motion'
import { StylePlayground } from '../pages/dev/StylePlayground'

// reducedMotion="user": Framer skips transform/layout animation when the OS asks for reduced motion.
// R1 renders the dev style playground; R2 swaps in routing + Home.
export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <StylePlayground />
    </MotionConfig>
  )
}
