/**
 * Joue un son de notification simple en utilisant l'API Web Audio
 * Son court et agréable pour confirmer l'ajout au panier
 */
export function playNotificationSound() {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // Créer un oscillateur pour générer le son
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    // Connecter oscillateur → gain → destination (haut-parleurs)
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Configuration du son : fréquence agréable (note musicale)
    oscillator.type = 'sine'; // Son doux
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime); // Note haute (Mi)
    
    // Volume: commence à 0.3, descend à 0 (fade out)
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
    
    // Jouer le son pendant 200ms
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.2);
    
    // Nettoyer après
    setTimeout(() => {
      audioContext.close();
    }, 300);
  } catch (error) {
    // Silencieux en cas d'erreur (navigateur ne supporte pas Web Audio)
    console.warn('Notification sound failed:', error);
  }
}
