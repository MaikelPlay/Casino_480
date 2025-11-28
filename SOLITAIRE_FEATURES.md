# Solitario Klondike - Características

## Descripción General
El Solitario Klondike es un juego de cartas clásico implementado con la misma calidad visual y experiencia de usuario que los juegos de Blackjack y Poker del Casino 480.

## Características Principales

### 🎮 Jugabilidad
- **Solitario Klondike Clásico**: Implementación completa de las reglas tradicionales
- **Drag & Drop**: Arrastra y suelta cartas entre pilas de forma intuitiva
- **Doble Click**: Mueve cartas automáticamente a las fundaciones con doble click
- **Reciclaje del Mazo**: Cuando se acaba el mazo, se puede reciclar el descarte

### 📊 Sistema de Puntuación
- **+10 puntos**: Por cada carta movida a una fundación
- **+5 puntos**: Por cada carta volteada en el tableau
- **-15 puntos**: Penalización por mover una carta de fundación de vuelta al tableau

### 🎯 Funcionalidades
- **Nuevo Juego**: Inicia una nueva partida en cualquier momento
- **Deshacer**: Deshace el último movimiento realizado
- **Pistas**: Sistema inteligente que sugiere movimientos posibles
- **Temporizador**: Cronómetro que registra el tiempo de juego
- **Contador de Movimientos**: Lleva la cuenta de todos los movimientos realizados

### 🎨 Diseño Visual
- **Mismo Estilo**: Utiliza el mismo fondo de tapete verde que Poker y Blackjack
- **Animaciones Suaves**: Transiciones fluidas al mover cartas
- **Efectos Visuales**: Resaltado de cartas al recibir pistas
- **Responsive**: Adaptado para diferentes tamaños de pantalla

### 🏆 Pantalla de Victoria
- Muestra estadísticas finales:
  - Puntuación total
  - Número de movimientos
  - Tiempo empleado
- Opción para jugar de nuevo

### 📱 Interfaz de Usuario
- **Panel de Reglas**: Accesible desde un botón lateral con todas las reglas del juego
- **Botón de Inicio**: Regresa a la página principal del casino
- **Información en Tiempo Real**: Muestra puntuación, movimientos y tiempo constantemente

### 🌍 Multilingüe
Soporte para los mismos idiomas que el resto del casino:
- Español
- English
- Português
- Italiano
- Français
- Deutsch
- Nederlands

## Reglas del Juego

### Objetivo
Mover todas las cartas a las 4 pilas de fundación, ordenadas por palo desde el As hasta el Rey.

### Estructura
- **Mazo (Stock)**: Cartas restantes para robar
- **Descarte (Waste)**: Cartas robadas del mazo
- **Fundaciones**: 4 pilas (una por palo) donde se construye de As a Rey
- **Tableau**: 7 columnas donde se juega

### Reglas del Tableau
- Las cartas se colocan en orden descendente (Rey a As)
- Deben alternarse colores (rojo-negro-rojo...)
- Solo un Rey puede ocupar un espacio vacío
- Puedes mover grupos de cartas si están ordenadas correctamente

### Reglas de las Fundaciones
- Comienzan con un As
- Se construyen en orden ascendente (As, 2, 3... Rey)
- Solo cartas del mismo palo

## Tecnología
- **TypeScript**: Lógica del juego con tipado fuerte
- **HTML5 Drag & Drop API**: Para la funcionalidad de arrastrar y soltar
- **CSS3**: Animaciones y efectos visuales
- **Arquitectura MVC**: Separación clara entre lógica (Game), vista (UI) y tipos

## Archivos Principales
```
src/solitaire/
├── SolitaireGame.ts    # Lógica del juego, reglas, puntuación
├── SolitaireUI.ts      # Renderizado, eventos, drag & drop
└── types.ts            # Definiciones de tipos TypeScript

public/
├── solitaire.html      # Estructura HTML del juego
└── solitaire.css       # Estilos específicos del solitario
```

## Próximas Mejoras Posibles
- [ ] Diferentes variantes de solitario (Spider, FreeCell)
- [ ] Tabla de mejores puntuaciones
- [ ] Modo de desafío con tiempo límite
- [ ] Estadísticas de victorias/derrotas
- [ ] Temas visuales personalizables
- [ ] Sonidos y efectos de audio
