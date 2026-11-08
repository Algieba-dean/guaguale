import { drawStick, getFortunePools } from './tools/fortune';
import { divineLiuyao, interpretLiuyao, lookupHexagram } from './tools/liuyao';
import { getAllHexagrams } from '../utils/hexagram';
import { FORTUNE_SYSTEM_PROMPT } from './prompts/index';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-requested-with, mcp-version, baggage, sentry-trace',
  'Access-Control-Max-Age': '86400',
};

const TOOLS_MANIFEST = [
  {
    name: 'draw_fortune_stick',
    description: '【小卦摊·摇签抽签】从指定签池中随机求取一支灵签，获得签文、吉凶等第、传统诗曰与摊主大白话解签指导。',
    inputSchema: {
      type: 'object',
      properties: {
        pool_id: {
          type: 'string',
          enum: ['today-fortune', 'lunch-decider', 'action-decision'],
          description: '签池类型：today-fortune（今日运势签，默认）、lunch-decider（午餐吃什么）、action-decision（行止决策签）'
        },
        question: {
          type: 'string',
          description: '求问事项或心中所虑之事（选填）'
        }
      }
    }
  },
  {
    name: 'list_fortune_pools',
    description: '【小卦摊·签池列表】查询当前小卦摊支持的所有签池种类、包含签数与适用场景。',
    inputSchema: {
      type: 'object',
      properties: {}
    }
  },
  {
    name: 'cast_liuyao',
    description: '【小卦摊·六爻起卦排盘】周易六爻专业纳甲排盘工具。生成年月日时四柱干支、日旬空亡、本宫五行、六亲六神、世应、动变生克及原典卦爻辞，并直接生成网页同款【一键复制给 AI 的完整解卦 Prompt】。',
    inputSchema: {
      type: 'object',
      required: ['question'],
      properties: {
        question: {
          type: 'string',
          description: '求测的具体事项，例如：“今年换工作顺利吗”、“某合作项目进展如何”'
        },
        lines: {
          type: 'array',
          items: { type: 'integer', minimum: 6, maximum: 9 },
          minItems: 6,
          maxItems: 6,
          description: '手动指定6个爻值（初爻至上爻，6=老阴动爻, 7=少阳静爻, 8=少阴静爻, 9=老阳动爻）。若不填则自动模拟正统铜钱抛掷起卦。'
        },
        timestamp: {
          type: 'number',
          description: '起卦时间戳（毫秒数，默认当前时间）'
        },
        additional_context: {
          type: 'string',
          description: '求测者补充的个人背景、现状或特定疑虑'
        }
      }
    }
  },
  {
    name: 'interpret_liuyao',
    description: '【小卦摊·六爻智能解析与多轮追问对话】基于小卦摊标准 AI 解卦 System Prompt 与六爻排盘数据进行深度解读。支持多轮对话：传入上轮的 lines 和 timestamp，并在 additional_context 中传入用户的最新反馈或深入追问，即可连续展开多轮有深度的易理对话。',
    inputSchema: {
      type: 'object',
      required: ['question'],
      properties: {
        question: {
          type: 'string',
          description: '求测事项（例如：“问下半年合作项目能否顺利推进”）'
        },
        lines: {
          type: 'array',
          items: { type: 'integer', minimum: 6, maximum: 9 },
          minItems: 6,
          maxItems: 6,
          description: '六爻爻值数组（初爻至上爻）。在多轮对话追问时，请传入上一轮起卦的 lines 以维持同一盘面！若不传则重新起卦。'
        },
        timestamp: {
          type: 'number',
          description: '起卦时间戳（毫秒数）。多轮对话时请传入同一时间戳以锁定四柱干支与日旬空亡！'
        },
        additional_context: {
          type: 'string',
          description: '用户进一步的补充背景、追问或对上一轮解卦的回答'
        },
        execute_ai: {
          type: 'boolean',
          description: '是否尝试调用后台大模型接口（默认 true）'
        }
      }
    }
  },
  {
    name: 'get_hexagram_detail',
    description: '【小卦摊·周易六十四卦典籍】查询六十四卦中任意卦的原典卦辞、爻辞、彖辞、象辞与白话现代释义。',
    inputSchema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: '卦名（如“乾”、“坤”、“水雷屯”、“火天大有”）'
        },
        id: {
          type: 'integer',
          minimum: 1,
          maximum: 64,
          description: '周易六十四卦序号（1-64）'
        },
        structure: {
          type: 'string',
          description: '卦象二进制结构（自下而上6位，0为阴爻，1为阳爻，如“111111”为乾卦）'
        }
      }
    }
  }
];

const PROMPTS_MANIFEST = [
  {
    name: 'liuyao_reading',
    description: '小卦摊正统周易六爻断卦角色提示词（含完整 System Prompt、断法依据链路与排盘数据）',
    arguments: [
      { name: 'question', description: '求测人所问具体事项', required: true },
      { name: 'additional_context', description: '背景现状或多轮追问细节', required: false }
    ]
  },
  {
    name: 'fortune_reading',
    description: '小卦摊灵签抽签生活指导与解签提示词',
    arguments: [
      { name: 'question', description: '求签人心中所虑之事', required: true },
      { name: 'pool_id', description: '签池标识（默认 today-fortune）', required: false }
    ]
  }
];

const RESOURCES_MANIFEST = [
  {
    uri: 'fortune://pools',
    name: '小卦摊签池列表与配置',
    mimeType: 'application/json',
    description: '提供所有可用签池及详细签文列表'
  },
  {
    uri: 'hexagram://all',
    name: '周易六十四卦全卦概览',
    mimeType: 'application/json',
    description: '提供全六十四卦名称、Unicode符号与卦象结构'
  }
];

async function handleToolCall(name: string, args: any) {
  if (name === 'draw_fortune_stick') {
    const res = drawStick(args?.pool_id, args?.question);
    return {
      content: [
        {
          type: 'text',
          text: `${res.formattedText}\n\n` + '```json\n' + JSON.stringify(res, null, 2) + '\n```\n'
        }
      ]
    };
  }

  if (name === 'list_fortune_pools') {
    const pools = getFortunePools();
    return {
      content: [
        {
          type: 'text',
          text: `小卦摊当前可用签池（共 ${pools.length} 个）：\n` +
            pools.map(p => `- 【${p.name}】(${p.id})：共 ${p.totalSticks} 签。${p.description}`).join('\n') +
            '\n\n' + '```json\n' + JSON.stringify(pools, null, 2) + '\n```\n'
        }
      ]
    };
  }

  if (name === 'cast_liuyao') {
    const res = divineLiuyao(args?.question, args?.lines, args?.timestamp, args?.additional_context);
    return {
      content: [
        {
          type: 'text',
          text: `${res.markdownChart}\n\n---\n${res.interpretationGuide}\n\n---\n` +
            `### 小卦摊·一键复制给 AI 的完整解卦提示词 (Prompt)\n\n` +
            '```markdown\n' + res.aiPrompt.copyText + '\n```\n\n' +
            '```json\n' + JSON.stringify({
              question: res.question,
              datetime: res.datetime,
              timestamp: res.timestamp,
              lines: res.lines,
              ganzhi: res.ganzhi,
              mainHexagram: res.mainHexagram,
              transformedHexagram: res.transformedHexagram,
              changingLines: res.changingLines,
              linesDetail: res.linesDetail,
              hasAiPrompt: true
            }, null, 2) + '\n```\n'
        }
      ]
    };
  }

  if (name === 'interpret_liuyao') {
    const res = await interpretLiuyao(
      args?.question,
      args?.lines,
      args?.timestamp,
      args?.additional_context,
      args?.execute_ai !== false
    );
    const { divination, aiInterpretation, copyPromptText, source } = res;
    const contents: any[] = [];

    if (source === 'ai_engine' && aiInterpretation) {
      contents.push({
        type: 'text',
        text: `### 【小卦摊·AI解卦师解析报告】\n\n${aiInterpretation}\n`
      });
    }

    contents.push({
      type: 'text',
      text: `### 当前盘面参数与多轮对话提示词 (Prompt)\n\n> **多轮对话提示**：在后续对话追问中，带上相同的 \`lines: ${JSON.stringify(divination.lines)}\` 与 \`timestamp: ${divination.timestamp}\` 并在 \`additional_context\` 中追加提问，即可持续追问！\n\n` +
        '```markdown\n' + copyPromptText + '\n```\n'
    });

    contents.push({
      type: 'text',
      text: '\n```json\n' + JSON.stringify({
        question: divination.question,
        datetime: divination.datetime,
        timestamp: divination.timestamp,
        lines: divination.lines,
        mainHexagram: divination.mainHexagram.name,
        transformedHexagram: divination.transformedHexagram?.name || null,
        changingLines: divination.changingLines.map(c => c.position),
        additionalContext: divination.additionalContext,
        source
      }, null, 2) + '\n```\n'
    });

    return { content: contents };
  }

  if (name === 'get_hexagram_detail') {
    const query = String(args?.query || args?.name || args?.id || args?.structure || '');
    const res = lookupHexagram(query);
    if (!res) {
      return {
        content: [{ type: 'text', text: `未找到符合条件的卦象信息: ${query}` }],
        isError: true
      };
    }
    const linesText = res.lines?.map((l: any) => `* **第${l.position}爻**：${l.original}：${l.translation}`).join('\n') || '无';
    const text = [
      `### 周易第 ${res.id} 卦：${res.name}卦 (${res.unicode || ''})`,
      `* 卦名：${res.name}`,
      `* 结构：${res.structure} (下卦：${res.lower}，上卦：${res.upper})`,
      `* 卦辞：${res.judgment?.original || '无'}`,
      `* 卦辞释义：${res.judgment?.translation || '无'}`,
      `* 爻辞：\n${linesText}`
    ].join('\n');

    return {
      content: [
        {
          type: 'text',
          text: `${text}\n\n` + '```json\n' + JSON.stringify(res, null, 2) + '\n```\n'
        }
      ]
    };
  }

  throw new Error(`未知工具: ${name}`);
}

async function handleRpc(body: any): Promise<any> {
  const { id, method, params } = body || {};

  if (method === 'initialize') {
    return {
      jsonrpc: '2.0',
      id,
      result: {
        protocolVersion: '2024-11-05',
        capabilities: {
          tools: { listChanged: false },
          prompts: { listChanged: false },
          resources: { subscribe: false, listChanged: false }
        },
        serverInfo: {
          name: 'xiaoguatan-divination',
          version: '1.1.0'
        }
      }
    };
  }

  if (method === 'notifications/initialized') {
    return null;
  }

  if (method === 'ping') {
    return { jsonrpc: '2.0', id, result: {} };
  }

  if (method === 'tools/list') {
    return {
      jsonrpc: '2.0',
      id,
      result: { tools: TOOLS_MANIFEST }
    };
  }

  if (method === 'tools/call') {
    try {
      const result = await handleToolCall(params?.name, params?.arguments);
      return { jsonrpc: '2.0', id, result };
    } catch (err: any) {
      return {
        jsonrpc: '2.0',
        id,
        error: { code: -32603, message: err.message || String(err) }
      };
    }
  }

  if (method === 'prompts/list') {
    return {
      jsonrpc: '2.0',
      id,
      result: { prompts: PROMPTS_MANIFEST }
    };
  }

  if (method === 'prompts/get') {
    const promptName = params?.name;
    const args = params?.arguments || {};
    if (promptName === 'liuyao_reading') {
      const divination = divineLiuyao(args.question, undefined, Date.now(), args.additional_context);
      return {
        jsonrpc: '2.0',
        id,
        result: {
          messages: [
            { role: 'user', content: { type: 'text', text: divination.aiPrompt.copyText } }
          ]
        }
      };
    }
    if (promptName === 'fortune_reading') {
      return {
        jsonrpc: '2.0',
        id,
        result: {
          messages: [
            {
              role: 'user',
              content: {
                type: 'text',
                text: `${FORTUNE_SYSTEM_PROMPT}\n\n求测人心中困扰：“${args.question}”。请调用 \`draw_fortune_stick\` 工具（签池：${args.pool_id || 'today-fortune'}）抽取一支签文，并以温暖通透的大白话为求测人答疑解惑。`
              }
            }
          ]
        }
      };
    }
    return {
      jsonrpc: '2.0',
      id,
      error: { code: -32601, message: `Prompt not found: ${promptName}` }
    };
  }

  if (method === 'resources/list') {
    return {
      jsonrpc: '2.0',
      id,
      result: { resources: RESOURCES_MANIFEST }
    };
  }

  if (method === 'resources/read') {
    const uri = params?.uri;
    if (uri === 'fortune://pools') {
      return {
        jsonrpc: '2.0',
        id,
        result: {
          contents: [
            { uri, mimeType: 'application/json', text: JSON.stringify(getFortunePools(), null, 2) }
          ]
        }
      };
    }
    if (uri === 'hexagram://all') {
      const all = getAllHexagrams().map(h => ({
        id: h.id, name: h.name, unicode: h.unicode, structure: h.structure, upper: h.upper, lower: h.lower
      }));
      return {
        jsonrpc: '2.0',
        id,
        result: {
          contents: [
            { uri, mimeType: 'application/json', text: JSON.stringify(all, null, 2) }
          ]
        }
      };
    }
    return {
      jsonrpc: '2.0',
      id,
      error: { code: -32602, message: `Resource not found: ${uri}` }
    };
  }

  return {
    jsonrpc: '2.0',
    id,
    error: { code: -32601, message: `Method not found: ${method}` }
  };
}

export default {
  async fetch(request: Request, env: any, _ctx: any) {
    const url = new URL(request.url);

    // 处理 OPTIONS 跨域预检
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: CORS_HEADERS
      });
    }

    // 匹配 /mcp 路由（或 /mcp/* 路径）
    if (url.pathname === '/mcp' || url.pathname.startsWith('/mcp/')) {
      if (request.method === 'GET') {
        return new Response(JSON.stringify({
          status: 'ok',
          service: 'xiaoguatan-divination',
          version: '1.1.0',
          description: '小卦摊周易六爻纳甲排盘与灵签抽签云端 MCP 接口 (Streamable HTTP)',
          endpoint: '/mcp',
          toolsCount: TOOLS_MANIFEST.length,
          promptsCount: PROMPTS_MANIFEST.length,
          timestamp: Date.now()
        }, null, 2), {
          status: 200,
          headers: {
            ...CORS_HEADERS,
            'Content-Type': 'application/json; charset=utf-8'
          }
        });
      }

      if (request.method === 'POST') {
        try {
          const body = await request.json();
          const rpcResponse = await handleRpc(body);
          if (!rpcResponse) {
            return new Response(null, { status: 204, headers: CORS_HEADERS });
          }
          return new Response(JSON.stringify(rpcResponse), {
            status: 200,
            headers: {
              ...CORS_HEADERS,
              'Content-Type': 'application/json; charset=utf-8'
            }
          });
        } catch (err: any) {
          return new Response(JSON.stringify({
            jsonrpc: '2.0',
            id: null,
            error: { code: -32700, message: `Parse error: ${err.message || String(err)}` }
          }), {
            status: 400,
            headers: {
              ...CORS_HEADERS,
              'Content-Type': 'application/json; charset=utf-8'
            }
          });
        }
      }

      return new Response('Method Not Allowed', { status: 405, headers: CORS_HEADERS });
    }

    // 非 /mcp 请求：如果是 Cloudflare Pages 环境，将请求传递给静态资源处理器 ASSETS
    if (env && env.ASSETS && typeof env.ASSETS.fetch === 'function') {
      return env.ASSETS.fetch(request);
    }

    return new Response('Not Found', { status: 404, headers: CORS_HEADERS });
  }
};
