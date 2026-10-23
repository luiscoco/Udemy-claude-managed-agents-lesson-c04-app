import Anthropic from "@anthropic-ai/sdk";

export type Snapshot = { id: string; version: number; tools: unknown[]; mcp_servers: unknown[]; skills: unknown[] };
export function validate(agent: Snapshot): void {
  if (!agent.id || !Number.isInteger(agent.version) || agent.version < 1) throw new Error("Agent ID and version are required.");
  for (const field of ["tools", "mcp_servers", "skills"] as const) {
    if (!Array.isArray(agent[field]) || agent[field].length !== 0) throw new Error(`Expected an empty ${field} list.`);
  }
}
export async function createPinnedSession(client: Anthropic, agentId: string, environmentId: string) {
  const checked = await client.beta.agents.retrieve(agentId);
  validate(checked);
  const session = await client.beta.sessions.create({
    agent: { type: "agent", id: checked.id, version: checked.version },
    environment_id: environmentId,
    budget: { type: "limit", max_list_cost: { currency: "USD", amount: "50" } },
  });
  return { checked: { id: checked.id, version: checked.version, model: checked.model }, session: { id: session.id, agentId: session.agent.id, agentVersion: session.agent.version }, environmentId };
}
