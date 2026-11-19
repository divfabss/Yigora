# Demo de Yigora: cómo probarla

> Versión de demostración (0.2.0). Usa una **farmacia ficticia** incluida en la extensión: los productos,
> precios y existencias son inventados. No se conecta a ningún servidor ni usa IA todavía.

## 1. Instalar la extensión en Google Chrome

1. Descomprima `yigora-extension-demo.zip` en una carpeta (por ejemplo, `Documentos/yigora-demo`).
2. En Chrome, abra `chrome://extensions`.
3. Active **Modo de desarrollador** (arriba a la derecha).
4. Pulse **Cargar descomprimida** y elija la carpeta del paso 1 (la que contiene `manifest.json`).
5. (Opcional) Fije el ícono de Yigora en la barra con el ícono de rompecabezas.

## 2. Usarla en WhatsApp Web

1. Abra `https://web.whatsapp.com` (o pulse el ícono de Yigora: abre WhatsApp Web).
2. Aparece la ventana **Yigora** abajo a la izquierda:
   - **Mover:** arrastre la barra azul.
   - **Cambiar el tamaño:** arrastre la esquina inferior derecha.
   - **Fijar (📌):** la ventana queda fija en su lugar y tamaño (no se mueve por accidente). Púlselo de
     nuevo para desfijarla. Posición, tamaño y fijado se recuerdan.
   - **Minimizar (–):** queda una burbuja; púlsela (o el ícono de la extensión) para volver.
3. Abra el chat de un cliente (chat individual). La ventana muestra, de arriba hacia abajo:
   - **Conversación:** los mensajes de hoy del cliente, unidos en un solo bloque (Yigora entiende la
     conversación completa, no mensaje por mensaje) y lo que pide el cliente.
   - **Respuesta sugerida** en el idioma del cliente, editable, con el botón **Copiar**.
   - **Inventario:** productos encontrados con precio y existencias, y sugerencias para el vendedor.
4. Pulse **Copiar**, pegue en WhatsApp y envíe usted. **Yigora nunca envía mensajes.**
5. **Agregar mensajes a mano:** escriba o pegue en el campo de la conversación y pulse **Enter** (o
   **Agregar**). Puede agregar varios: se analizan juntos. El campo se vacía solo.
6. **Limpiar:** deja la ventana lista para el siguiente cliente.

## 3. Mensajes de prueba sugeridos

Pídale a alguien que le escriba (o escríbase desde otro número) mensajes como:

| Mensaje                                              | Qué debería ver                                           |
| ---------------------------------------------------- | --------------------------------------------------------- |
| `Hi! Do you have anything for allergies?`            | Respuesta en inglés con Loratadina (y Cetirizina agotada) |
| `Buenas, tienen loratadna?` (con error)              | Encuentra Loratadina 10 mg y ofrece apartarla             |
| `tienen protector solar?` y luego `y cuánto cuesta?` | Precio del protector solar (entiende el seguimiento)      |
| `tienen suero oral?`                                 | "Permítame verificar…" (stock desconocido, nunca 0)       |
| `tienen jarabe para la tos?`                         | Pide confirmar: inventario desactualizado                 |
| `tienen amoxicilina?`                                | Avisa que requiere receta                                 |
| `Vocês têm algo para dor de cabeça?`                 | Respuesta en portugués                                    |
| `Bonjour, avez-vous quelque chose contre la toux ?`  | Respuesta en francés                                      |
| `Haben Sie etwas gegen Halsschmerzen?`               | Respuesta en alemán                                       |
| `Avete qualcosa per il mal di gola?`                 | Respuesta en italiano                                     |
| `tienen insulina?`                                   | Indica con honestidad que no está en el catálogo          |

Pruebe también la conversación en varios mensajes: `Hola, buenos días.` y luego `Me gustaría consultar
por medicamentos para el dolor de cabeza.` → Yigora los entiende como una sola consulta y responde
"¡Hola! Para eso tenemos estas opciones: • Acetaminofén 500 mg…".

Si la lectura automática no funciona en su WhatsApp, agregue los mensajes a mano: el resto de la demo
funciona igual.

## 4. Inventario ficticio incluido

Loratadina 10 mg · Cetirizina 10 mg (agotada) · Acetaminofén 500 mg · Ibuprofeno 400 mg · Suero oral
(stock desconocido) · Omeprazol 20 mg · Amoxicilina 500 mg (receta) · Jarabe para la tos (desactualizado) ·
Pastillas para la garganta · Protector solar FPS 50 · Repelente de insectos (agotado) · Alcohol en gel ·
Vitamina C · Termómetro digital · Curitas · Gotas lubricantes (stock desconocido) · Crema para picaduras.

## 5. Limitaciones de esta demo

- **Lectura de WhatsApp con sesión iniciada sin validar en vivo:** la ventana se probó sobre WhatsApp Web
  real, pero leer un chat requiere una cuenta con sesión. El lector reconoce varios formatos de fecha y
  los separadores "HOY/AYER"; si aun así no lee, la ventana muestra un **Diagnóstico de lectura**.
- **Sin traducción completa al español:** la detección de idioma, intención y productos funciona sin IA;
  la traducción literal del mensaje llegará con Claude Haiku en la versión conectada.
- **Inventario fijo:** la importación de Excel/CSV y el dashboard llegan en las siguientes fases.
- **Riesgo aceptado:** WhatsApp restringe herramientas no oficiales; la extensión solo lee, pero
  recomendamos probar con una cuenta de prueba.

## 6. Si algo no funciona

1. En `chrome://extensions`, verifique que Yigora esté activa y que la versión sea **0.2.0**. Si tenía
   una versión anterior, pulse **Quitar** y vuelva a cargar la carpeta nueva.
2. **Recargue la pestaña de WhatsApp Web** (F5) después de instalar o actualizar la extensión: las
   pestañas abiertas antes no reciben la extensión.
3. Si en un chat con mensajes de hoy aparece el recuadro amarillo **Diagnóstico de lectura**, envíenos
   una captura de ese recuadro: no contiene el contenido de los mensajes y nos dice exactamente qué
   ajustar.
4. Abra las herramientas para desarrolladores (F12) → **Consola** y escriba `Yigora` en el filtro.
   Debería ver mensajes como `[Yigora] ventana flotante lista` y `[Yigora] estado de lectura`. Estos
   mensajes nunca incluyen el contenido de las conversaciones. Envíenos una captura de esos mensajes.
5. En `chrome://extensions`, pulse **Errores** en la tarjeta de Yigora (si aparece) y envíenos una captura.

## 7. Desinstalar

En `chrome://extensions`, pulse **Quitar** en Yigora. La extensión no guarda conversaciones; solo
recuerda la posición, el tamaño, si está fijada y si la lectura está en pausa.
