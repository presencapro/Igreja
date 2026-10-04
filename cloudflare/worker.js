async function keepSupabaseAwake(env) {
  if (!env.KEEP_ALIVE_URL) {
    throw new Error('Missing KEEP_ALIVE_URL Worker variable.');
  }
  if (!env.KEEP_ALIVE_SECRET) {
    throw new Error('Missing KEEP_ALIVE_SECRET Worker secret.');
  }

  const response = await fetch(env.KEEP_ALIVE_URL, {
    headers: {
      Authorization: `Bearer ${env.KEEP_ALIVE_SECRET}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Supabase keep-alive request failed (${response.status}).`);
  }
}

export default {
  fetch() {
    return new Response('Keep-alive Worker ativo. Execucoes via Cron Trigger.', {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  },
  scheduled(_controller, env, ctx) {
    ctx.waitUntil(keepSupabaseAwake(env));
  },
};
