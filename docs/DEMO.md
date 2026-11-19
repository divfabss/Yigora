# Demo de Yigora: cómo probarla

> Versión de demostración (0.1.0). Usa una **farmacia ficticia** incluida en la extensión: los productos,
> precios y existencias son inventados. No se conecta a ningún servidor ni usa IA todavía.

## 1. Instalar la extensión en Google Chrome

1. Descomprima `yigora-extension-demo.zip` en una carpeta (por ejemplo, `Documentos/yigora-demo`).
2. En Chrome, abra `chrome://extensions`.
3. Active **Modo de desarrollador** (arriba a la derecha).
4. Pulse **Cargar descomprimida** y elija la carpeta del paso 1 (la que contiene `manifest.json`).
5. (Opcional) Fije el ícono de Yigora en la barra con el ícono de rompecabezas.

## 2. Usarla en WhatsApp Web

1. Abra `https://web.whatsapp.com` (o pulse el ícono de Yigora: abre WhatsApp Web).
2. Aparece la ventana flotante **Yigora** abajo a la izquierda. Puede arrastrarla desde la barra azul,
   minimizarla con `–` y volver a abrirla con la burbuja o con el ícono de la extensión.
3. Abra el chat de un cliente (chat individual). Yigora lee los mensajes **de hoy** y muestra:
   - el mensaje del cliente y el idioma detectado;
   - lo que pide el cliente (resumen en español);
   - la **respuesta sugerida** en el idioma del cliente, editable;
   - los productos encontrados con precio y existencias, y una sugerencia comercial.
4. Pulse **Copiar**, pegue en WhatsApp y envíe usted. **Yigora nunca envía mensajes.**
5. Puede cambiar el idioma de la respuesta con el selector, pausar la lectura con **Pausar**, o pegar
   un mensaje manualmente en **Pegar mensaje del cliente**.

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

Si la lectura automática no funciona en su WhatsApp, use **Pegar mensaje del cliente**: el resto de la
demo funciona igual.

## 4. Inventario ficticio incluido

Loratadina 10 mg · Cetirizina 10 mg (agotada) · Acetaminofén 500 mg · Ibuprofeno 400 mg · Suero oral
(stock desconocido) · Omeprazol 20 mg · Amoxicilina 500 mg (receta) · Jarabe para la tos (desactualizado) ·
Pastillas para la garganta · Protector solar FPS 50 · Repelente de insectos (agotado) · Alcohol en gel ·
Vitamina C · Termómetro digital · Curitas · Gotas lubricantes (stock desconocido) · Crema para picaduras.

## 5. Limitaciones de esta demo

- **Lectura de WhatsApp sin validar en vivo:** se probó contra una réplica de la estructura de
  WhatsApp Web. Como WhatsApp cambia su página sin aviso, es posible que en su cuenta no lea los
  mensajes; en ese caso la ventana lo indicará y podrá pegar el mensaje. Sus comentarios aquí son clave.
- **Sin traducción completa al español:** la detección de idioma, intención y productos funciona sin IA;
  la traducción literal del mensaje llegará con Claude Haiku en la versión conectada.
- **Inventario fijo:** la importación de Excel/CSV y el dashboard llegan en las siguientes fases.
- **Riesgo aceptado:** WhatsApp restringe herramientas no oficiales; la extensión solo lee, pero
  recomendamos probar con una cuenta de prueba.

## 6. Desinstalar

En `chrome://extensions`, pulse **Quitar** en Yigora. La extensión no guarda conversaciones; solo
recuerda la posición de la ventana y si la lectura está en pausa.
