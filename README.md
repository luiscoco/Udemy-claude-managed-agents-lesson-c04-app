# C04 · Agent Versions and Safe Rollouts

Retrieves and validates a real text-only agent, then creates a session pinned to the checked version. This app does not send a prompt or implement a deployment service.

## Concepts students will learn

- Validate tools, MCP servers and skills
- Pin a checked immutable agent version
- Inspect the session release record

## Configure and run

Use Node.js 24 or later. In PowerShell, from this repository's folder:

```powershell
node --version
npm ci
Copy-Item .env.example .env
notepad .env
```

Use your own Anthropic API key and an existing agent ID and environment ID.

For the optional live path, set your API key, then run npm run setup if you do not already have resource IDs. The script creates the environment before a text-only agent, saves each ID immediately, and reuses IDs already configured. It uses CLAUDE_MODEL or the source default; choose a model available to your account. An uncertain network failure may have created a resource: inspect your account before retrying. The configured agent must have empty tools, mcp_servers and skills; validation rejects other capabilities before creating a session.

```powershell
npm start
```

Open `http://127.0.0.1:3004`. Navigation leads to `/guide.html#learning`, `/guide.html#run-guide`, `/architecture.html`, and the application lab. If you change `PORT`, use the configured port. Keep the terminal running; stop with Ctrl+C. `npm run dev` also starts the web application.

Open the lab, read the stated resource operation, and press the main Run button once. Inspect the returned IDs, configuration or events. Each live run can create a remote resource.

## Create your .env file

Copy `.env.example` to `.env` and enter your own values. Do not commit the real file. Restart the server after editing it. The example contains safe placeholders; optional settings may be left blank to use source defaults. Resource IDs and keys stay on the server.

```dotenv
ANTHROPIC_API_KEY=your_api_key
CLAUDE_MANAGED_AGENT_ID=your_agent_id
CLAUDE_MANAGED_ENVIRONMENT_ID=your_environment_id
PORT=3004
```

## How the app was build

### 1. Reject unreviewed capabilities

The snapshot must have a valid ID and positive version, with empty tools, MCP servers and skills. Any unexpected capability stops the flow before a session is created.

Source: [src/release.ts](src/release.ts#L4)

```typescript
export function validate(agent: Snapshot): void {
  if (!agent.id || !Number.isInteger(agent.version) || agent.version < 1)
    throw new Error("Agent ID and version are required.");
  for (const field of ["tools", "mcp_servers", "skills"] as const) {
    if (!Array.isArray(agent[field]) || agent[field].length !== 0)
      throw new Error(`Expected an empty ${field} list.`);
  }
}
```

### 2. Pin the exact version that passed validation

The host retrieves a snapshot, validates it, and references checked.id plus checked.version in session creation. It does not ask for an unspecified latest version after the check.

Source: [src/release.ts](src/release.ts#L11) · selected statements

```typescript
const checked = await client.beta.agents.retrieve(agentId);

// ... other source statements omitted ...
validate(checked);

// ... other source statements omitted ...
const session = await client.beta.sessions.create({
  agent: { type: "agent", id: checked.id, version: checked.version },
  environment_id: environmentId,
  budget: { type: "limit", max_list_cost: { currency: "USD", amount: "50" } },
});
```

### 3. Compare the session release record

The result returns both checked and resolved session versions so the UI can compare them. The sample creates a session; it does not send a model prompt or deploy an agent service.

Source: [src/release.ts](src/release.ts#L18)

```typescript
return {
  checked: { id: checked.id, version: checked.version, model: checked.model },
  session: {
    id: session.id,
    agentId: session.agent.id,
    agentVersion: session.agent.version,
  },
  environmentId,
};
```

## Validation

```powershell
npm test
python scripts/verify-walkthrough.py
```

The source hash check detects when walkthrough excerpts need refreshing. Browser verification covers page navigation, readable text, mobile layout, dark mode, diagram and image routes. Local scenarios and live provider calls are recorded separately in the workspace verification report; local success is not evidence of a live provider operation.

## Repository contents

Application sources, student web pages, safe configuration example and documentation images are included. `node_modules`, `presentation`, `output`, `reviewed`, `v3`, `teaching-material`, build output, local journals, credentials and local resource files are ignored. Existing teaching videos and presentations remain in the original workspace.
