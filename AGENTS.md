# AGENTS.md

Persistent instructions for OpenCode agents working in the ForEveryone repository.

## Session startup

1. Read `memory.md` before planning or changing code.
2. Inspect `git status` before editing so existing user work is preserved.
3. Read the relevant implementation and documentation instead of relying only on memory; code and command output are the source of truth when they disagree with `memory.md`.
4. Identify the smallest coherent scope that solves the requested outcome.

## Communication and autonomy

- Reply in the user's language, normally Spanish.
- Be concise and report the result, files changed, validation, and remaining risks.
- Proceed without unnecessary questions when repository conventions make the implementation clear.
- Ask a question only when a product decision, public contract, destructive operation, or unresolved ambiguity would materially change the result.
- Clearly distinguish pre-existing failures from failures introduced by the current change.
- Do not claim that a check passed unless it was actually run successfully.

## Repository map

- `foreveryone-frontend/`: React 19, TypeScript, Vite, React Router, Axios, and plain CSS.
- `ForEveryone - backend/ForEveryone.slnx`: .NET 10 solution.
- `ForEveryone - backend/src/BuildingBlocks/`: shared backend abstractions.
- `ForEveryone - backend/src/Services/`: Identity, Heroes, Kingdom, and Shop services.
- `.opencode/agents/`: project-specific reusable subagents.
- `readme.md`: architecture, setup, endpoints, and current project limitations.
- `memory.md`: curated durable project context; it is not a conversation transcript.

## General engineering rules

- Make focused changes and avoid unrelated formatting or refactors.
- Inspect a file before editing or replacing it; preserve user changes and existing style.
- Do not edit generated files, build output, lockfiles, or dependencies unless the task requires it.
- Do not add dependencies when the existing stack can solve the problem cleanly.
- Keep comments focused on intent and non-obvious constraints.
- Prefer typed, explicit error handling over broad `any`, unchecked casts, or ignored failures.
- Add or update tests when behavior changes and a suitable test location exists.
- Do not commit secrets, credentials, tokens, connection strings, or local machine paths.

## Frontend conventions

- Keep React components and pages in TypeScript; preserve strict typing.
- Keep API endpoint knowledge in `foreveryone-frontend/src/api/api.ts` unless the project adopts another explicit configuration approach.
- Co-locate component and page styles with their `.tsx` files. `App.css` is for application-wide theme variables, resets, and root layout only.
- Reuse a focused shared stylesheet only when multiple components genuinely share the same rules, as with `components/GameCard.css`.
- Preserve the dark-fantasy visual language and responsive behavior unless the user requests a redesign.
- Prefer router context or another existing data flow over adding duplicate props or global state.
- Run the smallest relevant validation first, then the complete frontend checks when practical.

## Backend conventions

- Preserve the service boundaries and the `Api`, `Application`, `Domain`, and `Infrastructure` separation.
- Keep HTTP concerns in API projects, business rules in Domain, orchestration in Application, and persistence/integration in Infrastructure.
- Use dependency injection and existing shared-kernel/MediatR patterns before introducing new abstractions.
- Use asynchronous APIs for I/O and explicit, safe error handling.
- Never trust a client-provided `userId` as proof of identity once authentication is enforced; derive identity from validated claims.
- Keep secrets in .NET User Secrets or the deployment secret store, never in tracked JSON or source files.

## Validation

Run checks from the directory containing the relevant project.

### Frontend

From `foreveryone-frontend/`:

```powershell
npm run lint
npm run build
```

`npm run build` runs both TypeScript project compilation and Vite. If a known baseline failure prevents full validation, still run the relevant command and report the exact existing blocker rather than weakening checks.

### Backend

From `ForEveryone - backend/`:

```powershell
dotnet restore ForEveryone.slnx
dotnet build ForEveryone.slnx --no-restore
```

Run focused tests or builds for only the affected service when that gives faster feedback, then run the solution build before finalizing broad backend changes.

## Git rules

- Inspect `git status`, the diff, and `git diff --check` before committing.
- Commit and push only when the user explicitly authorizes it.
- When authorized, include all relevant pending work, but never include unrelated secrets or accidental artifacts.
- Never force-push, rewrite published history, amend a shared commit, or change branches without explicit approval.
- After pushing, report the branch, commit hash, remote result, and whether the working tree is clean.

## Project subagents

Use the project subagents when their specialization provides clear value:

- `code-explorer`: map unfamiliar architecture, flows, and dependencies.
- `reviewer`: review non-trivial changes without editing them.
- `tester`: reproduce failures, design tests, and verify fixes.
- `documentation-writer`: maintain accurate user-facing documentation.

Prefer one specialist for a focused question. Use multiple specialists only when their tasks are genuinely independent.

## Memory maintenance

- Update `memory.md` when a task establishes or changes a durable user preference, architectural decision, current blocker, or important project state.
- Keep entries concise, factual, and easy to verify.
- Update the `Last verified` date when changing the memory.
- Do not store raw transcripts, temporary tool output, credentials, tokens, passwords, or secrets.
- Do not rewrite history merely to make old tasks look current; preserve unresolved context when it is still useful.
- Leave `memory.md` unchanged when a task adds no durable context.

## Completion criteria

Before reporting completion:

1. Review the actual diff.
2. Check for unrelated changes, generated artifacts, and accidental secrets.
3. Run the relevant validation or clearly state why it could not be run.
4. Fix regressions introduced by the change.
5. Summarize changed behavior and any remaining limitation.
