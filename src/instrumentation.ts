export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    (await import('./instrumentation.node')).register()
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    (await import('./instrumentation.edge')).register()
  }
}