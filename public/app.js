const button = document.querySelector('#run');
const status = document.querySelector('#status');
fetch('/api/config').then(r => r.json()).then(config => { status.textContent = config.configured ? 'Configuration ready. Your API key stays on the server.' : 'Add your API key and resource IDs to .env before running.'; button.disabled = !config.configured; }).catch(() => { status.textContent = 'Could not check configuration.'; button.disabled = true; });
button.addEventListener('click', async () => {
  button.disabled = true; status.textContent = 'Inspecting agent and creating session…';
  try {
    const response = await fetch('/api/session', { method: 'POST' }); const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Request failed');
    document.querySelector('#agent').textContent = data.checked.id;
    document.querySelector('#version').textContent = String(data.checked.version);
    document.querySelector('#session').textContent = data.session.id;
    document.querySelector('#sessionVersion').textContent = String(data.session.agentVersion);
    document.querySelector('#environment').textContent = data.environmentId;
    document.querySelector('#empty').hidden = true; document.querySelector('#result').hidden = false;
    const matches = data.checked.id === data.session.agentId && data.checked.version === data.session.agentVersion;
    document.querySelector('.success').textContent = matches ? '✓ The session uses the inspected base version.' : 'The session does not match the checked agent. Investigate before using it.';
    status.textContent = 'Session created.';
  } catch (error) { status.textContent = error.message; }
  finally { button.disabled = false; }
});
