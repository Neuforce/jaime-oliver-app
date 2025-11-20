# Patrón Event Handler en useChatSocket

## Estructura: Event Handler + Message Router

### 1. El Event Handler Principal

El **event handler** es el callback que se ejecuta cuando el WebSocket recibe un mensaje:

```typescript
// useChatSocket.ts - Línea ~260
wsRef.current?.on('message', (data: string) => {
  // ← ESTE ES EL EVENT HANDLER PRINCIPAL
  
  // Parse del mensaje
  const message = parsedData as WebSocketMessage;
  
  // AQUÍ EMPIEZA EL MESSAGE ROUTER
  if (message.messageType === 'recipes_list') {
    // Handler específico
  }
  // ...
});
```

**El event handler:**
- ✅ Se registra con `wsRef.current?.on('message', ...)`
- ✅ Se ejecuta cada vez que llega un mensaje del WebSocket
- ✅ Recibe el dato crudo (string JSON)
- ✅ Parsea el mensaje
- ✅ Delega el routing a los handlers específicos

---

### 2. El Message Router (Patrón Dispatcher)

Dentro del event handler, el **routing por tipo** es un patrón de "Message Router" o "Dispatcher":

```typescript
wsRef.current?.on('message', (data: string) => {
  const message = parsedData as WebSocketMessage;
  
  // ═══════════════════════════════════════════════════
  // MESSAGE ROUTER / DISPATCHER
  // ═══════════════════════════════════════════════════
  
  if (message.messageType === 'recipes_list') {
    // Handler específico para recipes_list
  }
  
  if (message.messageType === 'recipe_detail') {
    // Handler específico para recipe_detail
  }
  
  if (message.messageType === 'recipe_started') {
    // Handler específico para recipe_started
  }
  
  if (message.messageType === 'task_done') {
    // Handler específico para task_done
  }
});
```

**El Message Router:**
- ✅ Determina qué handler ejecutar según el tipo
- ✅ Implementa el patrón **Strategy** (cada tipo tiene su estrategia)
- ✅ También puede verse como **Chain of Responsibility** (cada if es un eslabón)

---

### 3. Handlers Específicos (Message Type Handlers)

Cada bloque `if` es un **handler específico** para ese tipo de mensaje:

```typescript
// Handler específico para recipes_list
if (message.messageType === 'recipes_list' && message.payload) {
  const payload = message.payload as { recipes: { workflows: RecipeWorkflow[] } };
  
  // 1. Transformación de datos
  const recipes = payload.recipes.workflows.map(transformWorkflowToRecipeItem);
  
  // 2. Crear mensaje de chat
  const chatMessage: ChatMessage = {
    type: 'recipeList',
    sender: 'agent',
    content: `Found ${recipes.length} recipes`,
    recipes,
  };
  
  // 3. Actualizar estado
  setMessages(prev => [...prev, chatMessage]);
  
  // 4. Notificar callbacks
  optionsRef.current.onMessage?.(chatMessage);
}
```

**Cada handler específico:**
- ✅ Procesa un tipo de mensaje particular
- ✅ Transforma datos del formato backend al formato frontend
- ✅ Actualiza el estado de la aplicación
- ✅ Notifica a los callbacks (onMessage, onError, etc.)

---

## Comparación con Patrones Clásicos

### Patrón Event Handler Clásico

```typescript
// Patrón tradicional
button.addEventListener('click', (event) => {
  // Event handler
  handleClick(event);
});
```

**En nuestro caso:**
```typescript
// WebSocket event handler
wsRef.current?.on('message', (data) => {
  // Event handler principal
  const message = parseMessage(data);
  
  // Message router (dispatcher)
  routeMessage(message);
});
```

---

### Patrón Dispatcher/Message Router

```typescript
// Patrón Dispatcher clásico
class MessageDispatcher {
  private handlers: Map<string, Handler> = new Map();
  
  dispatch(message: Message) {
    const handler = this.handlers.get(message.type);
    if (handler) {
      handler.handle(message);
    }
  }
}
```

**En nuestro caso (versión simplificada):**
```typescript
// Dispatcher inline con if statements
if (message.messageType === 'recipes_list') {
  handleRecipesList(message);
} else if (message.messageType === 'recipe_detail') {
  handleRecipeDetail(message);
}
// ...
```

---

## Arquitectura Completa

```
┌─────────────────────────────────────────┐
│  WebSocket recibe mensaje               │
└──────────────┬──────────────────────────┘
               │
               ↓
┌─────────────────────────────────────────┐
│  EVENT HANDLER (callback 'message')     │
│  • Recibe data: string                  │
│  • Parsea JSON                          │
│  • Valida estructura                    │
└──────────────┬──────────────────────────┘
               │
               ↓
┌─────────────────────────────────────────┐
│  MESSAGE ROUTER / DISPATCHER            │
│  • Evalúa messageType                   │
│  • Selecciona handler apropiado         │
└──────────────┬──────────────────────────┘
               │
               ├──→ recipes_list handler
               ├──→ recipe_detail handler
               ├──→ recipe_started handler
               └──→ task_done handler
```

---

## ¿Es un Event Handler?

### Respuesta Corta: **Sí, pero con matices**

1. **Sí, es un event handler** porque:
   - ✅ Se registra como callback para el evento 'message'
   - ✅ Se ejecuta cuando ocurre el evento
   - ✅ Procesa el evento recibido

2. **Pero también es un Message Router** porque:
   - ✅ Distribuye el mensaje a handlers específicos
   - ✅ Implementa el patrón Dispatcher
   - ✅ Cada tipo de mensaje tiene su propio handler

3. **Y cada bloque if es un Message Type Handler** porque:
   - ✅ Procesa un tipo específico de mensaje
   - ✅ Implementa la lógica de negocio para ese tipo
   - ✅ Transforma y actualiza estado

---

## Nomenclatura Técnica

```typescript
// Nivel 1: Event Handler (callback del WebSocket)
wsRef.current?.on('message', (data: string) => {
  // ← EVENT HANDLER
  
  // Nivel 2: Message Router (routing por tipo)
  if (message.messageType === 'recipes_list') {
    // ← MESSAGE TYPE HANDLER (handler específico)
    
    // Nivel 3: Lógica de negocio
    const recipes = transformData(payload);
    setMessages(prev => [...prev, newMessage]);
  }
});
```

**Terminología:**
- **Event Handler**: El callback completo que maneja el evento 'message'
- **Message Router**: La lógica de if/else que distribuye por tipo
- **Message Type Handler**: Cada bloque if que procesa un tipo específico

---

## Alternativas de Implementación

### Opción 1: Actual (if statements)
```typescript
if (message.messageType === 'recipes_list') { ... }
if (message.messageType === 'recipe_detail') { ... }
```
✅ Simple y directo
✅ Fácil de leer
❌ Puede crecer mucho si hay muchos tipos

### Opción 2: Switch statement
```typescript
switch (message.messageType) {
  case 'recipes_list':
    handleRecipesList(message);
    break;
  case 'recipe_detail':
    handleRecipeDetail(message);
    break;
}
```
✅ Más estructurado
✅ Fácil agregar casos
✅ Mejor para muchos tipos

### Opción 3: Map de handlers
```typescript
const handlers = {
  'recipes_list': handleRecipesList,
  'recipe_detail': handleRecipeDetail,
  'recipe_started': handleRecipeStarted,
  'task_done': handleTaskDone,
};

const handler = handlers[message.messageType];
if (handler) {
  handler(message);
}
```
✅ Más escalable
✅ Fácil agregar nuevos tipos
✅ Separación clara de handlers
✅ Mejor para testing

---

## Recomendación

Para el código actual, **la implementación con if statements es apropiada** porque:
- ✅ Solo hay 4 tipos de mensaje
- ✅ Es simple y directo
- ✅ Fácil de entender y mantener

Si en el futuro creces a 10+ tipos, considera migrar a:
- **Switch statement** (intermedio)
- **Map de handlers** (más escalable)

---

## Resumen

**Pregunta:** ¿Es un event handler?

**Respuesta:** 
- ✅ **Sí**, el callback completo es un **Event Handler**
- ✅ Dentro hay un **Message Router** (los if statements)
- ✅ Cada bloque if es un **Message Type Handler**

**Estructura:**
```
Event Handler (callback 'message')
  └── Message Router (if statements)
      ├── Message Type Handler (recipes_list)
      ├── Message Type Handler (recipe_detail)
      ├── Message Type Handler (recipe_started)
      └── Message Type Handler (task_done)
```

