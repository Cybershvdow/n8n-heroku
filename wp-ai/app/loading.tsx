export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block w-12 h-12 border-4 border-neon-lime border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-text-secondary">Loading...</p>
      </div>
    </div>
  )
}
