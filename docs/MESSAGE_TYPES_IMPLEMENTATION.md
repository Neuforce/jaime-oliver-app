# Implementación de Tipos de Mensajes en jaime-oliver-app

Este documento muestra cómo están implementados los tipos de mensajes `recipes_list`, `recipe_detail`, `recipe_started`, y `task_done` en el frontend.

## Resumen

**El frontend NO envía estos tipos de mensajes directamente.** En su lugar:

- **Envía acciones** al backend: `getrecipes`, `getrecipe`, `taskdone`
- **Recibe mensajes** con estos tipos desde el backend: `recipes_list`, `recipe_detail`, `recipe_started`, `task_done`

## 1. `recipes_list` - Lista de Recetas

### Envío (Frontend → Backend)
```typescript
// jaime-oliver-app/hooks/useChatSocket.ts (línea 729-749)
const getRecipes = useCallback(() => {
  if (!isConnected || !wsRef.current) {
    setError('No active connection');
    return;
  }

  try {
    console.log('[useChatSocket] Requesting recipes from backend...');
    const out = {
      action: 'getrecipes' as const,  // ← Envía acción
      payload: ''
    };
    wsRef.current.sendJson(out);
  } catch (err) {
    // Error handling
  }
}, [isConnected]);
```

### Recepción (Backend → Frontend)
```typescript
// jaime-oliver-app/hooks/useChatSocket.ts (línea 289-318)
if (message.type === 'response' && message.messageType === 'recipes_list' && message.payload) {
  const payload = message.payload as { recipes: { workflows: RecipeWorkflow[]; count: number } };
  const timestamp = message.metadata?.timestamp || new Date().toISOString();

  if (payload.recipes && payload.recipes.workflows) {
    // Transform workflows to RecipeItem[]
    const recipes: RecipeItem[] = payload.recipes.workflows.map(transformWorkflowToRecipeItem);

    const chatMessage: ChatMessage = {
      type: 'recipeList',
      sender: 'agent',
      session_id: sessionId,
      content: `Found ${payload.recipes.count || recipes.length} recipe${payload.recipes.count !== 1 ? 's' : ''}`,
      timestamp,
      recipes,
    };

    // Add message to state
    setMessages(prev => {
      const newMessages = [...prev, chatMessage];
      saveConversationMessages(sessionId, newMessages);
      return newMessages;
    });

    // Call the onMessage callback
    optionsRef.current.onMessage?.(chatMessage);
  }
  return;
}
```

**Estado**: ✅ **Implementado** - Recibe y procesa correctamente

---

## 2. `recipe_detail` - Detalle de Receta

### Envío (Frontend → Backend)
```typescript
// jaime-oliver-app/hooks/useChatSocket.ts (línea 751-771)
const getRecipe = useCallback((workflowId: string) => {
  if (!isConnected || !wsRef.current) {
    setError('No active connection');
    return;
  }

  try {
    console.log('[useChatSocket] Requesting recipe details for workflowId:', workflowId);
    const out = {
      action: 'getrecipe' as const,  // ← Envía acción
      payload: { workflowId }
    };
    wsRef.current.sendJson(out);
  } catch (err) {
    // Error handling
  }
}, [isConnected]);
```

### Recepción (Backend → Frontend)
```typescript
// jaime-oliver-app/hooks/useChatSocket.ts (línea 320-372)
if (message.type === 'response' && message.messageType === 'recipe_detail' && message.payload) {
  const payload = message.payload as { recipe: RecipeDetail; workflowId: string };
  const timestamp = message.metadata?.timestamp || new Date().toISOString();

  if (payload.recipe) {
    // Transform recipe detail to RecipeItem with full details
    const recipeItem = transformRecipeDetailToRecipeItem(payload.recipe);

    // Update the existing recipe in the recipeList message
    setMessages(prev => prev.map(msg => {
      if (msg.type === 'recipeList' && msg.recipes) {
        // Find and update the recipe by matching workflowId
        const updatedRecipes = msg.recipes.map(recipe => {
          const recipeWithId = recipe as RecipeItem & { workflowId?: string };
          // Match by workflowId (most reliable) or by title as fallback
          if (recipeWithId.workflowId === payload.workflowId ||
              recipeWithId.workflowId === payload.recipe.id ||
              recipe.title === payload.recipe.name) {
            // Merge existing recipe with new details
            return {
              ...recipe,
              ...recipeItem,
              // Preserve workflowId for future matching
              workflowId: payload.recipe.id,
            } as RecipeItem & { workflowId?: string };
          }
          return recipe;
        });
        return { ...msg, recipes: updatedRecipes };
      }
      return msg;
    }));

    // Also create a standalone message for the recipe detail
    const chatMessage: ChatMessage = {
      type: 'recipeList',
      sender: 'agent',
      session_id: sessionId,
      content: `Recipe details for "${payload.recipe.name}"`,
      timestamp,
      recipes: [recipeItem],
    };

    // Call the onMessage callback
    optionsRef.current.onMessage?.(chatMessage);
  }
  return;
}
```

**Estado**: ✅ **Implementado** - Recibe y procesa correctamente

---

## 3. `recipe_started` - Receta Iniciada

### Envío (Frontend → Backend)
```typescript
// ❌ NO ENCONTRADO - No hay función startRecipe en useChatSocket.ts
// El tipo 'startrecipe' no está en OutgoingMessage (lib/wsClient.ts línea 9)
// Solo hay: 'sendtext' | 'sendvoice' | 'getrecipes' | 'getrecipe' | 'taskdone'
```

### Recepción (Backend → Frontend)
```typescript
// ❌ NO IMPLEMENTADO - No hay handler para recipe_started en useChatSocket.ts
// El tipo está definido en WebSocketMessage (types/chat.ts línea 163)
// pero no hay código que lo procese cuando llega del backend
```

**Estado**: ⚠️ **NO IMPLEMENTADO** - El tipo está definido pero no se envía ni se recibe

---

## 4. `task_done` - Tarea Completada

### Envío (Frontend → Backend)
```typescript
// jaime-oliver-app/hooks/useChatSocket.ts (línea 773-793)
const taskDone = useCallback((taskId: string) => {
  if (!isConnected || !wsRef.current) {
    setError('No active connection');
    return;
  }

  try {
    console.log('[useChatSocket] Marking task as done:', taskId);
    const out = {
      action: 'taskdone' as const,  // ← Envía acción
      payload: { taskId }
    };
    wsRef.current.sendJson(out);
  } catch (err) {
    // Error handling
  }
}, [isConnected]);
```

### Recepción (Backend → Frontend)
```typescript
// jaime-oliver-app/hooks/useChatSocket.ts (línea 374-426)
if (message.type === 'response' && message.messageType === 'task_done' && message.payload) {
  const payload = message.payload as TaskDonePayload;
  const timestamp = message.metadata?.timestamp || new Date().toISOString();

  if (payload.data && payload.status === 'success') {
    console.log('[useChatSocket] Task completed:', payload.taskId, 'Next tasks:', payload.data.nextTasks?.length || 0);

    // Create a status message about the task completion
    const statusMessage: ChatMessage = {
      type: 'status',
      sender: 'system',
      session_id: sessionId,
      content: `Task "${payload.data.nextTasks?.[0]?.name || payload.taskId}" completed. ${
        payload.data.nextTasks?.length 
          ? `Next: ${payload.data.nextTasks.map(t => t.name).join(', ')}` 
          : 'Recipe completed!'
      }`,
      timestamp,
    };

    // Add status message to state
    setMessages(prev => {
      const newMessages = [...prev, statusMessage];
      saveConversationMessages(sessionId, newMessages);
      return newMessages;
    });

    // Call the onMessage callback
    optionsRef.current.onMessage?.(statusMessage);

    // If there are next tasks, we could update the recipe steps or show them
    if (payload.data.nextTasks && payload.data.nextTasks.length > 0) {
      console.log('[useChatSocket] Next tasks available:', payload.data.nextTasks);
      // You might want to update the recipe steps here or trigger navigation to next step
    }
  } else if (payload.status === 'error') {
    const errorMessage: ChatMessage = {
      type: 'status',
      sender: 'system',
      session_id: sessionId,
      content: `Error completing task: ${payload.error || 'Unknown error'}`,
      timestamp,
    };
    setMessages(prev => [...prev, errorMessage]);
  }
  return;
}
```

**Estado**: ✅ **Implementado** - Recibe y procesa correctamente

---

## Tipos Definidos

```typescript
// jaime-oliver-app/types/chat.ts (línea 161-171)
export interface WebSocketMessage {
  type: 'message' | 'system' | 'status' | 'error' | 'response';
  messageType?: 'recipes_list' | 'recipe_detail' | 'recipe_started' | 'task_done' | 'text_message' | 'text';
  payload?: RecipesListPayload | RecipeDetailPayload | TaskDonePayload | any;
  messageId?: string;
  metadata?: {
    timestamp?: string;
    source?: string;
  };
  data?: ChatMessage | WorkflowMessagePayload | PushMessagePayload;
}
```

## Acciones que Envía el Frontend

```typescript
// jaime-oliver-app/lib/wsClient.ts (línea 8-11)
export type OutgoingMessage = {
  action: 'sendtext' | 'sendvoice' | 'getrecipes' | 'getrecipe' | 'taskdone';
  payload: any;
};
```

**Nota**: No hay acción `startrecipe` definida en `OutgoingMessage`.

---

## Resumen de Estado

| Tipo de Mensaje | Envío desde Frontend | Recepción en Frontend | Estado |
|----------------|---------------------|----------------------|--------|
| `recipes_list` | ❌ No (envía `getrecipes`) | ✅ Sí | ✅ Implementado |
| `recipe_detail` | ❌ No (envía `getrecipe`) | ✅ Sí | ✅ Implementado |
| `recipe_started` | ❌ No | ❌ No | ⚠️ **NO IMPLEMENTADO** |
| `task_done` | ❌ No (envía `taskdone`) | ✅ Sí | ✅ Implementado |

---

## Conclusión

**El frontend NO envía estos tipos de mensajes directamente.** El flujo es:

1. Frontend envía **acciones** (`getrecipes`, `getrecipe`, `taskdone`)
2. Backend procesa y responde con **tipos de mensaje** (`recipes_list`, `recipe_detail`, `task_done`)
3. Frontend recibe y procesa estos tipos de mensaje

**Falta implementar**:
- ❌ Envío de acción `startrecipe` 
- ❌ Recepción y procesamiento de `recipe_started`

