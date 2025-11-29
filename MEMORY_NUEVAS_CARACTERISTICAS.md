# Nuevas Características del Juego Memory ⭐

## 1. Tabla de Mejores Tiempos por Dificultad

### Descripción
Sistema completo de registro y visualización de los mejores tiempos conseguidos en cada nivel de dificultad, guardados permanentemente en localStorage.

### Características:
- **Almacenamiento Persistente**: Los mejores tiempos se guardan en localStorage del navegador
  - Persisten entre sesiones
  - Organizados por nivel de dificultad (Fácil, Medio, Difícil)
  
- **Registro Automático**: 
  - Al completar una partida, se compara automáticamente con el mejor tiempo existente
  - Solo se guarda si es un tiempo mejor (menor)
  - No se registran tiempos en modo práctica
  
- **Información Guardada**:
  - Tiempo total (en segundos)
  - Número de movimientos
  - Fecha del récord
  
- **Modal de Visualización**:
  - Botón "🏆 Ver Mejores Tiempos" en el selector de dificultad
  - Tabla organizada con:
    - Dificultad (con estrellas ⭐)
    - Mejor tiempo (formato MM:SS)
    - Movimientos realizados
    - Fecha del récord
  - Diseño elegante con animación de entrada
  - Botón de cierre con efecto de rotación

### Implementación Técnica:
- Método `saveBestTime()` en `MemoryGame`
- Método `getBestTime()` para recuperar récords
- Método `showBestTimes()` en `MemoryUI` para mostrar el modal
- Keys en localStorage: `memory_best_time_1`, `memory_best_time_2`, `memory_best_time_3`
- Interfaz `BestTime` en types.ts

---

## 2. Modo de Práctica

### Descripción
Opción para ver todas las cartas durante 2 segundos al inicio del juego, permitiendo memorizar las posiciones antes de comenzar.

### Características:
- **Checkbox en Selector de Dificultad**:
  - Opción "Modo Práctica (ver cartas 2 segundos)"
  - Se puede activar/desactivar antes de iniciar cada partida
  - Diseño visual destacado con borde dorado
  
- **Funcionamiento**:
  - Al iniciar el juego con modo práctica activado:
    1. Todas las cartas se voltean automáticamente
    2. Permanecen visibles durante 2 segundos
    3. Se voltean de nuevo automáticamente
    4. El juego comienza normalmente
  
- **Restricciones**:
  - Los tiempos conseguidos en modo práctica NO se guardan en la tabla de mejores tiempos
  - Ideal para aprender y practicar sin afectar los récords oficiales
  
- **Experiencia de Usuario**:
  - Transición suave al voltear las cartas
  - El temporizador comienza desde el inicio (incluyendo los 2 segundos de práctica)
  - Útil para jugadores nuevos o niveles difíciles

### Implementación Técnica:
- Campo `practiceMode` en `MemoryGame`
- Método `showAllCardsForPractice()` con setTimeout de 2000ms
- Parámetro `practiceMode` en `startGame()`
- Checkbox HTML con id `practice-mode`
- Validación en `endGame()` para no guardar récords en modo práctica

---

## Cómo Probar

### Tabla de Mejores Tiempos:
1. Inicia el juego Memory
2. En el selector de dificultad, haz clic en "🏆 Ver Mejores Tiempos"
3. Verás una tabla vacía (sin récords aún)
4. Juega y completa una partida en cualquier dificultad
5. Vuelve a abrir "Ver Mejores Tiempos" y verás tu récord guardado
6. Intenta mejorar tu tiempo jugando de nuevo
7. Solo se guardará si superas tu récord anterior

### Modo de Práctica:
1. En el selector de dificultad, marca el checkbox "Modo Práctica"
2. Selecciona cualquier dificultad
3. Observa cómo todas las cartas se muestran durante 2 segundos
4. Las cartas se voltean automáticamente y puedes comenzar a jugar
5. Completa la partida (el tiempo NO se guardará en récords)
6. Juega sin modo práctica para que tu tiempo se registre

---

## Archivos Modificados

### TypeScript:
- `src/memory/types.ts`: 
  - Agregada interfaz `BestTime`
  
- `src/memory/MemoryGame.ts`:
  - Campo `practiceMode`
  - Parámetro `practiceMode` en `startGame()`
  - Método `showAllCardsForPractice()`
  - Método `saveBestTime()`
  - Método `getBestTime()`
  - Actualizado `endGame()` para guardar récords
  
- `src/memory/MemoryUI.ts`:
  - Actualizado `setupEventListeners()` para checkbox y botones
  - Actualizado `startGame()` con parámetro `practiceMode`
  - Método `showBestTimes()`
  - Método `hideBestTimes()`

### HTML:
- `public/memory.html`:
  - Agregado checkbox de modo práctica
  - Agregado botón "Ver Mejores Tiempos"
  - Agregado modal con tabla de mejores tiempos

### CSS:
- `public/memory.css`:
  - Estilos para `.practice-mode-container`
  - Estilos para `.practice-mode-label`
  - Estilos para `.best-times-button`
  - Estilos para `.best-times-modal`
  - Estilos para `.best-times-content`
  - Estilos para `.best-times-table`
  - Animación `@keyframes modalAppear`

---

## Notas Técnicas

- Los mejores tiempos se almacenan en localStorage con formato JSON
- El modo práctica no afecta las estadísticas ni los récords
- La tabla de mejores tiempos se actualiza dinámicamente al abrir el modal
- Los tiempos se comparan numéricamente (menor es mejor)
- La fecha se guarda en formato ISO y se muestra en formato local español
- El checkbox de modo práctica se resetea automáticamente al volver al selector

---

## Mejoras Futuras Sugeridas

- Agregar opción para borrar récords individuales
- Mostrar indicador visual cuando se bate un récord
- Agregar ranking con múltiples récords por dificultad
- Exportar/importar récords
- Comparar con récords de otros jugadores (online)
