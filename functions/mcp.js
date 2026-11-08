
import worker from './_mcp_core.js';

export const onRequest = async (context) => {
  return worker.fetch(context.request, context.env, context);
};
export const onRequestOptions = async () => {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-requested-with, mcp-version',
      'Access-Control-Max-Age': '86400',
    }
  });
};
