# Notas de Desarrollo - Solitario

## Archivos Creados

### HTML y CSS
- ✅ `public/solitaire.html` - Estructura del juego
- ✅ `public/solitaire.css` - Estilos específicos del solitario

### TypeScript
- ✅ `src/solitaire.ts` - Punto de entrada del juego
- ✅ `src/solitaire/SolitaireGame.ts` - Lógica del juego (reglas, puntuación, movimientos)
- ✅ `src/solitaire/SolitaireUI.ts` - Interfaz de usuario (renderizado, drag & drop)
- ✅ `src/solitaire/types.ts` - Definiciones de tipos

### Archivos Modificados
- ✅ `public/index.html` - Agregado botón de Solitario
- ✅ `src/landing.ts` - Integración del solitario en la página de inicio
- ✅ `README.md` - Actualizado con información del solitario

### Documentación
- ✅ `SOLITAIRE_FEATURES.md` - Características detalladas
- ✅ `SOLITAIRE_QUICK_START.md` - Guía rápida de uso

## Estructura del Código

### SolitaireGame.ts
**Responsabilidades:**
- Gestión del estado del juego (stock, waste, foundations, tableau)
- Validación de movimientos
- Sistema de puntuación
- Historial de movimientos (para deshacer)
- Detección de victoria
- Sistema de pistas

**Métodos Principales:**
- `initializeGame()` - Inicializa una nueva partida
- `drawFromStock()` - Roba carta del mazo
- `canMoveToFoundation()` - Valida movimiento a fundación
- `canMoveToTableau()` - Valida movimiento a tableau
- `moveToFoundation()` - Ejecuta movimiento a fundación
- `moveToTableau()` - Ejecuta movimiento a tableau
- `undo()` - Deshace último movimiento
- `getHint()` - Sugiere un movimiento posible

### SolitaireUI.ts
**Responsabilidades:**
- Renderizado del estado del juego
- Gestión de eventos (clicks, drag & drop)
- Actualización de la interfaz (puntuación, tiempo, movimientos)
- Animaciones y efectos visuales
- Pantalla de victoria

**Métodos Principales:**
- `render()` - Renderiza el estado completo del juego
- `renderStock()` - Renderiza el mazo
- `renderWaste()` - Renderiza el descarte
- `renderFoundations()` - Renderiza las fundaciones
- `renderTableau()` - Renderiza las columnas del tableau
- `setupDragEvents()` - Configura eventos de arrastre
- `setupDropZone()` - Configura zonas de soltar
- `showHint()` - Muestra pista visual

## Características Técnicas

### Drag & Drop
Implementado usando la API nativa de HTML5:
- `dragstart` - Inicia el arrastre
- `dragover` - Permite soltar
- `dragleave` - Limpia efectos visuales
- `drop` - Ejecuta el movimiento
- `dragend` - Limpia estado

### Sistema de Puntuación
```typescript
+10 puntos: Carta a fundación
+5 puntos: Voltear carta del tableau
-15 puntos: Carta de fundación a tableau
```

### Historial de Movimientos
Cada movimiento guarda:
- Carta(s) movida(s)
- Ubicación origen
- Ubicación destino
- Si se volteó una carta
- Cambio en puntuación

### Validación de Movimientos

#### Fundaciones
- Primera carta debe ser As
- Cartas subsecuentes deben ser del mismo palo
- Deben seguir orden ascendente (As, 2, 3, ..., K)

#### Tableau
- Espacio vacío solo acepta Rey
- Cartas deben alternar colores (rojo-negro)
- Deben seguir orden descendente (K, Q, J, ..., 2, As)
- Se pueden mover grupos de cartas

## Integración con el Sistema Existente

### Reutilización de Código
- ✅ `Carta` y `Baraja` de `src/common/`
- ✅ `initBackButton()` de `src/backButton.ts`
- ✅ `initRulesPanel()` de `src/rulesPanel.ts`
- ✅ Estilos del panel de reglas de poker/blackjack

### Consistencia Visual
- ✅ Mismo fondo (tapete.jpg)
- ✅ Misma paleta de colores (dorado, negro, verde)
- ✅ Mismas fuentes (Cinzel, Playfair Display)
- ✅ Mismo estilo de botones y controles

## Testing (Pendiente)

### Casos de Prueba Sugeridos
```typescript
// tests/solitaire/SolitaireGame.test.ts
- Inicialización correcta del juego
- Validación de movimientos a fundaciones
- Validación de movimientos a tableau
- Sistema de puntuación
- Funcionalidad de deshacer
- Detección de victoria
- Sistema de pistas

// tests/solitaire/SolitaireUI.test.ts
- Renderizado correcto del estado
- Eventos de drag & drop
- Actualización de contadores
- Pantalla de victoria
```

## Mejoras Futuras

### Funcionalidades
- [ ] Estadísticas persistentes (localStorage)
- [ ] Tabla de mejores puntuaciones
- [ ] Diferentes niveles de dificultad
- [ ] Modo de desafío con tiempo límite
- [ ] Logros y trofeos

### Variantes del Juego
- [ ] Spider Solitaire
- [ ] FreeCell
- [ ] Pyramid
- [ ] TriPeaks

### Mejoras Técnicas
- [ ] Atajos de teclado
- [ ] Efectos de sonido
- [ ] Animaciones más elaboradas
- [ ] Modo oscuro
- [ ] PWA (Progressive Web App)

### Optimizaciones
- [ ] Lazy loading de imágenes
- [ ] Service Worker para cache
- [ ] Optimización de renderizado
- [ ] Reducir reflows del DOM

## Comandos Útiles

```bash
# Compilar TypeScript
npm run build

# Ejecutar tests (cuando se implementen)
npm test

# Limpiar y recompilar
rm -rf dist && npm run build
```

## Notas de Implementación

### Posicionamiento de Cartas en Tableau
Las cartas se posicionan con `position: absolute` y `top` calculado:
```typescript
cardEl.style.top = `${cardIndex * 25}px`;
```
Esto crea el efecto de cascada característico del solitario.

### Gestión de Estado
El estado del juego se mantiene en `SolitaireGame` y se pasa a `SolitaireUI` para renderizado:
```typescript
interface GameState {
    stock: Carta[];
    waste: Carta[];
    foundations: Carta[][];
    tableau: { card: Carta; faceUp: boolean }[][];
    score: number;
    moves: number;
    time: number;
}
```

### Temporizador
Se usa `setInterval` para actualizar el tiempo cada segundo:
```typescript
this.timerInterval = window.setInterval(() => {
    this.ui.updateTime(this.getElapsedTime());
}, 1000);
```

## Créditos
- Diseño visual inspirado en los juegos existentes (Poker y Blackjack)
- Reglas basadas en el Solitario Klondike clásico
- Imágenes de cartas del proyecto original
