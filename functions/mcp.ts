import { drawStick, getFortunePools } from '../divination-app/src/mcp/tools/fortune';
import { divineLiuyao, interpretLiuyao, lookupHexagram } from '../divination-app/src/mcp/tools/liuyao';
import { getAllHexagrams } from '../divination-app/src/utils/hexagram';
import { FORTUNE_SYSTEM_PROMPT } from '../divination-app/src/mcp/prompts/index';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-requested-with, mcp-version',
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
    description: '【周易六十四卦易经原典库】根据卦名（如“乾为天”或“泰”）、卦序号（1-64）或六位二进制结构（如“111111”）查询卦象详情、卦辞、彖辞、象传及初爻至上爻的完整爻辞与译文。',
    inputSchema: {
      type: 'object',
      required: ['query'],
      properties: {
        query: {
          type: 'string',
          description: '卦名（如“乾”、“天地否”）、卦序号（1-64）或6位二进制结构（如“111111”）'
        }
      }
    }
  }
];

const PROMPTS_MANIFEST = [
  {
    name: 'liuyao_reading',
    description: '引导大语言模型获取小卦摊完整的六爻排盘提示词（含摊主角色设定与六步断法），开展首轮断卦或多轮追问对话。',
    arguments: [
      { name: 'question', description: '求测事项', required: true },
      { name: 'additional_context', description: '补充背景或进一步追问信息', required: false }
    ]
  },
  {
    name: 'fortune_reading',
    description: '引导大语言模型扮演小卦摊摊主，为求问者摇签解签，提供积极生活指导。',
    arguments: [
      { name: 'question', description: '求问事项', required: true },
      { name: 'pool_id', description: '签池ID', required: false }
    ]
  }
];

const RESOURCES_MANIFEST = [
  {
    uri: 'fortune://pools',
    name: 'fortune-pools',
    description: '小卦摊可用签池元数据',
    mimeType: 'application/json'
  },
  {
    uri: 'hexagram://all',
    name: 'hexagrams-all',
    description: '周易六十四卦基础元数据',
    mimeType: 'application/json'
  }
];

async function handleToolCall(name: string, args: any = {}) {
  switch (name) {
    case 'draw_fortune_stick': {
      const result = drawStick(args.pool_id, args.question);
      return {
        content: [
          { type: 'text', text: result.formattedText },
          {
            type: 'text',
            text: '\n```json\n' + JSON.stringify({
              poolId: result.poolId,
              poolName: result.poolName,
              stickId: result.stick.id,
              title: result.stick.title,
              fortune: result.stick.fortune,
              poetry: result.stick.poetry,
              explanation: result.stick.explanation,
              question: result.question
            }, null, 2) + '\n```\n'
          }
        ]
      };
    }
    case 'list_fortune_pools': {
      const pools = getFortunePools();
      const text = [
        '### 小卦摊·可用签池列表',
        '',
        ...pools.map(p => `* **${p.name}** (ID: \`${p.id}\`): 共 ${p.totalSticks} 支签\n  * 说明：${p.description}`)
      ].join('\n');
      return {
        content: [
          { type: 'text', text },
          { type: 'text', text: '\n```json\n' + JSON.stringify(pools, null, 2) + '\n```\n' }
        ]
      };
    }
    case 'cast_liuyao': {
      const result = divineLiuyao(args.question, args.lines, args.timestamp, args.additional_context);
      return {
        content: [
          { type: 'text', text: result.markdownChart },
          { type: 'text', text: `\n---\n${result.interpretationGuide}` },
          { type: 'text', text: `\n---\n### 小卦摊·一键复制给 AI 的完整解卦提示词 (Prompt)\n\n\`\`\`markdown\n${result.aiPrompt.copyText}\n\`\`\`\n` },
          {
            type: 'text',
            text: '\n```json\n' + JSON.stringify({
              question: result.question,
              datetime: result.datetime,
              timestamp: result.timestamp,
              lines: result.lines,
              ganzhi: result.ganzhi,
              mainHexagram: result.mainHexagram,
              transformedHexagram: result.transformedHexagram,
              changingLines: result.changingLines,
              linesDetail: result.linesDetail,
              hasAiPrompt: true
            }, null, 2) + '\n```\n'
          }
        ]
      };
    }
    case 'interpret_liuyao': {
      const res = await interpretLiuyao(args.question, args.lines, args.timestamp, args.additional_context, args.execute_ai ?? false);
      const { divination, aiInterpretation, copyPromptText, source } = res;
      const contents: any[] = [];
      if (source === 'ai_engine' && aiInterpretation) {
        contents.push({ type: 'text', text: `### 【小卦摊·AI解卦师解析报告】\n\n${aiInterpretation}\n` });
      }
      contents.push({
        type: 'text',
        text: `### 当前盘面参数与多轮对话提示词 (Prompt)\n\n> **多轮对话提示**：在后续对话追问中，带上相同的 \`lines: ${JSON.stringify(divination.lines)}\` 与 \`timestamp: ${divination.timestamp}\` 并在 \`additional_context\` 中追加提问，即可持续追问！\n\n\`\`\`markdown\n${copyPromptText}\n\`\`\`\n`
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
    case 'get_hexagram_detail': {
      const hex = lookupHexagram(args.query);
      if (!hex) {
        throw new Error(`未找到符合查询条件 “${args.query}” 的卦象。`);
      }
      const linesText = hex.lines
        ? hex.lines.map(l => `* **第${l.position}爻**：${l.original}\n  * *译文*：${l.translation}`).join('\n')
        : '暂无爻辞';
      const text = [
        `### 【第${hex.id}卦】${hex.unicode} ${hex.name} (${hex.structure})`,
        `* **结构**：上卦 ${hex.upper}，下卦 ${hex.lower}`,
        `* **卦辞**：${hex.judgment?.original || '无'}`,
        `* **卦辞白话**：${hex.judgment?.translation || '无'}`,
        ``,
        `#### 爻辞明细`,
        linesText
      ].join('\n');
      return {
        content: [
          { type: 'text', text },
          { type: 'text', text: '\n```json\n' + JSON.stringify(hex, null, 2) + '\n```\n' }
        ]
      };
    }
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

async function handleRpc(body: any): Promise<any> {
  const { jsonrpc, id, method, params } = body;

  if (method === 'initialize') {
    return {
      jsonrpc: '2.0',
      id,
      result: {
        protocolVersion: '2024-11-05',
        capabilities: {
          tools: {},
          prompts: {},
          resources: {}
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

export const onRequestOptions = async () => {
  return new Response(null, {
    status: 204,
    headers: CORS_HEADERS
  });
};

export const onRequestGet = async () => {
  return new Response(JSON.stringify({
    status: 'ok',
    service: 'xiaoguatan-divination',
    version: '1.1.0',
    description: '小卦摊周易六爻纳甲排盘与灵签抽签云端 MCP 接口 (Streamable HTTP)',
    endpoints: {
      mcp: '/mcp'
    },
    toolsCount: TOOLS_MANIFEST.length,
    promptsCount: PROMPTS_MANIFEST.length
  }, null, 2), {
    status: 200,
    headers: {
      ...CORS_HEADERS,
      'Content-Type': 'application/json; charset=utf-8'
    }
  });
};

export const onRequestPost = async (context: any) => {
  try {
    const body = await context.request.json();
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
};
