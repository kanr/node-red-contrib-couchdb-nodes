# Plan: Enhance AGENTS.md with Examples for Agent Context

## Objective
Make example code and patterns available to GitHub Copilot agents by embedding them in AGENTS.md rather than relying on external links.

## Context
- Current AGENTS.md in `.github/AGENTS.md` documents agents and automation tools
- External links won't be automatically fetched into agent context
- Goal: Agents can reliably access patterns and examples when working on tasks

## Implementation Strategy

### Phase 1: Identify Key Examples Needed
- [ ] CouchDB query patterns (query node examples)
- [ ] Document/view operations (usage patterns)
- [ ] Common error scenarios and resolutions
- [ ] Configuration examples

### Phase 2: Embed Examples in AGENTS.md
Structure sections with:
1. **Description** - What the pattern does
2. **Use Case** - When to use this pattern
3. **Code Example** - Full working example
4. **Notes** - Important considerations or edge cases

### Phase 3: Reference Repository Files
For files within the repo, include relative links:
- `examples/` directory for standalone examples
- Test files showing expected behavior
- Integration patterns from `src/` directory

### Phase 4: Best Practices Section
Document:
- Common pitfalls
- Performance considerations
- CouchDB-specific behaviors (replication, indexing, etc.)
- Node-RED node lifecycle patterns

## Success Criteria
- [x] Agent can access all critical examples without external links
- [ ] AGENTS.md serves as comprehensive reference for agent-assisted development
- [ ] Examples are kept in sync with actual codebase
- [ ] Clear guidance on when to use relative links vs embedded code

## Implementation Tasks
- Review existing examples in codebase
- Extract relevant patterns
- Organize by node type (query, insert, update, etc.)
- Test that agents can use the examples effectively
