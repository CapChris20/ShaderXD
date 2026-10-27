// Full-screen gradient mesh background made from blurred CSS color blobs and grain.
// Flow: render five drifting `<i>` layers plus a grain overlay `<b>`.
// Used by: hero and pricing sections that need a soft animated backdrop without WebGL.

// ===== MAIN FUNCTION =====

/** Gradient mesh: five blurred colour fields drifting over a grain layer. Pure CSS, no shader. */
export function GradientMeshBackground() {
  return (
    <div className="mesh" aria-hidden>
      <i />
      <i />
      <i />
      <i />
      <i />
      <b />
    </div>
  )
}
