/**
 * Módulo para gestionar el panel de reglas
 */
export function initRulesPanel() {
    const rulesToggle = document.getElementById('rules-toggle');
    const rulesPanel = document.getElementById('rules-panel');
    const closeRules = document.getElementById('close-rules');
    if (rulesToggle && rulesPanel && closeRules) {
        rulesToggle.addEventListener('click', () => {
            rulesPanel.classList.add('open');
        });
        closeRules.addEventListener('click', () => {
            rulesPanel.classList.remove('open');
        });
        // Cerrar al hacer click fuera del panel
        document.addEventListener('click', (e) => {
            const target = e.target;
            if (rulesPanel.classList.contains('open') &&
                !rulesPanel.contains(target) &&
                target !== rulesToggle) {
                rulesPanel.classList.remove('open');
            }
        });
    }
}
//# sourceMappingURL=rulesPanel.js.map