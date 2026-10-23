import { test } from "node:test";
import assert from "node:assert/strict";
import { validate, createPinnedSession } from "./release";
import Anthropic from "@anthropic-ai/sdk";
const base = { id: "agent_demo", version: 3, tools: [], mcp_servers: [], skills: [] };
test("rejects an agent with capabilities", () => assert.throws(() => validate({ ...base, tools: [{}] }), /tools/));
test("pins exactly the inspected version", async () => {
  let request: any;
  const client = { beta: { agents: { retrieve: async () => base }, sessions: { create: async (params: any) => { request = params; return { id: "session_demo", agent: { id: base.id, version: base.version } }; } } } } as unknown as Anthropic;
  const result = await createPinnedSession(client, base.id, "env_demo");
  assert.deepEqual(request.agent, { type: "agent", id: base.id, version: 3 });
  assert.equal(result.session.agentVersion, 3);
});
