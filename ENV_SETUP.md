# 🔧 Configuración de Variables de Entorno

## Configuración Inicial

Para configurar tu entorno de desarrollo local:

### 1. Crea el archivo `.env.local`

En la raíz del proyecto (donde está `package.json`), crea un archivo llamado `.env.local`:

```bash
touch .env.local
```

### 2. Configura las variables necesarias

Abre `.env.local` y agrega estas variables:

```env
# ============================================
# FEATURE FLAGS
# ============================================

# Voice Input - Habilita/deshabilita funcionalidad de voz
# Valores: 'true' o 'false'
NEXT_PUBLIC_ENABLE_VOICE_INPUT=false
```

### 3. Reinicia el servidor

```bash
npm run dev
```

## Variables Disponibles

### `NEXT_PUBLIC_ENABLE_VOICE_INPUT`

**Descripción**: Controla toda la funcionalidad de reconocimiento de voz en la aplicación.

**Valores válidos**:
- `true` - Habilita todos los features de voz
- `false` - Deshabilita todos los features de voz (por defecto)

**Afecta a**:
- Botón de micrófono en chat
- Botón de voz en página de inicio
- Modal de instrucciones de voz
- Auto-inicio de reconocimiento de voz

**Ejemplo de uso**:
```env
# Modo desarrollo - voz deshabilitada
NEXT_PUBLIC_ENABLE_VOICE_INPUT=false

# Modo producción - voz habilitada
NEXT_PUBLIC_ENABLE_VOICE_INPUT=true
```

## Notas Importantes

1. **Prefijo requerido**: Todas las variables que necesitan estar disponibles en el cliente (browser) deben tener el prefijo `NEXT_PUBLIC_`

2. **Valores como string**: Los valores booleanos deben escribirse como strings: `'true'` o `'false'`

3. **Reinicio necesario**: Después de cambiar cualquier variable en `.env.local`, debes reiniciar el servidor de desarrollo

4. **Git ignore**: El archivo `.env.local` está en `.gitignore` y no debe subirse al repositorio

5. **Configuración por entorno**: Puedes tener diferentes valores en:
   - `.env.local` - desarrollo local
   - `.env.production` - producción
   - Variables de entorno en tu plataforma de hosting

## Troubleshooting

### La variable no funciona

- ✅ Verifica que tenga el prefijo `NEXT_PUBLIC_`
- ✅ Reinicia el servidor de desarrollo
- ✅ Verifica que el valor sea exactamente `'true'` o `'false'` (sin espacios)

### No veo el botón de voz

- ✅ Verifica que `NEXT_PUBLIC_ENABLE_VOICE_INPUT=true` en `.env.local`
- ✅ Reinicia el servidor
- ✅ Limpia la cache del navegador

---
*Ver: [VOICE_FEATURE_CONFIG.md](./VOICE_FEATURE_CONFIG.md) para más detalles sobre la configuración de voz*

