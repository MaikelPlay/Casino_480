# 🎮 Cómo Probar el Solitario

## Pasos para Probar el Juego

### 1. Compilar el Proyecto
```bash
npm run build
```

### 2. Abrir en el Navegador
Abre el archivo `public/index.html` en tu navegador preferido:
- **Chrome/Edge**: Arrastra el archivo al navegador
- **Firefox**: Arrastra el archivo al navegador
- **Safari**: Arrastra el archivo al navegador

O usa la ruta completa:
```
file:///C:/ruta/a/tu/proyecto/public/index.html
```

### 3. Navegar al Solitario
1. En la página de inicio, verás tres opciones:
   - BlackJack
   - Poker
   - **Solitario** ← Selecciona esta
2. Haz clic en **"Empezar a Jugar"**

## Pruebas a Realizar

### ✅ Prueba 1: Inicio del Juego
- [ ] El juego carga correctamente
- [ ] Se muestran 7 columnas con cartas
- [ ] La primera columna tiene 1 carta, la segunda 2, etc.
- [ ] Solo la última carta de cada columna está boca arriba
- [ ] El mazo está en la esquina superior izquierda
- [ ] Las 4 fundaciones están vacías (muestran símbolos de palos)
- [ ] Puntuación, movimientos y tiempo están en 0

### ✅ Prueba 2: Robar Cartas del Mazo
- [ ] Haz clic en el mazo
- [ ] Una carta aparece en el descarte
- [ ] Puedes hacer clic múltiples veces
- [ ] Cuando el mazo se vacía, muestra el símbolo de reciclaje (↻)
- [ ] Al hacer clic en el símbolo, las cartas del descarte vuelven al mazo

### ✅ Prueba 3: Mover Cartas con Drag & Drop
- [ ] Arrastra una carta del descarte a una columna válida
- [ ] Arrastra una carta entre columnas
- [ ] Arrastra un grupo de cartas (si están ordenadas)
- [ ] Las zonas válidas se resaltan en verde al arrastrar
- [ ] No puedes soltar en zonas inválidas

### ✅ Prueba 4: Mover a Fundaciones
- [ ] Encuentra un As y arrástralo a su fundación correspondiente
- [ ] Haz doble clic en un As para moverlo automáticamente
- [ ] Arrastra el 2 del mismo palo sobre el As
- [ ] Continúa construyendo la fundación en orden
- [ ] La puntuación aumenta +10 por cada carta

### ✅ Prueba 5: Voltear Cartas
- [ ] Mueve todas las cartas boca arriba de una columna
- [ ] La carta boca abajo se voltea automáticamente
- [ ] La puntuación aumenta +5

### ✅ Prueba 6: Validaciones
**Tableau (Columnas):**
- [ ] No puedes poner una carta roja sobre otra roja
- [ ] No puedes poner una carta negra sobre otra negra
- [ ] No puedes poner un 5 sobre un 3 (debe ser descendente)
- [ ] Solo puedes poner un Rey en un espacio vacío

**Fundaciones:**
- [ ] Solo puedes poner un As como primera carta
- [ ] Solo puedes poner cartas del mismo palo
- [ ] Deben ir en orden ascendente (As, 2, 3, ..., K)

### ✅ Prueba 7: Botón Deshacer
- [ ] Haz un movimiento
- [ ] Haz clic en "Deshacer"
- [ ] El movimiento se revierte
- [ ] La puntuación se ajusta correctamente
- [ ] El contador de movimientos disminuye

### ✅ Prueba 8: Botón Pista
- [ ] Haz clic en "Pista"
- [ ] Una carta parpadea en verde (si hay movimiento posible)
- [ ] Si no hay movimientos, aparece un mensaje
- [ ] La pista sugiere movimientos válidos

### ✅ Prueba 9: Temporizador
- [ ] El temporizador comienza al cargar el juego
- [ ] Se actualiza cada segundo
- [ ] Muestra formato MM:SS

### ✅ Prueba 10: Contador de Movimientos
- [ ] Aumenta con cada movimiento
- [ ] Robar del mazo cuenta como movimiento
- [ ] Deshacer disminuye el contador

### ✅ Prueba 11: Victoria
Para probar rápidamente la victoria (sin jugar completo):
1. Abre la consola del navegador (F12)
2. Ejecuta este código para simular victoria:
```javascript
// Esto es solo para testing - no usar en juego real
// Tendrías que modificar el código para hacer esto
```

O juega hasta completar las 4 fundaciones:
- [ ] Aparece pantalla de victoria
- [ ] Muestra puntuación final
- [ ] Muestra número de movimientos
- [ ] Muestra tiempo total
- [ ] Botón "Jugar de Nuevo" funciona

### ✅ Prueba 12: Botón Nuevo Juego
- [ ] Haz clic en "Nuevo Juego"
- [ ] El juego se reinicia
- [ ] Nueva distribución de cartas
- [ ] Puntuación, movimientos y tiempo se resetean

### ✅ Prueba 13: Panel de Reglas
- [ ] Haz clic en "Reglas"
- [ ] El panel se desliza desde la izquierda
- [ ] Muestra todas las reglas del juego
- [ ] Haz clic en la X para cerrar
- [ ] El panel se oculta

### ✅ Prueba 14: Botón de Regreso
- [ ] Haz clic en "← Inicio"
- [ ] Vuelves a la página principal
- [ ] Puedes seleccionar otro juego

### ✅ Prueba 15: Responsive Design
**Desktop (>1024px):**
- [ ] Todo se ve correctamente
- [ ] Cartas tienen buen tamaño
- [ ] Controles accesibles

**Tablet (768px - 1024px):**
- [ ] Redimensiona la ventana
- [ ] El layout se adapta
- [ ] Cartas más pequeñas pero jugables

**Móvil (<768px):**
- [ ] Redimensiona a tamaño móvil
- [ ] Columnas más juntas
- [ ] Controles apilados verticalmente
- [ ] Drag & drop funciona en touch

### ✅ Prueba 16: Multilingüe
1. Vuelve a la página de inicio
2. Cambia el idioma en el selector
3. Inicia el solitario
4. Verifica que:
   - [ ] El botón "Solitario" cambia de nombre según el idioma
   - [ ] Las reglas están en el idioma correcto (si están traducidas)

## Casos de Prueba Específicos

### Caso 1: Mover Grupo de Cartas
1. Organiza una secuencia: 7♥ - 6♠ - 5♥
2. Arrastra el 6♠ (con el 5♥ debajo)
3. Suelta sobre un 8♣
4. Ambas cartas deben moverse juntas

### Caso 2: Rey en Espacio Vacío
1. Vacía una columna completamente
2. Intenta mover un 5 al espacio vacío → No debe permitir
3. Mueve un Rey al espacio vacío → Debe permitir

### Caso 3: Reciclaje del Mazo
1. Roba todas las cartas del mazo
2. El mazo muestra ↻
3. Haz clic en ↻
4. Las cartas del descarte vuelven al mazo en orden inverso

### Caso 4: Doble Click a Fundación
1. Encuentra un As en el descarte o tableau
2. Haz doble click sobre él
3. Debe moverse automáticamente a su fundación

## Bugs Conocidos a Verificar

- [ ] ¿Las cartas se superponen correctamente en el tableau?
- [ ] ¿El drag & drop funciona en todos los navegadores?
- [ ] ¿El temporizador se detiene al ganar?
- [ ] ¿La puntuación se calcula correctamente?
- [ ] ¿El deshacer funciona con movimientos de múltiples cartas?

## Rendimiento

- [ ] El juego carga rápidamente
- [ ] No hay lag al arrastrar cartas
- [ ] Las animaciones son fluidas
- [ ] No hay errores en la consola del navegador

## Accesibilidad

- [ ] Las imágenes tienen atributos alt
- [ ] Los botones son clickeables
- [ ] El contraste de colores es adecuado
- [ ] Se puede navegar con teclado (si está implementado)

## Reporte de Bugs

Si encuentras algún bug, documenta:
1. **Qué hiciste**: Pasos para reproducir
2. **Qué esperabas**: Comportamiento esperado
3. **Qué pasó**: Comportamiento actual
4. **Navegador**: Chrome, Firefox, Safari, etc.
5. **Consola**: Errores en la consola del navegador (F12)

## Checklist Final

- [ ] Todas las funcionalidades básicas funcionan
- [ ] No hay errores en la consola
- [ ] El juego es jugable de inicio a fin
- [ ] La interfaz es intuitiva
- [ ] El diseño es consistente con los otros juegos
- [ ] El juego es divertido y desafiante

## ¡Disfruta Probando! 🎉

Si todo funciona correctamente, ¡felicidades! Has implementado exitosamente el Solitario Klondike en Casino 480.
