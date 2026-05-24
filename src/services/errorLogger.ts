export function logMemoryError(fn: string, error: unknown, context?: Record<string, any>): void {
    if (import.meta.env.DEV) {
        console.warn(`[FeelEd Memory Error] ${fn}:`, error, context);
    }
    // Future: send to analytics/monitoring
}
