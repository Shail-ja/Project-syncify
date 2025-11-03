export async function logAction(action: string, payload: Record<string, unknown> = {}) {
  // Replace with persistence (DB, log service)
  console.log(`[action] ${action}`, payload);
}


