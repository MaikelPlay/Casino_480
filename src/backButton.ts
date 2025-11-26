/**
 * Handles the back button translation based on the current language
 */
export function initBackButton(): void {
    const backButton = document.querySelector('.back-button') as HTMLAnchorElement;
    if (!backButton) return;

    // Get language from URL or localStorage
    const urlParams = new URLSearchParams(window.location.search);
    const lang = urlParams.get('lang') || window.localStorage.getItem('lang') || 'es';

    const translations: { [key: string]: string } = {
        es: '← Inicio',
        en: '← Home',
        pt: '← Início',
        it: '← Home',
        fr: '← Accueil',
        de: '← Start',
        nl: '← Home'
    };

    backButton.textContent = translations[lang] || translations['es'];
}
