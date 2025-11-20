# Arquitectura de Tipos de Mensajes en jaime-oliver-app

## Visión General

La arquitectura de mensajes sigue un **patrón de separación de responsabilidades** con múltiples capas que manejan diferentes aspectos del flujo de comunicación WebSocket.

```
┌─────────────────────────────────────────────────────────────┐
│                    CAPA DE PRESENTACIÓN                     │
│  (Componentes React: RecipeAccordion, MessageBubble, etc.) │
└──────────────────────┬──────────────────────────────────────┘
                       │ Props (callbacks)
                       ↓
┌─────────────────────────────────────────────────────────────┐
│                    CAPA DE LÓGICA                           │
│              (Hook: useChatSocket)                          │
│  • Gestión de estado                                        │
│  • Transformación de datos                                  │
│  • Manejo de WebSocket                                      │
│  • Routing de mensajes                                      │
└──────────────────────┬──────────────────────────────────────┘
                       │ WebSocket API
                       ↓
┌─────────────────────────────────────────────────────────────┐
│                    CAPA DE COMUNICACIÓN                     │
│              (Cliente: WsClient)                            │
│  • Conexión WebSocket                                       │
│  • Serialización JSON                                       │
│  • Reintentos y reconexión                                  │
└──────────────────────┬──────────────────────────────────────┘
                       │ WebSocket Protocol
                       ↓
┌─────────────────────────────────────────────────────────────┐
│                    BACKEND (JOA)                           │
│  • Procesamiento de acciones                                │
│  • Respuestas tipadas                                       │
└─────────────────────────────────────────────────────────────┘
```

---

## 1. Patrón de Diseño: Strategy + Chain of Responsibility

### Strategy Pattern para Tipos de Mensaje

Cada tipo de mensaje tiene su propio **handler especializado** que procesa la respuesta del backend:

```typescript
// useChatSocket.ts - Routing de mensajes por tipo
if (message.messageType === 'recipes_list') {
  // Handler específico para recipes_list
  // Transforma workflows → RecipeItem[]
  // Actualiza estado
}

if (message.messageType === 'recipe_detail') {
  // Handler específico para recipe_detail
  // Actualiza receta existente con detalles
  // Preserva workflowId para matching
}

if (message.messageType === 'recipe_started') {
  // Handler específico para recipe_started
  // Muestra confirmación
  // Procesa datos de sesión
}

if (message.messageType === 'task_done') {
  // Handler específico para task_done
  // Muestra estado de tarea
  // Procesa próximas tareas
}
```

**Ventajas:**
- ✅ Separación clara de responsabilidades
- ✅ Fácil agregar nuevos tipos de mensaje
- ✅ Cada handler es independiente y testeable
- ✅ No hay lógica condicional compleja

---

## 2. Arquitectura en Capas

### Capa 1: Componentes de UI (Presentación)

Los componentes React son **puramente presentacionales** y no conocen detalles del WebSocket:

```typescript
// RecipeAccordion.tsx
interface RecipeAccordionProps {
  recipes: RecipeItem[];
  getRecipe?: (workflowId: string) => void;      // Callback
  startRecipe?: (workflowId: string) => void;    // Callback
  taskDone?: (taskId: string) => void;          // Callback
}

// El componente solo llama a los callbacks
const handleStartCooking = (recipeIdx: number) => {
  const recipe = recipes[recipeIdx] as RecipeItem & { workflowId?: string };
  if (recipe.workflowId && startRecipe) {
    startRecipe(recipe.workflowId);  // ← Delega al hook
  }
  // ... lógica de UI local
};
```

**Principios:**
- ✅ Componentes no conocen WebSocket
- ✅ Reciben callbacks como props
- ✅ Se enfocan solo en UI y eventos del usuario

---

### Capa 2: Hook Personalizado (Lógica de Negocio)

El hook `useChatSocket` centraliza toda la lógica de comunicación:

```typescript
// useChatSocket.ts
export const useChatSocket = (options: UseChatSocketOptions = {}) => {
  // 1. Estado interno
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WsClient | null>(null);

  // 2. Funciones de envío (acciones)
  const getRecipes = useCallback(() => {
    wsRef.current?.sendJson({
      action: 'getrecipes',
      payload: ''
    });
  }, [isConnected]);

  const startRecipe = useCallback((workflowId: string) => {
    wsRef.current?.sendJson({
      action: 'startrecipe',
      payload: { workflowId }
    });
  }, [isConnected]);

  // 3. Handler de mensajes entrantes
  wsRef.current?.on('message', (data: string) => {
    const message = JSON.parse(data) as WebSocketMessage;
    
    // Routing por messageType (Strategy Pattern)
    if (message.messageType === 'recipes_list') {
      // Procesar recipes_list
    } else if (message.messageType === 'recipe_detail') {
      // Procesar recipe_detail
    }
    // ... etc
  });

  // 4. API pública
  return {
    messages,        // Estado
    isConnected,     // Estado
    getRecipes,      // Acción
    startRecipe,     // Acción
    taskDone,        // Acción
    // ...
  };
};
```

**Responsabilidades del Hook:**
1. **Gestión de conexión WebSocket**
2. **Estado de mensajes y conexión**
3. **Transformación de datos** (Backend → Frontend)
4. **Routing de mensajes** por tipo
5. **Persistencia** (localStorage)
6. **Callbacks** para notificar cambios

---

### Capa 3: Cliente WebSocket (Comunicación)

El `WsClient` maneja la comunicación de bajo nivel:

```typescript
// wsClient.ts
export class WsClient {
  private ws: WebSocket | null = null;
  private outgoingQueue: string[] = [];

  sendJson(message: OutgoingMessage) {
    const payload = JSON.stringify(message);
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(payload);
    } else {
      this.outgoingQueue.push(payload);  // Queue si no está conectado
    }
  }

  on(event: 'message', handler: (data: string) => void) {
    this.listeners.message.push(handler);
  }
}
```

**Responsabilidades:**
- ✅ Conexión y reconexión automática
- ✅ Serialización JSON
- ✅ Queue de mensajes pendientes
- ✅ Manejo de errores de red

---

## 3. Flujo de Datos: Unidireccional

### Flujo de Envío (Frontend → Backend)

```
Usuario hace acción
  ↓
Componente llama callback (ej: startRecipe)
  ↓
Hook envía acción WebSocket (ej: { action: 'startrecipe' })
  ↓
WsClient serializa y envía
  ↓
Backend recibe y procesa
```

### Flujo de Recepción (Backend → Frontend)

```
Backend envía mensaje tipado
  ↓
WsClient recibe y emite evento 'message'
  ↓
Hook parsea y routea por messageType
  ↓
Handler específico transforma datos
  ↓
Hook actualiza estado (setMessages)
  ↓
React re-renderiza componentes
  ↓
UI muestra el resultado
```

---

## 4. Transformación de Datos

### Patrón: Adapter/Transformer

Cada tipo de mensaje tiene su propia función de transformación:

```typescript
// Transformación de workflows a RecipeItem
const transformWorkflowToRecipeItem = (workflow: RecipeWorkflow): RecipeItem & { workflowId?: string } => {
  return {
    title: workflow.name,
    duration: '',
    imageUrl: getDefaultRecipeImage(workflow.name),
    workflowId: workflow.id,  // ← Preserva ID para matching
  };
};

// Transformación de recipe detail completo
const transformRecipeDetailToRecipeItem = (recipeDetail: RecipeDetail): RecipeItem => {
  return {
    title: recipeDetail.name,
    duration: metadata.estimatedTime || '',
    ingredients: metadata.ingredientsList?.map(...),
    utensils: metadata.equipmentNeeded?.map(...),
    steps: definition.tasks?.map(...),
    // ...
  };
};
```

**Ventajas:**
- ✅ Separación entre formato backend y frontend
- ✅ Fácil cambiar estructura sin afectar componentes
- ✅ Validación y normalización centralizada

---

## 5. Manejo de Estado

### Estado Centralizado en el Hook

```typescript
const [messages, setMessages] = useState<ChatMessage[]>([]);
const [isConnected, setIsConnected] = useState(false);
const [error, setError] = useState<string | null>(null);
```

**Patrón de Actualización:**

```typescript
// Inmutabilidad: siempre crear nuevo array
setMessages(prev => {
  const newMessages = [...prev, newMessage];
  saveConversationMessages(sessionId, newMessages);  // Persistencia
  return newMessages;
});

// Actualización de item existente
setMessages(prev => prev.map(msg => {
  if (msg.type === 'recipeList' && msg.recipes) {
    return {
      ...msg,
      recipes: updatedRecipes  // ← Nuevo array de recetas
    };
  }
  return msg;
}));
```

**Principios:**
- ✅ Estado inmutable
- ✅ Single source of truth
- ✅ Persistencia automática
- ✅ React re-renderiza automáticamente

---

## 6. Matching y Actualización de Recetas

### Problema: Actualizar receta existente con detalles

Cuando llega `recipe_detail`, necesitamos encontrar y actualizar la receta correcta en la lista:

```typescript
// Estrategia de matching multi-criterio
const updatedRecipes = msg.recipes.map(recipe => {
  const recipeWithId = recipe as RecipeItem & { workflowId?: string };
  
  // 1. Match por workflowId (más confiable)
  if (recipeWithId.workflowId === payload.workflowId ||
      recipeWithId.workflowId === payload.recipe.id ||
      // 2. Fallback: match por título
      recipe.title === payload.recipe.name) {
    
    // Merge: preserva datos existentes + agrega nuevos
    return {
      ...recipe,           // Datos existentes
      ...recipeItem,       // Nuevos detalles
      workflowId: payload.recipe.id,  // Preserva ID
    };
  }
  return recipe;
});
```

**Estrategia:**
1. **Primary key**: `workflowId` (más confiable)
2. **Fallback**: Título de receta
3. **Merge**: Preserva datos existentes, agrega nuevos

---

## 7. Callbacks y Notificaciones

### Patrón: Observer/Publisher-Subscriber

El hook permite suscribirse a eventos:

```typescript
interface UseChatSocketOptions {
  onMessage?: (message: ChatMessage) => void;    // Nuevo mensaje
  onError?: (error: string) => void;             // Error
  onConnect?: () => void;                        // Conexión establecida
  onDisconnect?: () => void;                     // Desconexión
}
```

**Uso:**

```typescript
const { messages } = useChatSocket({
  onMessage: (msg) => {
    console.log('Nuevo mensaje:', msg);
    // Lógica adicional si es necesario
  },
  onError: (error) => {
    // Mostrar notificación de error
  }
});
```

**Ventajas:**
- ✅ Desacoplamiento: hook no conoce detalles de UI
- ✅ Flexibilidad: cada componente puede reaccionar diferente
- ✅ Testeable: fácil mockear callbacks

---

## 8. Persistencia de Conversaciones

### Patrón: Side Effect con useEffect

```typescript
// Guardar automáticamente cuando cambian los mensajes
useEffect(() => {
  if (sessionId && messages.length > 0) {
    saveConversation(sessionId, messages);
  }
}, [sessionId, messages]);
```

**Estrategia:**
- ✅ Guarda en localStorage
- ✅ Se ejecuta automáticamente
- ✅ No bloquea el render
- ✅ Permite recuperar conversaciones

---

## 9. Tipado TypeScript

### Type Safety en Toda la Cadena

```typescript
// Tipos de mensajes salientes
export type OutgoingMessage = {
  action: 'getrecipes' | 'getrecipe' | 'startrecipe' | 'taskdone';
  payload: any;
};

// Tipos de mensajes entrantes
export interface WebSocketMessage {
  type: 'response';
  messageType?: 'recipes_list' | 'recipe_detail' | 'recipe_started' | 'task_done';
  payload?: RecipesListPayload | RecipeDetailPayload | TaskDonePayload;
}

// Tipos de datos transformados
export interface RecipeItem {
  title: string;
  duration: string;
  ingredients?: Ingredient[];
  // ...
}
```

**Ventajas:**
- ✅ Autocompletado en IDE
- ✅ Detección de errores en compile-time
- ✅ Documentación implícita
- ✅ Refactoring seguro

---

## 10. Manejo de Errores

### Estrategia Multi-Nivel

```typescript
// Nivel 1: Error de conexión
wsRef.current?.on('error', (error) => {
  setError('Connection error');
  optionsRef.current.onError?.(error);
});

// Nivel 2: Error en mensaje específico
if (payload.status === 'error') {
  const errorMessage: ChatMessage = {
    type: 'status',
    sender: 'system',
    content: `Error: ${payload.error}`,
  };
  setMessages(prev => [...prev, errorMessage]);
  optionsRef.current.onError?.(payload.error);
}

// Nivel 3: Try-catch en funciones de envío
const startRecipe = useCallback((workflowId: string) => {
  try {
    wsRef.current?.sendJson({ action: 'startrecipe', payload: { workflowId } });
  } catch (err) {
    setError('Error starting recipe');
    optionsRef.current.onError?.('Error starting recipe');
  }
}, [isConnected]);
```

---

## 11. Diagrama de Secuencia Completo

```
Usuario          Componente          Hook              WsClient         Backend
  │                  │                │                  │               │
  │ click "Start"     │                │                  │               │
  ├──────────────────>│                │                  │               │
  │                  │ startRecipe()  │                  │               │
  │                  ├───────────────>│                  │               │
  │                  │                │ sendJson()       │               │
  │                  │                ├─────────────────>│               │
  │                  │                │                  │ WebSocket     │
  │                  │                │                  ├──────────────>│
  │                  │                │                  │               │ Procesa
  │                  │                │                  │               │
  │                  │                │                  │<──────────────┤
  │                  │                │                  │ recipe_started │
  │                  │                │                  │               │
  │                  │                │ on('message')     │               │
  │                  │                │<─────────────────┤               │
  │                  │                │                  │               │
  │                  │                │ Handler          │               │
  │                  │                │ recipe_started   │               │
  │                  │                │                  │               │
  │                  │                │ setMessages()    │               │
  │                  │                │                  │               │
  │                  │                │ onMessage()      │               │
  │                  │<───────────────┤                  │               │
  │                  │                │                  │               │
  │<─────────────────┤                │                  │               │
  │ Re-render        │                │                  │               │
  │                  │                │                  │               │
```

---

## 12. Principios de Diseño Aplicados

### SOLID

- **Single Responsibility**: Cada handler maneja un solo tipo de mensaje
- **Open/Closed**: Fácil agregar nuevos tipos sin modificar existentes
- **Dependency Inversion**: Componentes dependen de abstracciones (callbacks), no de implementación

### Clean Architecture

- **Separación de capas**: UI → Lógica → Comunicación
- **Independencia de frameworks**: Lógica no depende de React directamente
- **Testabilidad**: Cada capa es testeable independientemente

### React Best Practices

- **Hooks personalizados**: Encapsula lógica compleja
- **useCallback**: Previene re-renders innecesarios
- **useRef**: Mantiene referencias estables
- **Estado inmutable**: Facilita React DevTools y debugging

---

## Resumen de Ventajas de la Arquitectura

1. ✅ **Escalabilidad**: Fácil agregar nuevos tipos de mensaje
2. ✅ **Mantenibilidad**: Código organizado y separado por responsabilidades
3. ✅ **Testabilidad**: Cada capa es testeable independientemente
4. ✅ **Type Safety**: TypeScript previene errores en compile-time
5. ✅ **Performance**: Re-renders optimizados con useCallback
6. ✅ **UX**: Persistencia automática, manejo de errores robusto
7. ✅ **Debugging**: Logs claros, estado visible en DevTools

Esta arquitectura permite que el sistema crezca de manera ordenada y mantenible.

