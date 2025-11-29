# Casino 480

## Descripción
Casino 480 es una aplicación de casino del lado del cliente, basada en navegador, que cuenta con cuatro populares juegos de cartas: Blackjack, Poker Texas Hold'em, Solitario Klondike y Memory. Los usuarios comienzan en una página de inicio elegante donde pueden seleccionar un juego. La aplicación está diseñada para ser multilingüe, completamente responsive e incluye oponentes de IA para experiencias de un solo jugador.

## Características

### Juegos Disponibles
*   **Blackjack:** Juega contra un crupier con configuraciones personalizables, estrategia de IA y animación de pago de fichas al ganar.
*   **Poker Texas Hold'em:** Participa en rondas de póker con hasta 5 oponentes de IA, sistema de apuestas con fichas visuales, y modal de victoria elegante.
*   **Solitario Klondike:** Disfruta del clásico solitario con sistema de puntuación, deshacer movimientos, pistas automáticas, contador de eficiencia y animación de celebración al ganar.
*   **Memory:** Juego de memoria con tres niveles de dificultad (6, 10 y 18 parejas), tabla de mejores tiempos por dificultad y modo de práctica.

### Características Generales
*   **Soporte Multilingüe:** La aplicación admite 7 idiomas (Español, Inglés, Portugués, Italiano, Francés, Alemán, Holandés).
*   **Diseño Responsive:** Optimizado para desktop, tablet y móvil con layouts adaptativos.
*   **Interfaz Elegante:** Diseño tipo casino con efectos visuales, animaciones suaves y tipografía premium (Cinzel).
*   **Sistema de Fichas Visual:** En Poker, sistema de apuestas intuitivo con fichas de casino realistas (10€, 20€, 50€, 100€).
*   **Modales de Victoria:** Mensajes elegantes con animaciones al ganar partidas.
*   **Efectos de Sonido:** Sonidos de cartas y fichas para mayor inmersión (configurable).
*   **Sistema de Estadísticas:** Botón flotante turquesa (#43E9B4) para ver estadísticas globales de todos los juegos con modal elegante.

## Tecnologías Utilizadas
*   **TypeScript:** Para una lógica de aplicación robusta y con tipado seguro.
*   **HTML/CSS:** Para estructurar y estilizar la interfaz de usuario.
*   **JavaScript (ES6+):** Lenguaje de scripting subyacente.
*   **Jest:** Para pruebas unitarias de la lógica de la aplicación.
*   **Sin frameworks principales:** La aplicación está construida utilizando APIs nativas del DOM del navegador para un enfoque ligero y directo.

## Arquitectura
El proyecto sigue generalmente un patrón Modelo-Vista-Controlador (MVC):
*   **Modelo:** La lógica y el estado del juego se encapsulan en archivos `*Game.ts` (por ejemplo, `BlackjackGame.ts`).
*   **Vista:** Los archivos HTML proporcionan la estructura, y los archivos `*UI.ts` (por ejemplo, `BlackjackUI.ts`) manejan la manipulación del DOM y el renderizado.
*   **Controlador:** Los scripts de inicialización (`blackjack.ts`, `poker.ts`) arrancan el juego, y las clases `*Game.ts` gestionan el flujo del juego.

## Instalación
Para configurar el proyecto localmente, sigue estos pasos:

1.  **Clona el repositorio:**
    ```bash
    git clone https://github.com/tu-usuario/Game-BlackJack-TypeScript.git
    cd Game-BlackJack-TypeScript
    ```
    *(Nota: Reemplaza `https://github.com/tu-usuario/Game-BlackJack-TypeScript.git` con la URL real del repositorio si es diferente)*

2.  **Instala las dependencias:**
    ```bash
    npm install
    ```

## Uso
Para ejecutar la aplicación:

1.  **Construye el proyecto:** Esto compilará los archivos TypeScript a JavaScript y los colocará en el directorio `dist`.
    ```bash
    npm run build
    ```

2.  **Abre en el navegador:** Navega al directorio `public` y abre `index.html` en tu navegador web.
    ```
    file:///ruta/a/tu/proyecto/public/index.html
    ```
    Desde la página de inicio, puedes seleccionar el juego que desees y configurar los ajustes.

## Pruebas
Para ejecutar las pruebas unitarias:

```bash
npm test
```

## Estructura de Archivos (Vista Parcial)
```
.
├───public/
│   ├───index.html            # Página de inicio
│   ├───landing.css           # Estilos de la página de inicio
│   ├───blackjack.html        # Página del juego de Blackjack
│   ├───blackjack.css         # Estilos de Blackjack
│   ├───poker.html            # Página del juego de Poker
│   ├───poker.css             # Estilos de Poker (con fichas de casino)
│   ├───solitaire.html        # Página del juego de Solitario
│   ├───solitaire.css         # Estilos de Solitario
│   ├───memory.html           # Página del juego de Memory
│   ├───memory.css            # Estilos de Memory
│   ├───styles.css            # Estilos generales
│   └───assets/               # Recursos del juego (imágenes de cartas, fondos)
├───src/
│   ├───blackjack.ts          # Inicialización del juego de Blackjack
│   ├───poker.ts              # Inicialización del juego de Poker
│   ├───solitaire.ts          # Inicialización del juego de Solitario
│   ├───memory.ts             # Inicialización del juego de Memory
│   ├───landing.ts            # Lógica de la página de inicio
│   ├───i18n.ts               # Configuración de internacionalización
│   ├───backButton.ts         # Componente de botón de retorno
│   ├───rulesPanel.ts         # Panel de reglas reutilizable
│   ├───common/               # Lógica de juego compartida (Carta, Mazo, Jugador)
│   │   ├───Card.ts
│   │   ├───Deck.ts
│   │   └───Player.ts
│   ├───blackjack/            # Módulos específicos de Blackjack
│   │   ├───BlackjackGame.ts  # Lógica central del juego de Blackjack
│   │   ├───BlackjackPlayer.ts# Modelo de jugador de Blackjack
│   │   ├───BlackjackUI.ts    # Gestión de la UI de Blackjack
│   │   └───types.ts
│   ├───poker/                # Módulos específicos de Poker
│   │   ├───PokerGame.ts      # Lógica central del juego de Poker
│   │   ├───PokerPlayer.ts    # Modelo de jugador de Poker
│   │   ├───PokerUI.ts        # Gestión de la UI de Poker (con sistema de fichas)
│   │   ├───ai.ts             # Lógica de la IA de Poker
│   │   ├───evaluator.ts      # Evaluador de manos de Poker
│   │   └───types.ts
│   ├───solitaire/            # Módulos específicos de Solitario
│   │   ├───SolitaireGame.ts  # Lógica central del juego de Solitario
│   │   ├───SolitaireUI.ts    # Gestión de la UI de Solitario
│   │   └───types.ts
│   └───memory/               # Módulos específicos de Memory
│       ├───MemoryGame.ts     # Lógica central del juego de Memory
│       ├───MemoryUI.ts       # Gestión de la UI de Memory
│       └───types.ts
└───tests/
    ├───blackjack/
    │   └───determinarGanadores.test.ts # Pruebas de Blackjack
    └───poker/
        ├───evaluator.test.ts         # Pruebas del evaluador de manos de Poker
        └───PokerGame.test.ts         # Pruebas del juego de Poker
```

## Características Destacadas por Juego

### Poker Texas Hold'em
- **Sistema de Fichas Visual:** Fichas de casino realistas con valores de 10€, 20€, 50€ y 100€
- **Diseño de Fichas:** Gradientes radiales, bordes decorativos y efectos 3D
- **Panel de Apuestas Intuitivo:** Display de apuesta actual con botón "Subir" y fichas clickeables
- **Modal de Victoria:** Animación elegante con corona, nombre del ganador, mano ganadora y cantidad ganada
- **Botones Redondeados:** Interfaz moderna con botones de acción centrados
- **Layout Optimizado:** Panel inferior compacto para maximizar el área de juego
- **Posicionamiento del Bote:** Bote visible y bien posicionado en el centro de la mesa

### Solitario Klondike ⭐⭐
- **Sistema de Puntuación:** +10 puntos por carta a fundación, +5 por voltear carta
- **Deshacer Movimientos:** Historial completo de movimientos con botón de deshacer
- **Sistema de Pistas:** Sugerencias automáticas de movimientos válidos
- **Animaciones Profesionales:** Reparto de cartas estilo casino, sin parpadeos
- **Layout Centrado:** Cartas del tableau centradas verticalmente con espacio para apilar
- **Símbolos Grandes:** Iconos de palos (♥ ♦ ♠ ♣) grandes y visibles en fundaciones
- **Drag & Drop:** Arrastrar y soltar cartas individuales o grupos
- **🆕 Contador de Movimientos Óptimos:** Calcula y muestra el número mínimo teórico de movimientos
- **🆕 Indicador de Eficiencia:** Porcentaje en tiempo real que compara tus movimientos con el óptimo
  - Verde (90-100%): Excelente
  - Dorado (70-89%): Bueno
  - Naranja (50-69%): Regular
  - Rojo (<50%): Necesitas mejorar
- **🆕 Animación de Celebración:** Las cartas "saltan" en secuencia cuando completas el juego
  - Animación escalonada con delay de 30ms entre cartas
  - Efecto de rebote natural con rotación y escala
  - Sincronizado con sonidos

### Memory ⭐
- **Tres Niveles de Dificultad:**
  - Fácil: 6 parejas (4x3 grid)
  - Medio: 10 parejas (7x3 grid)
  - Difícil: 18 parejas (9x4 grid)
- **Diseño Horizontal:** Cartas orientadas horizontalmente para mejor visualización
- **Sistema de Puntuación:** Contador de movimientos y tiempo
- **Animaciones Suaves:** Volteo de cartas con efecto 3D
- **Efectos Visuales:** Animación especial para parejas encontradas
- **Responsive:** Grid adaptativo para diferentes tamaños de pantalla
- **🆕 Tabla de Mejores Tiempos:** Guarda los mejores tiempos por dificultad en localStorage
  - Modal elegante con tabla organizada
  - Muestra tiempo, movimientos y fecha del récord
  - Solo guarda si superas tu récord anterior
  - Botón "🏆 Ver Mejores Tiempos" en selector de dificultad
- **🆕 Modo de Práctica:** Ver todas las cartas durante 2 segundos al inicio
  - Checkbox activable antes de cada partida
  - Permite memorizar posiciones
  - Los tiempos en modo práctica NO se guardan en récords
  - Ideal para aprender o practicar niveles difíciles

### Blackjack ⭐⭐
- **IA del Crupier:** Lógica profesional siguiendo reglas estándar de casino
- **Múltiples Jugadores:** Soporte para varios jugadores simultáneos
- **Sistema de Apuestas:** Gestión de saldo y apuestas por ronda
- **Detección de Blackjack:** Reconocimiento automático de 21 natural
- **🆕 Animación de Pago de Fichas:** Cuando ganas, las fichas se animan desde el centro hacia tu área
  - Fichas doradas con diseño realista de casino
  - Rotación de 360° durante el movimiento
  - Número de fichas proporcional a la cantidad ganada (máximo 10)
  - Delay escalonado de 100ms entre cada ficha
  - Sincronizado con sonidos de fichas
  - Efecto visual profesional con gradientes y sombras 3D

## Mejoras Técnicas
- **TypeScript Estricto:** Tipado fuerte para prevenir errores en tiempo de ejecución
- **Arquitectura MVC:** Separación clara entre lógica de juego, UI y datos
- **CSS Modular:** Archivos CSS específicos por juego para mejor mantenimiento
- **Responsive Design:** Media queries y clamp() para adaptación fluida
- **Animaciones CSS:** Uso de keyframes y transitions para efectos suaves
- **Sin Dependencias Externas:** Código vanilla para máximo rendimiento
- **LocalStorage:** Persistencia de mejores tiempos y estadísticas entre sesiones
- **Optimización de Rendimiento:** Animaciones con GPU acceleration (transform y opacity)
- **Auto-limpieza:** Elementos DOM temporales se eliminan automáticamente

## Nuevas Características Implementadas (Última Actualización)

### Solitario Klondike
✅ **Contador de Movimientos Óptimos y Eficiencia**
- Calcula automáticamente el número mínimo de movimientos (52 cartas + cartas boca abajo)
- Indicador de eficiencia en tiempo real con colores dinámicos
- Ubicado en la barra superior junto a puntuación y tiempo

✅ **Animación de Celebración al Ganar**
- Las cartas en las fundaciones "saltan" en secuencia
- Animación escalonada con efecto de rebote natural
- Se muestra antes del mensaje de victoria

### Memory
✅ **Tabla de Mejores Tiempos por Dificultad**
- Almacenamiento persistente en localStorage
- Modal elegante con tabla organizada por dificultad
- Muestra tiempo, movimientos y fecha del récord
- Solo guarda si superas tu mejor tiempo

✅ **Modo de Práctica**
- Checkbox para activar antes de cada partida
- Muestra todas las cartas durante 2 segundos al inicio
- Los tiempos en modo práctica no se registran
- Ideal para aprender y practicar

### Blackjack
✅ **Animación de Pago de Fichas**
- Fichas animadas que se mueven desde el centro hacia el jugador
- Diseño realista con gradientes dorados y efectos 3D
- Rotación y cambio de escala durante el movimiento
- Sincronizado con efectos de sonido

### Página Principal
✅ **Botón de Estadísticas Actualizado**
- Nuevo color turquesa (#43E9B4) con efecto neón
- Animación de pulso continua
- Muestra estadísticas globales de todos los juegos

## Documentación Adicional
Para más detalles sobre las nuevas características, consulta:
- `SOLITARIO_NUEVAS_CARACTERISTICAS.md` - Detalles del contador de eficiencia y animación de celebración
- `MEMORY_NUEVAS_CARACTERISTICAS.md` - Detalles de la tabla de mejores tiempos y modo de práctica
- `BLACKJACK_ANIMACION_PAGO.md` - Detalles de la animación de pago de fichas
