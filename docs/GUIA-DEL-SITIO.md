# Camacho Remodeling — Guía de estrategia, contenido y diseño

> Documento de referencia del sitio. Todo lo descrito aquí ya está implementado en el código; los textos finales viven en `src/build.mjs`.

---

## 1. Arquitectura de la información y navegación

### Páginas

| Página | Archivo | Objetivo de conversión | Contenido clave |
|---|---|---|---|
| **Inicio** / Home | `index.html` | Llevar a "Solicitar Presupuesto Gratis" en menos de 2 scrolls | Hero, barra de confianza, propuesta de valor, servicios, trabajos recientes, proceso de 3 pasos, "Quiénes somos", zona de servicio, preguntas frecuentes, CTA final |
| **Servicios** / Services | `services.html` | Resolver dudas por servicio y cotizar uno en concreto | 5 bloques con anclas (`#kitchens`, `#bathrooms`, `#painting`, `#flooring`, `#carpentry`); cada uno con su botón "Cotizar este servicio", que preselecciona el servicio en el formulario |
| **Galería de Proyectos** / Project Gallery | `gallery.html` | Prueba visual de calidad | Filtros por tipo, cuadrícula tipo mosaico, visor ampliado (lightbox) con gestos de deslizar, comparador Antes/Después listo |
| **Nosotros** / About Us | `about.html` | Generar confianza personal | Historia familiar, cita, 4 valores, "El Compromiso Camacho" (4 promesas) |
| **Contacto / Presupuesto Gratis** | `contact.html` | Capturar el lead | Formulario corto, llamar, WhatsApp/texto, correo, horario, mapa |

**Menú principal:** Inicio · Servicios · Galería de Proyectos · Nosotros · Contacto + botón destacado **"Presupuesto Gratis"** + selector **EN | ES**.

**Rutas de conversión:** el CTA está en el header, el hero, cada tarjeta de servicio, la sección del proceso, la franja final de cada página y la barra fija inferior en móvil (Llamar | Presupuesto Gratis).

### Paleta de colores

| Rol | Nombre | HEX | Uso |
|---|---|---|---|
| Primario oscuro | Prairie Ink | `#16222E` | Header del menú móvil, secciones oscuras, footer y texto principal. Transmite solidez. |
| Secundario | Slate | `#2B3A4A` | Enlaces del menú y textos secundarios fuertes |
| Acento / CTA | Copper | `#B45C22` | Botones, íconos y detalles. Evoca la madera y la herramienta. Contraste AA con blanco (4.7:1). |
| Acento hover | Copper Dark | `#95491A` | Estado hover de botones |
| Acento sobre oscuro | Copper Light | `#EAA56F` | Palabras destacadas e íconos sobre fondos oscuros |
| Fondo cálido | Warm Sand | `#F6F2EC` | Secciones alternas: limpieza con calidez |
| Texto secundario | Stone | `#5B6673` | Párrafos y descripciones |
| Bordes | Line | `#E4DED5` | Tarjetas y divisores |
| Base | White | `#FFFFFF` | Fondo principal |

### Tipografías (Google Fonts)

- **Manrope** (600/700/800) para títulos, botones y menú: geométrica, firme y moderna.
- **Inter** (400/500/600) para el texto: máxima legibilidad en pantalla.
- Escala fluida con `clamp()`: H1 de 38 a 70 px, H2 de 30 a 46 px y texto base de 17 px.

---

## 2. Contenido en espejo (Home)

### Sección Hero

**🇺🇸 English**
> **Eyebrow:** Family-Owned · Guymon, Oklahoma
> **H1:** Fall in Love With Your Home *Again.*
> **Subtitle:** Kitchens, bathrooms, flooring and full-home remodels for Guymon and the Oklahoma Panhandle — delivered on schedule, finished clean, and backed by our workmanship guarantee.
> **CTA:** Get My Free Estimate → · **Secondary:** See Our Work
> **Micro-copy:** Fast reply · No pressure · No obligation
> **Chips:** Free in-home estimates · Family-owned & local · Workmanship guarantee · Hablamos Español

**🇲🇽 Español**
> **Eyebrow:** Empresa Familiar · Guymon, Oklahoma
> **H1:** Vuelve a Enamorarte de tu *Casa.*
> **Subtítulo:** Cocinas, baños, pisos y remodelaciones completas en Guymon y el Panhandle de Oklahoma — entregadas a tiempo, con acabados impecables y respaldadas por nuestra garantía de mano de obra.
> **CTA:** Solicitar Presupuesto Gratis → · **Secundario:** Ver Nuestros Proyectos
> **Micro-copy:** Respuesta rápida · Sin presión · Sin compromiso
> **Chips:** Presupuestos gratis a domicilio · Empresa familiar y local · Garantía de mano de obra · We speak English

### Propuesta de valor única

**🇺🇸 English — Why Guymon Homeowners Choose Camacho**
> Remodeling is personal. You're trusting us with the place your family lives — so we treat every project as if it were our own home.
>
> - **On Time, Every Time:** We show up when we say we will, keep you updated, and finish on the schedule we agree on together.
> - **Local & Family-Owned:** We live and work in Guymon. Our family name is on every job — and our neighbors are our customers.
> - **Clean, Precise Finishes:** Straight lines, tight seams, crisp paint edges. We clean up every day so your home stays livable while we work.
> - **Guaranteed Workmanship:** Clear written estimates, no surprise charges, and a workmanship guarantee that stands behind every project.

**🇲🇽 Español — Por Qué las Familias de Guymon Eligen a Camacho**
> Remodelar es algo personal. Nos confías el lugar donde vive tu familia, por eso tratamos cada proyecto como si fuera nuestra propia casa.
>
> - **Puntuales, Siempre:** Llegamos cuando decimos, te mantenemos informado y terminamos en el plazo que acordamos juntos.
> - **Negocio Familiar y Local:** Vivimos y trabajamos en Guymon. Nuestro apellido está en cada trabajo, y nuestros vecinos son nuestros clientes.
> - **Acabados Limpios y Precisos:** Líneas rectas, uniones perfectas y bordes de pintura nítidos. Limpiamos a diario para que tu casa siga habitable mientras trabajamos.
> - **Trabajo Garantizado:** Presupuestos claros por escrito, sin cargos sorpresa y una garantía de mano de obra que respalda cada proyecto.

### Servicios principales

**🇺🇸 English — Remodeling Services Built Around Your Home**
> From a single-room refresh to a complete renovation, one trusted team handles it all.
>
> **Kitchen Remodeling:** The heart of your home, reimagined. New cabinets, countertops, islands, sinks, lighting and flooring — designed around the way your family cooks and gathers.
> ✓ Cabinets & islands ✓ Countertops & backsplash ✓ Lighting, sinks & fixtures
>
> **Bathroom Remodeling:** Turn a dated bathroom into a bright, easy-to-clean retreat. Tub and shower surrounds, vanities, mirrors, fixtures and ventilation installed with care.
> ✓ Tub & shower surrounds ✓ Vanities, mirrors & fixtures ✓ Lighting & ventilation
>
> **Whole-Home Remodeling:** Give every room a fresh start. Interior painting, durable flooring, doors, trim and lighting — coordinated by one team from start to finish.
> ✓ Interior painting ✓ Flooring: LVP & carpet ✓ Doors, trim & closets

**🇲🇽 Español — Servicios de Remodelación a la Medida de tu Hogar**
> Desde renovar una habitación hasta una remodelación completa, un solo equipo de confianza se encarga de todo.
>
> **Remodelación de Cocinas:** El corazón de tu hogar, renovado. Gabinetes, encimeras, islas, fregaderos, iluminación y pisos nuevos, diseñados según cómo cocina y convive tu familia.
> ✓ Gabinetes e islas ✓ Encimeras y salpicaderos ✓ Iluminación, fregaderos y grifería
>
> **Remodelación de Baños:** Convierte un baño anticuado en un espacio luminoso y fácil de limpiar. Bañeras, duchas, tocadores, espejos, grifería y ventilación instalados con cuidado.
> ✓ Bañeras y duchas ✓ Tocadores, espejos y grifería ✓ Iluminación y ventilación
>
> **Remodelación de Espacios Completos:** Dale un nuevo comienzo a cada habitación. Pintura interior, pisos resistentes, puertas, molduras e iluminación, coordinados por un solo equipo de principio a fin.
> ✓ Pintura interior ✓ Pisos: vinílico y alfombra ✓ Puertas, molduras y clósets

### Proceso de trabajo

**🇺🇸 English — Your Remodel in 3 Simple Steps**
> A clear process means no stress and no surprises — just a beautiful result.
>
> **1. Free Consultation:** We visit your home, listen to your goals, take measurements and talk budget — honestly, with zero pressure.
> **2. Design & Plan:** You get a clear written estimate with materials, timeline and price. We help you choose finishes that fit your style and budget.
> **3. Build:** Our crew gets to work — protecting your home, cleaning up daily and keeping you updated until the final walkthrough.
> **CTA:** Start With Step 1 — It's Free

**🇲🇽 Español — Tu Remodelación en 3 Pasos Sencillos**
> Un proceso claro significa cero estrés y cero sorpresas, solo un resultado hermoso.
>
> **1. Consulta Gratis:** Visitamos tu casa, escuchamos lo que quieres, tomamos medidas y hablamos de presupuesto con honestidad y sin presión.
> **2. Diseño y Plan:** Recibes un presupuesto claro por escrito con materiales, plazos y precio. Te ayudamos a elegir acabados según tu estilo y presupuesto.
> **3. Construcción:** Nuestro equipo se pone manos a la obra: protegemos tu casa, limpiamos a diario y te mantenemos informado hasta la revisión final.
> **CTA:** Empieza con el Paso 1 — Es Gratis

---

## 3. Pautas de diseño y experiencia de usuario (UX/UI)

### Fotos de "Antes y Después"

1. **Dónde van:**
   - **Galería → sección "Antes y Después"** (`#before-after`), justo después de la cuadrícula. Ya está construido un comparador deslizante accesible (se maneja con mouse, dedo o teclado).
   - **Inicio → "Trabajos Recientes":** cuando haya 1 o 2 pares sólidos, conviene reemplazar la foto grande del mosaico por un comparador, porque es la prueba visual que más convierte.
   - **Servicios:** en cada bloque, la foto del servicio puede cambiarse por un comparador del mismo tipo de proyecto.
2. **Cómo tomarlas:** mismo punto, misma altura (a la altura del pecho), mismo encuadre horizontal 4:3, luces encendidas y cortinas abiertas. Toma la foto del "antes" **antes de mover nada**.
3. **Reglas visuales:** etiqueta "Antes" en gris oscuro arriba a la izquierda y "Después" en cobre arriba a la derecha; el control empieza al 50 %. Usa como máximo 4 pares por página para no alargarla.
4. **Peso:** 1600 px de ancho y calidad 75–80 % (alrededor de 200–350 KB por imagen), más una versión de 800 px para móvil.

### Formulario de contacto optimizado para móvil

- **Pocos campos obligatorios:** solo nombre y teléfono. Correo, ciudad, plazo y mensaje son opcionales.
- **Teclado correcto:** `type="tel"` e `inputmode="tel"` para el teléfono, `type="email"` para el correo, más `autocomplete` (`name`, `tel`, `email` y `address-level2`) para que el teléfono los complete solo.
- **Sin zoom en iOS:** los campos usan 16 px de fuente y tienen 54 px de alto, para tocarlos fácilmente con el pulgar.
- **Selección por toque:** los servicios y la forma de contacto preferida son "píldoras" grandes en lugar de listas desplegables.
- **Una sola columna en móvil** y botón de envío a todo el ancho, con el texto de la acción: "Enviar Solicitud de Presupuesto Gratis".
- **Confianza junto al botón:** "Tu información es privada. Nunca la compartimos ni la vendemos."
- **Alternativas sin formulario:** llamar, WhatsApp o texto ("Envíanos fotos de tu espacio") y correo, justo al lado o debajo del formulario.
- **Anti-spam invisible:** un campo trampa (honeypot) oculto, sin CAPTCHA que agregue fricción.
- **Preselección:** los botones "Cotizar este servicio" envían `?service=kitchens`, etc., y el formulario marca ese servicio automáticamente.
- **Barra fija inferior en móvil** con "Llamar" y "Presupuesto Gratis". Aparece después del primer scroll para no tapar el hero.

### Selector de idioma en el menú

- **Control segmentado `EN | ES`** a la derecha del menú, **siempre visible**, también en móvil (queda fuera del menú hamburguesa, junto al botón ☰).
- El idioma activo se resalta con fondo oscuro, y `aria-pressed` lo indica a los lectores de pantalla.
- **Sin recargar la página:** el cambio es instantáneo, se guarda la preferencia y se actualizan el `lang` del documento, el título, la meta descripción, los textos alternativos de las imágenes y los placeholders.
- **Detección automática:** si el navegador está en español, el sitio se muestra en español la primera vez.
- **Enlaces compartibles:** `?lang=es` abre directamente en español, ideal para campañas en redes, WhatsApp o volantes dirigidos a la comunidad hispana.
- No uses banderas como único indicador: un idioma no es un país, y el código EN/ES es más claro.

### Otras pautas aplicadas

- Fotos reales del equipo en todo el sitio: nada de imágenes de stock.
- Las imágenes son responsivas (`srcset` 800/1600) y se cargan bajo demanda (`loading="lazy"`), excepto el hero, que se precarga.
- Contraste AA, foco visible, enlace "Saltar al contenido" y animaciones que respetan `prefers-reduced-motion`.
- El menú pasa a hamburguesa por debajo de 1140 px, porque las etiquetas en español son más largas.

### Pendientes recomendados

1. Poner el teléfono, el correo y el horario reales en `CONFIG`.
2. Conectar Formspree para recibir las solicitudes por correo.
3. Fotografiar 2 a 4 pares de Antes/Después y activar el comparador.
4. Crear el perfil de Google Business y añadir reseñas reales al sitio. No publicar reseñas inventadas.
5. Confirmar los pueblos de la zona de servicio (`CONFIG.towns`).
6. Si el negocio cuenta con licencia o seguro, agregarlo como sello de confianza (hoy no se menciona, porque no está confirmado).
