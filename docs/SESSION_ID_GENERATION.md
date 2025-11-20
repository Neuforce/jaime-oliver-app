# Generación de Session IDs en jaime-oliver-app

## Resumen

Hay **múltiples formas** de generar session IDs en la aplicación, lo que puede causar inconsistencias. Este documento explica cada método y sus casos de uso.

---

## Métodos de Generación

### 1. **useSessionId Hook** (Método Principal - Cliente)

**Ubicación**: `hooks/useSessionId.ts`

```typescript
function getOrCreateSessionId(): string {
  if (typeof window === 'undefined') return '';
  
  const existing = localStorage.getItem('jamie_session_id');
  if (existing) {
    return existing;  // ← Reutiliza si existe
  }
  
  const created = crypto.randomUUID();  // ← Genera nuevo UUID
  localStorage.setItem('jamie_session_id', created);
  return created;
}
```

**Características:**
- ✅ Usa `crypto.randomUUID()` (API nativa del navegador)
- ✅ Persistente: se guarda en `localStorage` con key `'jamie_session_id'`
- ✅ Reutiliza el ID si ya existe (sesión persistente)
- ✅ Se usa en `useChatSocket` como fallback

**Cuándo se usa:**
- Cuando `useChatSocket` no recibe `initialSessionId`
- Como sesión persistente del usuario

---

### 2. **lib/session.ts** (Método Alternativo)

**Ubicación**: `lib/session.ts`

```typescript
import { v4 as uuidv4 } from 'uuid';

export const generateSessionId = (): string => {
  return uuidv4();  // ← Usa librería uuid
};

export const createNewSession = (): string => {
  const newSessionId = generateSessionId();
  setCurrentSessionId(newSessionId);  // Guarda en 'chat_session_id'
  return newSessionId;
};
```

**Características:**
- ✅ Usa librería `uuid` (v4)
- ✅ Guarda en `localStorage` con key `'chat_session_id'` (diferente key!)
- ✅ Siempre genera nuevo ID (no reutiliza)

**Cuándo se usa:**
- En `app/page.tsx` cuando el usuario inicia un chat nuevo
- Línea 33: `createNewSession()` antes de navegar a `/chat`

**Problema**: Usa una key diferente (`chat_session_id` vs `jamie_session_id`)

---

### 3. **Date.now() como String** (Método Temporal)

**Ubicación**: `app/chat/page.tsx` línea 60

```typescript
else if (starter) {
  // Prime a new session with the starter
  const newSessionId = `${Date.now()}`;  // ← Timestamp como string
  setInitialSessionId(newSessionId);
  // ...
}
```

**Características:**
- ⚠️ Usa `Date.now()` convertido a string
- ⚠️ No es un UUID (puede tener colisiones si se crean muy rápido)
- ⚠️ No se guarda en localStorage
- ⚠️ Solo se usa temporalmente cuando hay un `starter` query param

**Cuándo se usa:**
- Cuando el usuario viene desde la home page con un `starter` query param
- Es temporal y se reemplaza por el session ID del hook

---

### 4. **API Route** (Servidor)

**Ubicación**: `app/api/ui/session/create/route.ts`

```typescript
import { v4 as uuidv4 } from 'uuid';

export async function POST() {
  const sessionId = uuidv4();  // ← Genera en el servidor
  // ...
  return NextResponse.json({ 
    session_id: sessionId,
    // ...
  });
}
```

**Características:**
- ✅ Usa librería `uuid` (v4)
- ✅ Se genera en el servidor
- ⚠️ No parece estar siendo usado actualmente

---

## Flujo Actual de Session ID

### Escenario 1: Usuario inicia desde Home Page

```
1. Usuario hace click en botón o envía mensaje
   ↓
2. app/page.tsx → createNewSession()
   ↓
3. Genera UUID v4 → Guarda en localStorage['chat_session_id']
   ↓
4. Navega a /chat?starter=...
   ↓
5. app/chat/page.tsx → Crea temporal: Date.now()
   ↓
6. useChatSocket recibe initialSessionId = Date.now()
   ↓
7. useChatSocket también tiene useSessionId() → localStorage['jamie_session_id']
   ↓
8. Se usa: initialSessionId || persistentSessionId
   ↓
9. Resultado: Se usa Date.now() (temporal) en lugar del UUID guardado
```

**Problema**: Se genera un UUID pero luego se ignora y se usa un timestamp.

---

### Escenario 2: Usuario recarga la página en /chat

```
1. app/chat/page.tsx carga
   ↓
2. No hay conversationId ni starter en query params
   ↓
3. initialSessionId = undefined
   ↓
4. useChatSocket usa: undefined || useSessionId()
   ↓
5. useSessionId() → localStorage['jamie_session_id']
   ↓
6. Si existe, lo reutiliza
   ↓
7. Si no existe, genera crypto.randomUUID() y lo guarda
```

**Resultado**: Funciona correctamente, reutiliza sesión persistente.

---

### Escenario 3: Usuario carga conversación existente

```
1. app/chat/page.tsx → conversationId en query params
   ↓
2. setInitialSessionId(conversationId)
   ↓
3. useChatSocket usa: conversationId || useSessionId()
   ↓
4. Se usa el conversationId (correcto)
```

**Resultado**: Funciona correctamente.

---

## Problemas Identificados

### 1. **Inconsistencia en Keys de localStorage**

- `useSessionId`: usa `'jamie_session_id'`
- `lib/session.ts`: usa `'chat_session_id'`

**Impacto**: Dos sistemas diferentes que no se comunican.

---

### 2. **Date.now() en lugar de UUID**

En `app/chat/page.tsx` línea 60:
```typescript
const newSessionId = `${Date.now()}`;
```

**Problemas:**
- ⚠️ No es un UUID (formato diferente)
- ⚠️ Puede tener colisiones si se crean múltiples sesiones en el mismo milisegundo
- ⚠️ No es criptográficamente seguro
- ⚠️ Se ignora el UUID generado en `createNewSession()`

---

### 3. **Múltiples Fuentes de Verdad**

Hay 3 lugares donde se puede generar un session ID:
1. `useSessionId` hook
2. `lib/session.ts`
3. `app/chat/page.tsx` (Date.now())

**Impacto**: Confusión sobre cuál se está usando realmente.

---

## Recomendación: Unificar la Generación

### Solución Propuesta

1. **Usar solo `useSessionId` hook** como fuente única de verdad
2. **Eliminar `Date.now()`** y usar el UUID generado
3. **Unificar keys de localStorage** a una sola: `'jamie_session_id'`
4. **Opcional**: Eliminar `lib/session.ts` o hacer que use el mismo sistema

---

## Código Actual vs Recomendado

### ❌ Actual (Inconsistente)

```typescript
// app/page.tsx
createNewSession();  // Genera UUID, guarda en 'chat_session_id'

// app/chat/page.tsx
const newSessionId = `${Date.now()}`;  // Ignora el UUID anterior

// useChatSocket
const persistentSessionId = useSessionId();  // Lee de 'jamie_session_id'
const sessionId = options.initialSessionId || persistentSessionId;
```

### ✅ Recomendado (Unificado)

```typescript
// app/page.tsx
// No generar aquí, dejar que useSessionId lo maneje

// app/chat/page.tsx
// No generar aquí, usar el de useSessionId o pasar el de createNewSession

// useChatSocket
const persistentSessionId = useSessionId();  // Única fuente de verdad
const sessionId = options.initialSessionId || persistentSessionId;
```

---

## Resumen de Métodos

| Método | Ubicación | Generador | Key localStorage | Persistente | Usado |
|--------|-----------|-----------|----------------|-------------|-------|
| `useSessionId` | `hooks/useSessionId.ts` | `crypto.randomUUID()` | `jamie_session_id` | ✅ Sí | ✅ Principal |
| `createNewSession` | `lib/session.ts` | `uuid.v4()` | `chat_session_id` | ✅ Sí | ⚠️ Parcial |
| `Date.now()` | `app/chat/page.tsx` | `Date.now()` | ❌ No guarda | ❌ No | ⚠️ Temporal |
| API Route | `app/api/ui/session/create/route.ts` | `uuid.v4()` | ❌ No guarda | ❌ No | ❌ No usado |

---

## Conclusión

**Estado actual**: ✅ **UNIFICADO** - Todos los métodos ahora usan UUID v4 de forma consistente.

**Implementación unificada**:
- ✅ Todos usan la misma key: `'jamie_session_id'`
- ✅ Todos generan UUID v4 (crypto.randomUUID() o uuid library)
- ✅ `lib/session.ts` es la fuente única de verdad
- ✅ `useSessionId` hook usa las funciones de `lib/session.ts`
- ✅ `app/chat/page.tsx` usa `createNewSession()` en lugar de `Date.now()`

---

## Cambios Realizados (Unificación)

### 1. `lib/session.ts` - Actualizado
- ✅ Cambió key de `'chat_session_id'` → `'jamie_session_id'`
- ✅ Usa `crypto.randomUUID()` si está disponible, fallback a `uuid.v4()`
- ✅ Agregada función `getOrCreateSessionId()` para reutilizar IDs existentes

### 2. `useSessionId.ts` - Actualizado
- ✅ Ahora usa `getOrCreateSessionId()` de `lib/session.ts`
- ✅ Centralizado en una sola fuente de verdad

### 3. `app/chat/page.tsx` - Actualizado
- ✅ Reemplazado `Date.now()` por `createNewSession()` que genera UUID
- ✅ Usa el mismo sistema que el resto de la aplicación

---

## Flujo Unificado Actual

### Escenario 1: Usuario inicia desde Home Page

```
1. Usuario hace click en botón
   ↓
2. app/page.tsx → createNewSession()
   ↓
3. lib/session.ts → generateSessionId() → UUID v4
   ↓
4. Guarda en localStorage['jamie_session_id']
   ↓
5. Navega a /chat?starter=...
   ↓
6. app/chat/page.tsx → createNewSession() → Reutiliza o crea nuevo UUID
   ↓
7. useChatSocket → Usa initialSessionId (UUID) o useSessionId() (UUID)
   ↓
8. Resultado: UUID v4 consistente ✅
```

### Escenario 2: Usuario recarga la página

```
1. app/chat/page.tsx carga
   ↓
2. No hay initialSessionId
   ↓
3. useChatSocket → useSessionId()
   ↓
4. useSessionId → getOrCreateSessionId() de lib/session.ts
   ↓
5. Lee localStorage['jamie_session_id']
   ↓
6. Si existe, lo reutiliza ✅
   ↓
7. Si no existe, genera nuevo UUID v4 ✅
```

---

## Resumen Final

| Aspecto | Antes | Después |
|---------|-------|---------|
| **Generación** | 3 métodos diferentes | ✅ 1 método unificado (UUID v4) |
| **localStorage key** | 2 keys diferentes | ✅ 1 key: `'jamie_session_id'` |
| **Formato** | UUID, UUID, Date.now() | ✅ Solo UUID v4 |
| **Fuente única** | ❌ Múltiples | ✅ `lib/session.ts` |
| **Consistencia** | ❌ Inconsistente | ✅ Consistente |

**Estado**: ✅ **COMPLETAMENTE UNIFICADO**

