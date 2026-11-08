import React, { useState } from 'react';

interface McpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const McpModal: React.FC<McpModalProps> = ({ isOpen, onClose }) => {
  const [copiedType, setCopiedType] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'claude' | 'cursor' | 'antigravity'>('antigravity');
  const [deployMode, setDeployMode] = useState<'local' | 'cloud'>('local');

  if (!isOpen) return null;

  // 云端配置 (Streamable HTTP 官方规范)
  const cloudEndpoint = 'https://xgt.algieba12.cn/mcp';

  const cloudConfigs = {
    antigravity: JSON.stringify({
      mcpServers: {
        "xiaoguatan": {
          "url": cloudEndpoint
        }
      }
    }, null, 2),
    cursor: JSON.stringify({
      mcpServers: {
        "xiaoguatan": {
          "url": cloudEndpoint
        }
      }
    }, null, 2),
    claude: JSON.stringify({
      mcpServers: {
        "xiaoguatan": {
          "command": "npx",
          "args": ["-y", "mcp-remote", cloudEndpoint]
        }
      }
    }, null, 2)
  };

  // 本地配置
  const localConfigs = {
    antigravity: JSON.stringify({
      mcpServers: {
        "xiaoguatan": {
          "command": "node",
          "args": ["/Users/mac/web/zhanbo/mcp-server.mjs"]
        }
      }
    }, null, 2),
    cursor: JSON.stringify({
      mcpServers: {
        "xiaoguatan": {
          "command": "node",
          "args": ["/Users/mac/web/zhanbo/mcp-server.mjs"]
        }
      }
    }, null, 2),
    claude: JSON.stringify({
      mcpServers: {
        "xiaoguatan": {
          "command": "node",
          "args": ["/Users/mac/web/zhanbo/mcp-server.mjs"]
        }
      }
    }, null, 2)
  };

  const currentConfig = deployMode === 'local'
    ? localConfigs[activeTab]
    : cloudConfigs[activeTab];

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 backdrop-blur-sm animate-fade-in">
      <div 
        className="relative w-full max-w-2xl bg-cream border border-gold/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-cream-light/50">
          <div className="flex items-center gap-2.5">
            <svg className="w-5 h-5 text-gold" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="10" cy="10" r="8" />
              <path d="M10 2 A4 4 0 0 0 10 10 A4 4 0 0 1 10 18" />
              <circle cx="10" cy="6" r="1" fill="currentColor" />
              <circle cx="10" cy="14" r="1" fill="currentColor" />
            </svg>
            <div>
              <h3 className="font-serif text-lg font-medium text-ink">小卦摊 MCP 协议接口</h3>
              <p className="text-xs text-muted">标准 Model Context Protocol 支持，为 AI 助手接入摇签抽签与六爻排盘</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-muted hover:text-ink hover:border-gold/40 transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-ink font-sans">
          {/* 部署模式切换 */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-gold-tint/30 border border-gold/20">
            <div>
              <span className="font-serif font-medium text-ink text-sm">运行模式</span>
              <p className="text-xs text-muted">
                {deployMode === 'local' 
                  ? '本地模式（推荐）：在本地环境直接运行 Node 脚本，离线稳定可用' 
                  : '云端模式：连接云端服务'}
              </p>
            </div>
            <div className="flex gap-1 p-1 bg-cream rounded-lg border border-border">
              <button
                onClick={() => setDeployMode('local')}
                className={`px-3 py-1 rounded text-xs transition-colors ${
                  deployMode === 'local' ? 'bg-gold text-cream font-medium' : 'text-muted hover:text-ink'
                }`}
              >
                本地 (Stdio)
              </button>
              <button
                onClick={() => setDeployMode('cloud')}
                className={`px-3 py-1 rounded text-xs transition-colors ${
                  deployMode === 'cloud' ? 'bg-gold text-cream font-medium' : 'text-muted hover:text-ink'
                }`}
              >
                云端 (HTTPS)
              </button>
            </div>
          </div>

          {/* 能力简介 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl border border-gold/20 bg-gold-tint/40 space-y-1.5">
              <div className="flex items-center gap-2 font-medium text-gold font-serif">
                <span>灵签抽签 (draw_fortune_stick)</span>
              </div>
              <p className="text-xs text-muted leading-relaxed">
                支持今日运势签、午餐决定签、行止快速决策等多种签池。自动生成吉凶、传统诗曰及通俗白话解签指导。
              </p>
            </div>

            <div className="p-3.5 rounded-xl border border-gold/20 bg-gold-tint/40 space-y-1.5">
              <div className="flex items-center gap-2 font-medium text-gold font-serif">
                <span>六爻纳甲排盘与解析 (cast_liuyao / interpret_liuyao)</span>
              </div>
              <p className="text-xs text-muted leading-relaxed">
                正统铜钱三掷起卦，推演四柱干支、世应六亲六神与动变生克，支持带上下文的多轮连续深入追问！
              </p>
            </div>
          </div>

          {/* 客户端配置选择器 */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-medium text-xs tracking-wider text-muted uppercase">选择客户端配置</span>
              <div className="flex gap-1.5 p-1 bg-cream-light rounded-lg border border-border">
                <button
                  onClick={() => setActiveTab('antigravity')}
                  className={`px-3 py-1 rounded-md text-xs transition-colors ${
                    activeTab === 'antigravity' ? 'bg-gold text-cream font-medium' : 'text-muted hover:text-ink'
                  }`}
                >
                  Antigravity
                </button>
                <button
                  onClick={() => setActiveTab('cursor')}
                  className={`px-3 py-1 rounded-md text-xs transition-colors ${
                    activeTab === 'cursor' ? 'bg-gold text-cream font-medium' : 'text-muted hover:text-ink'
                  }`}
                >
                  Cursor
                </button>
                <button
                  onClick={() => setActiveTab('claude')}
                  className={`px-3 py-1 rounded-md text-xs transition-colors ${
                    activeTab === 'claude' ? 'bg-gold text-cream font-medium' : 'text-muted hover:text-ink'
                  }`}
                >
                  Claude Desktop
                </button>
              </div>
            </div>

            {/* 配置文件位置说明 */}
            <p className="text-xs text-muted">
              {activeTab === 'antigravity' && (
                <>在 Antigravity 的 <code className="text-gold bg-cream-light px-1.5 py-0.5 rounded">mcp_config.json</code> 中追加配置（支持 Streamable HTTP 原生直连）</>
              )}
              {activeTab === 'cursor' && (
                <>在 Cursor 设置中的 <strong>MCP Servers</strong> 添加或配置 <code className="text-gold bg-cream-light px-1.5 py-0.5 rounded">~/.cursor/mcp.json</code></>
              )}
              {activeTab === 'claude' && (
                <>配置文件位置：<code className="text-gold bg-cream-light px-1.5 py-0.5 rounded">~/Library/Application Support/Claude/claude_desktop_config.json</code></>
              )}
            </p>

            {/* JSON Code Box */}
            <div className="relative group">
              <pre className="p-4 rounded-xl bg-[#1e1e1e] text-[#d4d4d4] text-xs font-mono overflow-x-auto border border-border/40">
                {currentConfig}
              </pre>
              <button
                onClick={() => handleCopy(currentConfig, 'config')}
                className="absolute top-2.5 right-2.5 px-3 py-1.5 rounded-md bg-gold/90 hover:bg-gold text-cream text-xs font-medium transition-all shadow-sm active:scale-95 cursor-pointer"
              >
                {copiedType === 'config' ? '已复制配置' : '一键复制 JSON'}
              </button>
            </div>
          </div>

          {/* 常用对话指令示例 */}
          <div className="space-y-2">
            <span className="font-medium text-xs tracking-wider text-muted uppercase">在 AI 中直接对话使用</span>
            <div className="p-3 bg-cream-light/60 border border-border rounded-xl space-y-2 text-xs">
              <div className="flex items-start gap-2">
                <span className="text-gold font-bold">•</span>
                <div>
                  <span className="text-ink font-medium">求签对话：</span>
                  <span className="text-muted">“帮我抽一支今日运势签，看看今天去拜访客户顺利吗”</span>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-gold font-bold">•</span>
                <div>
                  <span className="text-ink font-medium">六爻排盘与解析：</span>
                  <span className="text-muted">“请用小卦摊占一卦六爻，我想问下半年换工作是否合适，并给出解卦依据”</span>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-gold font-bold">•</span>
                <div>
                  <span className="text-ink font-medium">多轮深度追问：</span>
                  <span className="text-muted">“接上一卦，如果我等到下个月再辞职，世爻的五行生克会变好吗？”</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-border bg-cream-light/30 flex items-center justify-between text-xs text-muted">
          <span>云端端点：<code className="text-gold font-mono">{cloudEndpoint}</code></span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-full border border-border hover:border-gold/40 text-ink transition-colors font-medium cursor-pointer"
          >
            完成
          </button>
        </div>
      </div>
    </div>
  );
};
