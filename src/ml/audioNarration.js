/**
 * Web Speech API text-to-speech engine
 * Supports English and Tamil vocal synthesis.
 */
export function speakPartDetails(part, lang) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
        console.warn('Web Speech API is not supported in this browser.');
        return false;
    }
    // Cancel any ongoing speech
    stopNarration();
    const isTamil = lang === 'ta';
    const textToSpeak = isTamil
        ? `${part.name_ta}. செயல்பாடு: ${part.function_ta}. பழுதுபார்க்கும் சிரமம்: ${part.repairDifficulty === 'easy'
            ? 'எளிதானது'
            : part.repairDifficulty === 'moderate'
                ? 'நடுத்தரமானது'
                : 'கடினமானது'}.`
        : `${part.name}. Function: ${part.function}. Key specifications: ${part.specs}. Repair difficulty is rated as ${part.repairDifficulty}.`;
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = isTamil ? 'ta-IN' : 'en-US';
    utterance.rate = 1.0;
    utterance.pitch = 1.05;
    // Attempt to select an appropriate voice
    const voices = window.speechSynthesis.getVoices();
    const matchedVoice = voices.find((v) => isTamil ? v.lang.startsWith('ta') : v.lang.startsWith('en'));
    if (matchedVoice) {
        utterance.voice = matchedVoice;
    }
    window.speechSynthesis.speak(utterance);
    return true;
}
export function stopNarration() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
    }
}
export function isSpeaking() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        return window.speechSynthesis.speaking;
    }
    return false;
}
