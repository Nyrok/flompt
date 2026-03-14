# Projects

Projects give you **multiple independent workspaces** inside flompt. Each project has its own canvas, compiled prompt, and output state. Switch between them instantly from the header — everything is saved automatically.

---

## Creating a Project

Click the **project pill** in the center of the header. A dropdown lists all your projects.

- Click **New project** to create one
- Projects are named on creation and can be renamed inline at any time
- There is no limit on the number of projects

---

## The Default Project

When you open flompt for the first time, a **Default project** is created automatically (translated in your interface language). This project is **protected** — it cannot be deleted.

If you were using flompt before the Projects update, your previous canvas state was automatically migrated into the Default project.

---

## Auto-Save

Every change you make — adding a block, editing content, moving a node, compiling a prompt — triggers an **auto-save debounced at 1 second**. There is no manual save action.

Switching between projects also commits the current state before loading the next one. Nothing is lost.

State is stored in `localStorage` under scoped keys per project ID.

---

## Rename and Delete

In the project dropdown:

- **Click a project name** to switch to it
- **Click the pencil icon** to rename inline (press Enter to confirm)
- **Click the trash icon** to delete (confirmation required)

The Default project cannot be deleted. All other projects can be removed at any time.

---

## Export a Project

Open the project dropdown → click **Export**. A JSON file is downloaded with the full project state:

```json
{
  "id": "proj-abc123",
  "name": "Code Review",
  "nodes": [...],
  "edges": [...],
  "prompt": "<role>...</role>...",
  "output": "..."
}
```

The file is readable, diffable, and can be stored in a repository alongside your code.

---

## Import a Project

Open the project dropdown → click **Import** → select a `.json` file previously exported from flompt.

The imported project is added to your list as a new project (a new ID is generated to avoid conflicts). Your existing projects are not affected.

**Common import use cases:**
- Share a prompt workflow with a colleague (send them the JSON)
- Restore a backup after a major restructure
- Move your workspaces between machines
- Onboard a new team member with a standard baseline project

---

## Privacy

All project data lives in your browser's `localStorage`. No account is required, and nothing is sent to flompt's servers. Export files stay wherever you put them — on your machine, in a shared drive, or in a Git repository.

See [Privacy & Data Retention](./privacy.md) for more details.

---

## Roadmap

- **Project tags and search** — find any project instantly when you have dozens
- **Per-project settings** — default format, Make.com webhook URL, and response language scoped to each project
- **Ephemeral share links** — opt-in, temporary sharing without a cloud backend
- **Prompt version history** — timeline of how a prompt evolved within a project
