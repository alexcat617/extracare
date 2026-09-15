# Work item template (default)

Used by [features/](../features/) until [azdo-reference](./azdo-reference/) screenshots are processed and this file is updated to match your team’s Azure DevOps format.

## Feature file structure

```markdown
# FEAT-XX: Title
| ID | FEAT-XX |
| Wave | A–D |
| Status | draft | ready | building | done |
| Flows | FLOW-XX links |
| Depends on | FEAT-XX |
| Primary persona | P1 / P2 / Both — PERSONAS.md |
| Secondary persona | P1 / P2 / — |
| Flow map | ./maps/FEAT-XX-map.md |

## Outcome
## Persona lens
## User stories (tag P1 / P2)
## Requirements (REQ-XX-NN → flow trace)
## Acceptance criteria (tag primary persona)
## Out of scope
## Dependencies
## Decisions (TBD → resolved)
## Research / links
## Build handoff (read flow map first; no screen inventory)
```

## Flow map structure

See [features/maps/README.md](../features/maps/README.md). Journey **step** nodes in Mermaid—not screen names.

## ID conventions

| Prefix | Meaning |
|--------|---------|
| FEAT-XX | Build package (this repo) |
| FLOW-XX | User path ([flows/](../flows/)) |
| REQ-XX-NN | Requirement in FEAT-XX file |

## Status workflow

`draft` → resolve **Decisions** → `ready` → **build FEAT-XX** → `building` → `done`

## Traceability

- Every REQ should reference a **FLOW step** or **PRD** section.
- Flow maps link nodes → FLOW steps → REQ.
- Persona decisions live in FEAT **Decisions** and [PERSONAS.md](../PERSONAS.md).

---

*Replace this document after AzDO screenshot extraction.*
