# Sal Neutra

Juego de nomenclatura inorgánica en español de Chile. Se nombran compuestos a partir de la fórmula, se escriben fórmulas a partir del nombre y se calcula cuántos cationes y aniones forman la sal neutra. Admite nomenclatura Stock, sistemática y tradicional, tres modos de juego (Clásico, Contrarreloj y Supervivencia) y cinco niveles.

Hecho con Vite, React y TypeScript. Funciona en celular y en pantallas grandes. Tiene temas claro, oscuro y variantes de color, y se distribuye bajo licencia MIT.

## Comandos

```bash
npm install        # instalar dependencias
npm run dev        # servidor de desarrollo (http://localhost:5173)
npm test           # pruebas de la lógica y de la interfaz (Vitest)
npm run build      # compila a dist/
npm run preview    # sirve dist/ para revisar el build
```

## Estructura

```
src/
├── lib/               Lógica pura, sin React (aquí se agregan iones y reglas)
│   ├── ions.ts        Cationes y aniones con carga y nombres
│   ├── levels.ts      Los 5 niveles y sus combinaciones válidas
│   ├── naming.ts      Nombres (Stock, sistemática, tradicional) y fórmulas
│   ├── check.ts       Revisión de respuestas (tildes, romanos, subíndices)
│   ├── scoring.ts     Puntaje: base, rapidez, racha, nivel
│   ├── stats.ts       Contadores de lo jugado (de aquí salen los logros)
│   ├── achievements.ts  Lista de logros, avance y desbloqueo
│   ├── progress.ts    Respaldo: crear, leer, validar y combinar
│   ├── questions.ts   Generador de preguntas y opciones de selección múltiple
│   ├── theme.ts       Temas, colores de muestra y persistencia
│   └── storage.ts     localStorage tolerante a fallos
├── hooks/useGame.ts   Estado de la partida (puntaje, vidas, tiempo, errores)
├── hooks/useProgress.ts  Estadísticas, logros y avisos
├── hooks/useTheme.ts  Tema activo y cambio automático del sistema
├── components/        Home, Game, Results, IonTable, Achievements, Backup, ThemePicker y los tipos de respuesta
├── constants.ts       Textos de modos, tipos, nomenclaturas y reglas
├── styles.css         Estilos y paletas de los temas
└── *.test.ts(x)       Pruebas
```

## Temas

El selector **Tema** del inicio guarda la elección en el navegador y la aplica antes del primer pintado para que no haya destellos. Las opciones son:

| Tema | Apariencia |
| --- | --- |
| Sistema | Claro u oscuro según el dispositivo |
| Claro / Oscuro | La paleta clásica de laboratorio |
| Océano | Azul profundo con cian |
| Bosque | Verde de invernadero |
| Atardecer | Malva cálido y durazno |
| Lavanda | Lila claro |
| Arena | Papel cálido y terracota |

Cada tema define las variables CSS de `:root`: fondos, texto, bordes y los colores de cationes, aniones, aciertos y errores. Para agregar uno:

1. Añade el identificador a `ThemeId` y una entrada a `THEMES` en `src/lib/theme.ts` (nombre, ayuda y colores de la muestra).
2. Agrega el bloque `:root[data-theme="tu-tema"]` en `src/styles.css` con todas las variables y su `color-scheme`.
3. Suma el color de fondo al mapa de `index.html` para la barra del navegador.
4. `src/App.test.tsx` revisa que el tema se aplique y se recuerde; `npm test` avisa si algo queda mal.

## Dónde agregar cosas

- **Un ion nuevo:** `src/lib/ions.ts` (lista `CATIONS` o `ANIONS`) y, si corresponde, súmalo a un nivel en `src/lib/levels.ts`. Las pruebas de `lib.test.ts` revisan que todas las sales queden neutras y que sus nombres se acepten.
- **Un nivel nuevo:** `LEVELS` y `LEVEL_IDS` en `src/lib/levels.ts`.
- **Un tipo de pregunta nuevo:** tipo `QType` en `src/lib/types.ts`, generación en `questions.ts`, componente de respuesta en `src/components/` y su uso en `Game.tsx`.
- **Sales hidratadas, peróxidos, otras ideas:** conviene partir por `lib/` y recién después la interfaz.

## Logros

Los logros son opcionales: el usuario los activa en la pantalla **Logros**. Hay cuatro niveles al estilo de los trofeos (bronce, plata, oro y platino), tres logros secretos y un platino que se desbloquea al conseguir todos los demás.

Las estadísticas se registran siempre en el navegador, así que lo jugado antes de activar los logros también cuenta. Al activarlos se desbloquea lo que ya estaba cumplido.

Para agregar un logro:

1. Si necesita un contador nuevo, súmalo en `src/lib/stats.ts` (`Stats`, `emptyStats`, `sanitizeStats`, `mergeStats` y donde se actualice).
2. Agrega una entrada a `ACHIEVEMENTS` en `src/lib/achievements.ts` con su nivel y su `goal`, que devuelve `[avance, meta]`.
3. `npm test` revisa que todos los logros se puedan alcanzar.

## Copia de progreso

La pantalla **Copia de progreso** exporta e importa récords, errores por repasar, estadísticas y logros, para pasar de un dispositivo a otro. Se puede usar un archivo `.json` o un código de texto para copiar y pegar. La configuración del juego no se incluye.

Al importar se combina con lo que ya hay: se conserva el mejor valor de cada récord y de cada contador, se juntan los errores y los logros, y no se borra nada. Importar el mismo respaldo dos veces no duplica nada.

El formato lleva `app: "sal-neutra"` y `v: 1`. Si cambia, sube `SNAPSHOT_VERSION` en `src/lib/progress.ts` y migra los respaldos antiguos en `parseSnapshot`.

Claves de `localStorage`: `sn:cfg`, `sn:best`, `sn:err`, `sn:stats`, `sn:ach`, `sn:achOn` y `sn:theme`.

## Licencia

[MIT](LICENSE) © 2026 MycoPixel. Puedes usar, modificar y compartir el proyecto citando el aviso de copyright.

## Subir a GitHub

```bash
git init
git add .
git commit -m "Sal Neutra: versión inicial"
git branch -M main
git remote add origin https://github.com/MycoPixel/SalNeutra.git
git push -u origin main
```

Antes, crea el repositorio vacío `SalNeutra` en GitHub (sin README ni .gitignore, que ya vienen en el proyecto).

## Publicar en Vercel

1. En vercel.com, **Add New → Project** e importa el repositorio de GitHub.
2. Vercel detecta Vite solo: comando `npm run build`, carpeta de salida `dist`. No hace falta configurar nada más.
3. Cada `git push` a `main` publica una versión nueva; las ramas generan vistas previas.

Los récords y los errores a repasar se guardan en el navegador de cada estudiante (localStorage); no hay servidor ni cuentas.
