# Política de Worktrees para GenChord

## Estado

Aprobado por el usuario el 24 de septiembre de 2026.

## Contexto

Gentle Pi 3.7.0 no crea worktrees de desarrollo automáticamente. Los worktrees internos de RDD son solo para revisión congelada y no son reutilizables para desarrollo.

OpenCode SDK 1.18.32 tiene endpoints `/experimental/worktree` (create, list, remove, reset), pero requieren un servidor OpenCode corriendo (`opencode serve`). No hay comando CLI directo.

Esta política define cuándo y cómo el orquestador crea worktrees vinculados manualmente para aislar writers paralelos.

## Cuándo crear un worktree

Crear un worktree nuevo **solo** cuando se cumplan TODAS estas condiciones:

1. Hay dos o más tareas de implementación **realmente independientes** (no tocan los mismos archivos).
2. Ambas tareas requieren escritura (no son solo lectura/exploración).
3. El usuario autorizó explícitamente el trabajo paralelo en esta feature.
4. El worktree se puede crear desde una base limpia (rama main o commit conocido).

**No crear worktree cuando:**
- Una sola tarea toca múltiples archivos (usar un solo worker).
- Las tareas dependen entre sí (secuencial, no paralelo).
- Es trabajo de exploración o verificación (background sin worktree está bien).
- La feature es pequeña (< 3 tareas o < 200 líneas estimadas).

## Convención de nombres

```
<repo-parent>/<repo-name>-worktrees/<feature-name>-<n>
```

Ejemplo:
```
C:/Users/Marco/genchord-worktrees/musical-context-1
C:/Users/Marco/genchord-worktrees/musical-context-2
```

## Procedimiento

### 1. Crear worktree

```bash
git worktree add -b <feature-name>-<n> <ruta-worktree> <base-commit>
```

Ejemplo:
```bash
git worktree add -b feat/musical-context-audio C:/Users/Marco/genchord-worktrees/musical-context-audio main
```

### 2. Registrar en la sesión

```bash
# El orquestador registra el worktree para que los subagentes puedan usarlo
session_worktree_register --path <ruta-worktree>
```

### 3. Lanzar worker aislado

```bash
# El worker recibe workspace_root apuntando al worktree registrado
subagent_run --agent gentle-ai-worker --workspace_root <ruta-worktree> ...
```

### 4. Consolidar resultados

Cuando el worker termina:

```bash
# En el worktree: commitear el trabajo
git add ...
git commit -m "..."

# En el worktree principal: cherry-pick o merge del commit
git cherry-pick <commit-del-worktree>
# o
git merge <feature-name>-<n>
```

### 5. Limpiar

```bash
# Solo después de que el usuario confirme que no necesita más el worktree
git worktree remove <ruta-worktree>
git branch -D <feature-name>-<n>
```

## Reglas de oro

- **Nunca** eliminar un worktree sin confirmación del usuario.
- **Nunca** correr writers paralelos en el mismo worktree.
- **Siempre** commitear en el worktree antes de consolidar al principal.
- **Siempre** verificar que no haya conflictos antes del cherry-pick/merge.
- **Documentar** cada worktree creado en el feature document de ODD.

## Worktrees vs Background

| Situación | ¿Worktree? | ¿Background? |
|---|---|---|
| Exploración de 4+ archivos | No | Sí |
| Verificación de tests | No | Sí |
| Implementación single-file | No | Sí (o inline) |
| Implementación multi-archivo relacionados | No | Sí (un solo worker) |
| Dos features independientes en paralelo | **Sí** | Sí |
| Revisión nativa RDD | No (interno) | No |

## Historial

- 2026-09-24: Política creada y aprobada.
