import { serveStudentAsset } from "./student-assets";
import http from "node:http";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { existsSync } from "node:fs";
import Anthropic from "@anthropic-ai/sdk";
import { createPinnedSession } from "./release";

if (existsSync(".env")) process.loadEnvFile(".env");
const port = Number(process.env.PORT || 3004);
const agentId = process.env.CLAUDE_MANAGED_AGENT_ID || "";
const environmentId = process.env.CLAUDE_MANAGED_ENVIRONMENT_ID || "";
const apiKey = process.env.ANTHROPIC_API_KEY || "";
const configured = [agentId, environmentId, apiKey].every(v => v && !v.startsWith("your_"));
const server = http.createServer(async (req, res) => {
  res.setHeader("Cache-Control", "no-store");
  try {
    if (await serveStudentAsset(req, res)) return;
    if (req.method === "GET" && req.url === "/api/config") {
      res.writeHead(200, { "Content-Type": "application/json" }); res.end(JSON.stringify({ configured })); return;
    }
    if (req.method === "POST" && req.url === "/api/session") {
      if (req.headers.origin && req.headers.origin !== `http://127.0.0.1:${port}` && req.headers.origin !== `http://localhost:${port}`) { res.writeHead(403); res.end(); return; }
      if (!configured) throw new Error("Configure the API key, agent ID and environment ID in .env.");
      const result = await createPinnedSession(new Anthropic({ apiKey }), agentId, environmentId);
      res.writeHead(200, { "Content-Type": "application/json" }); res.end(JSON.stringify(result)); return;
    }
    const files: Record<string, string> = { "/": "index.html", "/style.css": "style.css", "/app.js": "app.js", "/astronaut.png": "astronaut.png" };
    if (req.method === "GET" && req.url && files[req.url]) {
      const file = files[req.url]; const content = await readFile(path.join(__dirname, "..", "public", file));
      res.writeHead(200, { "Content-Type": file.endsWith(".png") ? "image/png" : file.endsWith(".css") ? "text/css" : file.endsWith(".js") ? "text/javascript" : "text/html; charset=utf-8" }); res.end(content); return;
    }
    res.writeHead(404); res.end("Not found");
  } catch (error) {
    res.writeHead(500, { "Content-Type": "application/json" }); res.end(JSON.stringify({ error: error instanceof Error ? error.message : "Request failed" }));
  }
});
server.listen(port, "127.0.0.1", () => console.log(`Open http://127.0.0.1:${port}`));

