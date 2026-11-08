#!/usr/bin/env node

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import http from 'http';
import { z } from 'zod';

import { drawStick, getFortunePools } from './tools/fortune';
import { divineLiuyao, interpretLiuyao, lookupHexagram } from './tools/liuyao';
import { getAllHexagrams } from '../utils/hexagram';
import { FORTUNE_SYSTEM_PROMPT } from './prompts/index';

export function createDivinationMcpServer() {
  const server = new McpServer({
    name: 'xiaoguatan-divination',
    version: '1.1.0',
    description: '小卦摊命理排盘与占卜服务 - 提供专业周易六爻纳甲排盘、一键复制AI解卦Prompt、多轮追问对话与灵签抽签能力'
  });

  // ==========================================
  // 1. 抽签相关工具 (Fortune Tools)
  // ==========================================

  server.tool(
    'draw_fortune_stick',
    '【小卦摊·摇签抽签】从指定签池中随机求取一支灵签，获得签文、吉凶等第、传统诗曰与摊主大白话解签指导。',
    {
      pool_id: z.enum(['today-fortune', 'lunch-decider', 'action-decision'])
        .optional()
        .describe('签池类型：today-fortune（今日运势签，默认）、lunch-decider（午餐吃什么）、action-decision（行止决策签）'),
      question: z.string().optional().describe('求问事项或心中所虑之事（选填）')
    },
    async ({ pool_id, question }) => {
      try {
        const result = drawStick(pool_id, question);
        return {
          content: [
            {
              type: 'text',
              text: result.formattedText
            },
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
      } catch (err: any) {
        return {
          isError: true,
          content: [{ type: 'text', text: `抽签失败: ${err.message || String(err)}` }]
        };
      }
    }
  );

  server.tool(
    'list_fortune_pools',
    '【小卦摊·签池列表】查询当前小卦摊支持的所有签池种类、包含签数与适用场景。',
    {},
    async () => {
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
  );

  // ==========================================
  // 2. 六爻相关工具 (Liuyao Tools)
  // ==========================================

  server.tool(
    'cast_liuyao',
    '【小卦摊·六爻起卦排盘】周易六爻专业纳甲排盘工具。生成年月日时四柱干支、日旬空亡、本宫五行、六亲六神、世应、动变生克及原典卦爻辞，并直接生成网页同款【一键复制给 AI 的完整解卦 Prompt】。',
    {
      question: z.string().describe('求测的具体事项，例如：“今年换工作顺利吗”、“某合作项目进展如何”'),
      lines: z.array(z.number().int().min(6).max(9))
        .length(6)
        .optional()
        .describe('手动指定6个爻值（自初爻至上爻依次排列，6=老阴动爻, 7=少阳静爻, 8=少阴静爻, 9=老阳动爻）。若不填则自动模拟正统铜钱抛掷起卦。'),
      timestamp: z.number().optional().describe('起卦时间戳（毫秒数，默认当前时间）'),
      additional_context: z.string().optional().describe('求测者补充的个人背景、现状或特定疑虑')
    },
    async ({ question, lines, timestamp, additional_context }) => {
      try {
        const result = divineLiuyao(question, lines, timestamp, additional_context);
        return {
          content: [
            {
              type: 'text',
              text: result.markdownChart
            },
            {
              type: 'text',
              text: `\n---\n${result.interpretationGuide}`
            },
            {
              type: 'text',
              text: `\n---\n### 小卦摊·一键复制给 AI 的完整解卦提示词 (Prompt)\n\n\`\`\`markdown\n${result.aiPrompt.copyText}\n\`\`\`\n`
            },
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
      } catch (err: any) {
        return {
          isError: true,
          content: [{ type: 'text', text: `六爻排盘失败: ${err.message || String(err)}` }]
        };
      }
    }
  );

  server.tool(
    'interpret_liuyao',
    '【小卦摊·六爻智能解析与多轮追问对话】基于小卦摊标准 AI 解卦 System Prompt 与六爻排盘数据进行深度解读。支持多轮对话：传入上轮的 lines 和 timestamp，并在 additional_context 中传入用户的最新反馈或深入追问，即可连续展开多轮有深度的易理对话。',
    {
      question: z.string().describe('求测事项（例如：“问下半年合作项目能否顺利推进”）'),
      lines: z.array(z.number().int().min(6).max(9))
        .length(6)
        .optional()
        .describe('六爻爻值数组（初爻至上爻）。在多轮对话追问时，请传入上一轮起卦的 lines 以维持同一盘面！若不传则重新起卦。'),
      timestamp: z.number().optional().describe('起卦时间戳（毫秒数）。多轮对话时请传入同一时间戳以锁定四柱干支与日旬空亡！'),
      additional_context: z.string().optional().describe('用户进一步的补充背景、追问或对上一轮解卦的回答（例如：“对方目前资金遇到了一点小困难，但表示下个月可以到位，这会影响结果吗？”）'),
      execute_ai: z.boolean().optional().describe('是否尝试调用后台已配置的大模型接口（默认 true；若未配置 API Key 则自动提供完整解卦 Prompt 由当前 AI 客户端解析）')
    },
    async ({ question, lines, timestamp, additional_context, execute_ai }) => {
      try {
        const res = await interpretLiuyao(question, lines, timestamp, additional_context, execute_ai ?? true);
        const { divination, aiInterpretation, copyPromptText, source } = res;

        const contents: any[] = [];

        // 1. 如果成功调用后台大模型，输出大模型的完整解析
        if (source === 'ai_engine' && aiInterpretation) {
          contents.push({
            type: 'text',
            text: `### 【小卦摊·AI解卦师解析报告】\n\n${aiInterpretation}\n`
          });
        }

        // 2. 无论是否调用了后台模型，都输出当前盘面的完整 Prompt，供宿主 AI 进行精准多轮对话
        contents.push({
          type: 'text',
          text: `### 当前盘面参数与多轮对话提示词 (Prompt)\n\n> **多轮对话提示**：在后续对话追问中，带上相同的 \`lines: ${JSON.stringify(divination.lines)}\` 与 \`timestamp: ${divination.timestamp}\` 并在 \`additional_context\` 中追加提问，即可持续追问！\n\n\`\`\`markdown\n${copyPromptText}\n\`\`\`\n`
        });

        // 3. 附带结构化卦盘 JSON
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
      } catch (err: any) {
        return {
          isError: true,
          content: [{ type: 'text', text: `六爻解卦接口执行失败: ${err.message || String(err)}` }]
        };
      }
    }
  );

  server.tool(
    'get_hexagram_detail',
    '【周易六十四卦易经原典库】根据卦名（如“乾为天”或“泰”）、卦序号（1-64）或六位二进制结构（如“111111”）查询卦象详情、卦辞、彖辞、象传及初爻至上爻的完整爻辞与译文。',
    {
      query: z.string().describe('卦名（如“乾”、“天地否”）、卦序号（1-64）或6位二进制结构（如“111111”）')
    },
    async ({ query }) => {
      try {
        const hex = lookupHexagram(query);
        if (!hex) {
          return {
            isError: true,
            content: [{ type: 'text', text: `未找到符合查询条件 “${query}” 的卦象。` }]
          };
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
      } catch (err: any) {
        return {
          isError: true,
          content: [{ type: 'text', text: `查询卦象失败: ${err.message || String(err)}` }]
        };
      }
    }
  );

  // ==========================================
  // 3. MCP Prompts 模版
  // ==========================================

  server.prompt(
    'liuyao_reading',
    '引导大语言模型获取小卦摊完整的六爻排盘提示词（含摊主角色设定与六步断法），开展首轮断卦或多轮追问对话。',
    {
      question: z.string().describe('求测事项'),
      lines: z.array(z.number().int().min(6).max(9)).length(6).optional().describe('指定六爻爻值（选填）'),
      additional_context: z.string().optional().describe('补充背景或进一步追问信息（选填）')
    },
    ({ question, lines, additional_context }) => {
      const divination = divineLiuyao(question, lines, Date.now(), additional_context);
      return {
        messages: [
          {
            role: 'user',
            content: {
              type: 'text',
              text: divination.aiPrompt.copyText
            }
          }
        ]
      };
    }
  );

  server.prompt(
    'fortune_reading',
    '引导大语言模型扮演小卦摊摊主，为求问者摇签解签，提供积极生活指导。',
    {
      question: z.string().describe('求问事项'),
      pool_id: z.enum(['today-fortune', 'lunch-decider', 'action-decision']).optional().describe('签池ID')
    },
    ({ question, pool_id }) => ({
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: `${FORTUNE_SYSTEM_PROMPT}\n\n求测人心中困扰：“${question}”。请调用 \`draw_fortune_stick\` 工具（签池：${pool_id || 'today-fortune'}）抽取一支签文，并以温暖通透的大白话为求测人答疑解惑。`
          }
        }
      ]
    })
  );

  // ==========================================
  // 4. MCP Resources (静态资源)
  // ==========================================

  server.resource(
    'fortune-pools',
    'fortune://pools',
    async (uri) => ({
      contents: [
        {
          uri: uri.href,
          mimeType: 'application/json',
          text: JSON.stringify(getFortunePools(), null, 2)
        }
      ]
    })
  );

  server.resource(
    'hexagrams-all',
    'hexagram://all',
    async (uri) => {
      const all = getAllHexagrams().map((h) => ({
        id: h.id,
        name: h.name,
        unicode: h.unicode,
        structure: h.structure,
        upper: h.upper,
        lower: h.lower
      }));
      return {
        contents: [
          {
            uri: uri.href,
            mimeType: 'application/json',
            text: JSON.stringify(all, null, 2)
          }
        ]
      };
    }
  );

  return server;
}

/**
 * 启动逻辑
 */
async function main() {
  const isSSE = process.argv.includes('--sse') || process.env.MCP_TRANSPORT === 'sse';
  const mcpServer = createDivinationMcpServer();

  if (isSSE) {
    const port = Number(process.env.PORT) || 3001;
    let sseTransport: SSEServerTransport | null = null;

    const httpServer = http.createServer(async (req, res) => {
      // 跨域支持
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

      if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
      }

      if (req.url === '/sse' && req.method === 'GET') {
        sseTransport = new SSEServerTransport('/messages', res);
        await mcpServer.connect(sseTransport);
        return;
      }

      if (req.url === '/messages' && req.method === 'POST') {
        if (!sseTransport) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'SSE connection not established yet' }));
          return;
        }
        await sseTransport.handlePostMessage(req, res);
        return;
      }

      if (req.url === '/health') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'ok', server: 'xiaoguatan-divination' }));
        return;
      }

      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Not Found' }));
    });

    httpServer.listen(port, () => {
      console.error(`[小卦摊 MCP] SSE 服务已启动，监听端口: http://localhost:${port}/sse`);
    });
  } else {
    // 默认走标准输入输出 (stdio)
    const transport = new StdioServerTransport();
    await mcpServer.connect(transport);
    console.error('[小卦摊 MCP] Stdio 服务已连接，等待客户端指令...');
  }
}

// 若直接运行此文件，则执行 main
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((err) => {
    console.error('[小卦摊 MCP] 启动异常:', err);
    process.exit(1);
  });
}
