# Feature flow maps

Visual journey paths for each build package. **Nodes are journey steps**, not screen names. Use with [FEAT specs](../) + [PERSONAS.md](../../PERSONAS.md) + [flows/FLOW-XX](../../flows/) when designing or building.

**Conventions**

- Happy path flows left-to-right or top-to-bottom in diagrams.
- Error branches labeled `err_*`.
- Cross-feature exits listed under each map and in [FEATURES.md](../../FEATURES.md).

| Map | Feature | Personas | Flow |
|-----|---------|----------|------|
| [FEAT-00-map](./FEAT-00-map.md) | Foundation | P1 + P2 | FLOW-00 |
| [FEAT-01-map](./FEAT-01-map.md) | Buy & browse | P2 | FLOW-01 |
| [FEAT-02-map](./FEAT-02-map.md) | Sell & list | P1 | FLOW-02 |
| [FEAT-03-map](./FEAT-03-map.md) | Trade | P2, P1 | FLOW-03 |
| [FEAT-04-map](./FEAT-04-map.md) | My listings | P1 | FLOW-05 |
| [FEAT-05-map](./FEAT-05-map.md) | Trust / dispute | P2, P1 | FLOW-06 |
| [FEAT-06-map](./FEAT-06-map.md) | Redeem | P2 | FLOW-07 |
| [FEAT-07-map](./FEAT-07-map.md) | Gift | P1, P2 | FLOW-04 |

**Build:** Read map → persona lens in FEAT → implement nodes using [CVS UI patterns](../../docs/cvs-app-reference/UI-PATTERNS-AND-IA.md).
