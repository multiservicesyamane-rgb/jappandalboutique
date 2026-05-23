// Notifications Manus non disponibles en mode local — stub no-op

export async function notifyOwner(_payload: { title: string; content: string }): Promise<boolean> {
  return false;
}
