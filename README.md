# Casino 480

## Descripción
Casino 480 es una aplicación de casino del lado del cliente, basada en navegador, que actualmente cuenta con los populares juegos de cartas Blackjack y Poker. Los usuarios comienzan en una página de inicio donde pueden seleccionar un juego, establecer su nombre, saldo inicial y el número de jugadores. La aplicación está diseñada para ser multilingüe e incluye oponentes de IA simples para experiencias de un solo jugador.

## Características
*   **Juego de Blackjack:** Juega contra un crupier con configuraciones personalizables.
*   **Juego de Poker:** Participa en rondas de póker con oponentes de IA.
*   **Soporte Multilingüe:** La aplicación admite varios idiomas, configurables desde la página de inicio.
*   **Configuraciones de Juego Personalizables:** Los usuarios pueden establecer su nombre, saldo inicial y el número de jugadores para cada juego.
*   **Oponentes de IA Simples:** Proporciona una IA básica para jugar contra el ordenador.

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
│   ├───blackjack.html        # Página del juego de Blackjack
│   ├───poker.html            # Página del juego de Poker
│   ├───styles.css            # Estilos generales
│   └───assets/               # Recursos del juego (imágenes de cartas, fondos)
├───src/
│   ├───blackjack.ts          # Inicialización del juego de Blackjack
│   ├───poker.ts              # Inicialización del juego de Poker
│   ├───landing.ts            # Lógica de la página de inicio
│   ├───i18n.ts               # Configuración de internacionalización
│   ├───common/               # Lógica de juego compartida (Carta, Mazo, Jugador)
│   │   ├───Card.ts
│   │   ├───Deck.ts
│   │   └───Player.ts
│   ├───blackjack/            # Módulos específicos de Blackjack
│   │   ├───BlackjackGame.ts  # Lógica central del juego de Blackjack
│   │   ├───BlackjackPlayer.ts# Modelo de jugador de Blackjack
│   │   ├───BlackjackUI.ts    # Gestión de la UI de Blackjack
│   │   └───types.ts
│   └───poker/                # Módulos específicos de Poker
│       ├───PokerGame.ts      # Lógica central del juego de Poker
│       ├───PokerPlayer.ts    # Modelo de jugador de Poker
│       ├───PokerUI.ts        # Gestión de la UI de Poker
│       ├───ai.ts             # Lógica de la IA de Poker
│       ├───evaluator.ts      # Evaluador de manos de Poker
│       └───types.ts
└───tests/
    ├───blackjack/
    │   └───determinarGanadores.test.ts # Pruebas de Blackjack
    └───poker/
        ├───evaluator.test.ts         # Pruebas del evaluador de manos de Poker
        └───PokerGame.test.ts         # Pruebas del juego de Poker
```