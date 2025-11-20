# 🎤 Voice Feature Configuration

## Quick Toggle

La funcionalidad de voz se controla mediante una **variable de entorno** en el archivo `.env.local`.

### Habilitar/Deshabilitar Voice Input

Edita tu archivo `.env.local` y agrega o modifica:

```env
# Para HABILITAR la funcionalidad de voz
NEXT_PUBLIC_ENABLE_VOICE_INPUT=true

# Para DESHABILITAR la funcionalidad de voz
NEXT_PUBLIC_ENABLE_VOICE_INPUT=false
```

**¡Es así de simple!** No necesitas comentar ni descomentar código.

## Reiniciar el servidor

Después de cambiar el valor en `.env.local`, reinicia el servidor de desarrollo:

```bash
npm run dev
```

## ¿Qué controla esta variable?

Cuando `NEXT_PUBLIC_ENABLE_VOICE_INPUT=true`:
- ✅ Botón de micrófono en la interfaz de chat
- ✅ Botón de voz en la página de inicio
- ✅ Modal de instrucciones de voz
- ✅ Reconocimiento de voz automático
- ✅ Auto-envío de mensajes de voz

Cuando `NEXT_PUBLIC_ENABLE_VOICE_INPUT=false`:
- ❌ Toda la funcionalidad de voz está deshabilitada
- ✅ La aplicación funciona normalmente con solo entrada de texto

## Configuración del archivo `.env.local`

Si no existe el archivo `.env.local`, créalo en la raíz del proyecto:

```bash
# Crea el archivo
touch .env.local

# Agrega la configuración
echo "NEXT_PUBLIC_ENABLE_VOICE_INPUT=false" >> .env.local
```

## Notas técnicas

- La variable **DEBE** tener el prefijo `NEXT_PUBLIC_` para estar disponible en el cliente
- El valor debe ser exactamente `'true'` (string) para habilitar la funcionalidad
- Cualquier otro valor (`'false'`, `undefined`, etc.) deshabilitará la funcionalidad
- Los cambios en `.env.local` requieren reiniciar el servidor de desarrollo

## Archivos de configuración

### `config/features.ts`
Este archivo centraliza la lectura de las variables de entorno:

```typescript
export const ENABLE_VOICE_INPUT = process.env.NEXT_PUBLIC_ENABLE_VOICE_INPUT === 'true';
```

### Archivos que usan esta configuración:
- `components/chat/ChatWindow.tsx`
- `components/chat/MessageInput.tsx`
- `app/page.tsx`

---
*Última actualización: Noviembre 20, 2025*

