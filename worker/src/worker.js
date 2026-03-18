export default {
  async fetch(request, env) {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: corsHeaders(env),
      });
    }

    if (request.method !== 'POST') {
      return jsonResponse({ error: 'Method not allowed' }, 405, env);
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return jsonResponse({ error: 'Invalid JSON' }, 400, env);
    }

    // Validate and sanitize input
    const name = String(body.name || '')
      .replace(/[^a-zA-Z0-9 _\-]/g, '')
      .trim()
      .slice(0, 30);
    const score = Math.max(0, Math.min(9999, parseInt(body.score, 10) || 0));
    const streak = Math.max(0, Math.min(9999, parseInt(body.streak, 10) || 0));
    const accuracy = Math.max(0, Math.min(100, parseInt(body.accuracy, 10) || 0));

    if (!name || score <= 0) {
      return jsonResponse({ error: 'Invalid data: name and score > 0 required' }, 400, env);
    }

    // Trigger GitHub repository_dispatch
    const ghResponse = await fetch(
      'https://api.github.com/repos/taka328/Developers/dispatches',
      {
        method: 'POST',
        headers: {
          Accept: 'application/vnd.github.v3+json',
          Authorization: `token ${env.GITHUB_PAT}`,
          'User-Agent': 'dev-leaderboard-worker',
        },
        body: JSON.stringify({
          event_type: 'update-leaderboard',
          client_payload: { name, score, streak, accuracy },
        }),
      }
    );

    if (ghResponse.status === 204) {
      return jsonResponse({ ok: true }, 200, env);
    }

    return jsonResponse(
      { error: 'GitHub API error', status: ghResponse.status },
      502,
      env
    );
  },
};

function corsHeaders(env) {
  // In production, lock this down to your GitHub Pages origin
  const origin = env.ALLOWED_ORIGIN || 'https://taka328.github.io';
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
  };
}

function jsonResponse(data, status, env) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders(env),
    },
  });
}
