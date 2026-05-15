// Runs once on Node.js server startup (not Edge runtime).
// Configures the MeiliSearch index settings so searches work correctly
// even before the first article is published.
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { configureIndex } = await import('./lib/search')
    try {
      await configureIndex()
      console.log('[search] MeiliSearch index configured')
    } catch (err) {
      // MeiliSearch being down must never crash the app
      console.warn('[search] Could not configure MeiliSearch index:', (err as Error).message)
    }
  }
}
