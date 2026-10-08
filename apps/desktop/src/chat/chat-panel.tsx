import React, { useState, useRef, useEffect } from 'react';
import { useNexus } from '../app/context.js';
import { useUIStore } from '../app/store.js';
import { Button, Badge } from '@nexus/ui';
import {
  Send,
  Bot,
  User,
  Wrench,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  Loader2
} from 'lucide-react';

export const ChatPanel: React.FC = () => {
  const { messages, agentPlanner, graphService, syncState } = useNexus();
  const {
    chatInput,
    setChatInput,
    isStreaming,
    setIsStreaming,
    selectedNodeId,
    setSelectedNodeId
  } = useUIStore();

  const [streamedText, setStreamedText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamedText]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend ?? chatInput;
    if (!text.trim() || isStreaming) return;

    setChatInput('');
    setIsStreaming(true);
    setStreamedText('');

    try {
      await agentPlanner.processUserMessage(
        text,
        selectedNodeId ?? undefined,
        undefined,
        (chunk) => {
          setStreamedText((prev) => prev + chunk);
        }
      );
      syncState();
    } catch (err: any) {
      alert(`Error en agente: ${err.message || err}`);
    } finally {
      setIsStreaming(false);
      setStreamedText('');
      syncState();
    }
  };

  const selectedNode = selectedNodeId ? graphService.getNode(selectedNodeId) : null;

  return (
    <div className="h-full flex flex-col bg-[var(--nexus-surface)] border-r border-[var(--nexus-border)] font-mono text-xs overflow-hidden select-none">
      {/* Chat Header */}
      <div className="p-3 border-b border-[var(--nexus-border)] bg-[var(--nexus-surface-2)] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bot className="w-4 h-4 text-[var(--nexus-accent)]" />
          <span className="font-bold text-xs text-[var(--nexus-text)]">AGENTE TEÓRICO NEXUS</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Badge status="VALID">ONLINE</Badge>
          {selectedNode && (
            <span className="text-[10px] text-[var(--nexus-text-dim)]">
              Contexto: <strong className="text-[var(--nexus-accent)]">{selectedNode.alias}</strong>
            </span>
          )}
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.length === 0 && (
          <div className="text-center py-8 text-[var(--nexus-text-dim)] space-y-2">
            <Sparkles className="w-6 h-6 mx-auto opacity-50 text-[var(--nexus-accent)]" />
            <p className="text-xs text-[var(--nexus-text-muted)] font-semibold">
              Exploración de Hipótesis Científicas
            </p>
            <p className="text-[11px] max-w-[240px] mx-auto">
              Escriba una hipótesis o use las sugerencias inferiores. El agente formalizará nodos y relaciones mediante herramientas tipadas.
            </p>
          </div>
        )}

        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex flex-col gap-1 ${isUser ? 'items-end' : 'items-start'}`}
            >
              <div className="flex items-center gap-1.5 text-[10px] text-[var(--nexus-text-dim)]">
                {isUser ? <User className="w-3 h-3" /> : <Bot className="w-3 h-3 text-[var(--nexus-accent)]" />}
                <span>{isUser ? 'Investigador' : 'Agente'}</span>
                <span>{new Date(msg.timestamp).toLocaleTimeString()}</span>
              </div>

              <div
                className={`max-w-[90%] p-2.5 rounded border text-[11px] leading-relaxed break-words whitespace-pre-wrap ${
                  isUser
                    ? 'bg-[var(--nexus-accent-subtle)] border-[var(--nexus-accent)]/40 text-[var(--nexus-text)]'
                    : 'bg-[var(--nexus-surface-2)] border-[var(--nexus-border)] text-[var(--nexus-text)]'
                }`}
              >
                {msg.content}
              </div>

              {/* Tool Calls */}
              {msg.toolCalls && msg.toolCalls.length > 0 && (
                <div className="w-[90%] space-y-1 mt-1">
                  {msg.toolCalls.map((tc) => (
                    <div
                      key={tc.id}
                      className="p-1.5 rounded bg-[var(--nexus-bg)] border border-[var(--nexus-border)] text-[10px] space-y-0.5"
                    >
                      <div className="flex items-center justify-between text-[var(--nexus-accent)] font-bold">
                        <div className="flex items-center gap-1">
                          <Wrench className="w-3 h-3" />
                          <span>Tool: {tc.name}</span>
                        </div>
                        <CheckCircle2 className="w-3 h-3 text-[var(--nexus-valid)]" />
                      </div>
                      <div className="text-[var(--nexus-text-dim)] truncate">
                        {JSON.stringify(tc.args)}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Referenced Nodes Pill Navigation */}
              {msg.referencedNodeIds && msg.referencedNodeIds.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {msg.referencedNodeIds.map((nodeId) => {
                    const n = graphService.getNode(nodeId);
                    if (!n) return null;
                    return (
                      <button
                        key={nodeId}
                        onClick={() => setSelectedNodeId(nodeId)}
                        className="px-1.5 py-0.5 rounded text-[10px] bg-sky-950/60 border border-sky-800 text-sky-300 hover:bg-sky-900 cursor-pointer flex items-center gap-1"
                      >
                        <span>{n.alias}</span>
                        <ArrowRight className="w-2.5 h-2.5 opacity-60" />
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        {/* Streaming text indicator */}
        {isStreaming && (
          <div className="flex flex-col gap-1 items-start">
            <div className="flex items-center gap-1.5 text-[10px] text-[var(--nexus-accent)]">
              <Loader2 className="w-3 h-3 animate-spin" />
              <span>Agente razonando...</span>
            </div>
            {streamedText && (
              <div className="max-w-[90%] p-2.5 rounded border border-[var(--nexus-border)] bg-[var(--nexus-surface-2)] text-[11px] leading-relaxed whitespace-pre-wrap">
                {streamedText}
              </div>
            )}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Scientific Quick Prompts Chips */}
      <div className="p-2 border-t border-[var(--nexus-border)] bg-[var(--nexus-surface-2)]/60 flex items-center gap-1 overflow-x-auto no-scrollbar">
        <button
          onClick={() => handleSendMessage('La perturbación del campo podría explicar la anisotropía.')}
          className="text-[10px] px-2 py-1 rounded bg-[var(--nexus-surface)] border border-[var(--nexus-border)] hover:border-[var(--nexus-accent)] text-[var(--nexus-text-muted)] hover:text-white whitespace-nowrap cursor-pointer transition-all"
        >
          + Plantear Hipótesis
        </button>
        <button
          onClick={() => handleSendMessage('Derivá sus consecuencias.')}
          className="text-[10px] px-2 py-1 rounded bg-[var(--nexus-surface)] border border-[var(--nexus-border)] hover:border-[var(--nexus-accent)] text-[var(--nexus-text-muted)] hover:text-white whitespace-nowrap cursor-pointer transition-all"
        >
          → Derivar consecuencias
        </button>
        <button
          onClick={() => handleSendMessage('Crear fragmento LaTeX y compilar documento')}
          className="text-[10px] px-2 py-1 rounded bg-[var(--nexus-surface)] border border-[var(--nexus-border)] hover:border-[var(--nexus-accent)] text-[var(--nexus-text-muted)] hover:text-white whitespace-nowrap cursor-pointer transition-all"
        >
          ⚡ Compilar LaTeX
        </button>
      </div>

      {/* Chat Input Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="p-2.5 border-t border-[var(--nexus-border)] bg-[var(--nexus-surface)] flex items-center gap-2"
      >
        <input
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
          placeholder="Escribir razonamiento o instrucción al agente..."
          disabled={isStreaming}
          className="flex-1 bg-[var(--nexus-surface-2)] text-xs text-[var(--nexus-text)] rounded border border-[var(--nexus-border)] px-3 py-2 focus:outline-none focus:border-[var(--nexus-accent)] disabled:opacity-50"
        />
        <Button
          type="submit"
          size="md"
          variant="primary"
          disabled={isStreaming || !chatInput.trim()}
          className="gap-1 font-semibold"
        >
          {isStreaming ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
        </Button>
      </form>
    </div>
  );
};
