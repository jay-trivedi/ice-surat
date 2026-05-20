# Design Handoff Archive

Each `.tar.gz` here is a raw bundle from a single `claude.ai/design` handoff link.

Filename format: `<YYYY-MM-DDTHH-MM>-<handoff-id>.tar.gz`. Sort chronologically to see the evolution; the most recent one corresponds to the live site state at that commit.

Inside each tarball:
- `ice-surat/project/` — the source files at handoff time (`.jsx`, `.css`, `index.html`)
- `ice-surat/project/assets/` — logo, favicon, PDFs
- `ice-surat/project/screenshots/` — render snapshots from the design tool
- `ice-surat/project/uploads/` — user-uploaded reference material (fee sheet, seat map, logo)
- `ice-surat/chats/` — transcript of the design session that produced the bundle (if present)
- `ice-surat/README.md` — the design-tool's own handoff README

These are reference only. The hosted site builds from the top-level project files, not from this folder.
