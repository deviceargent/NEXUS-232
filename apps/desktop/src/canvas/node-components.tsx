import React, { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { TheoryNode, TheoryStatus, TheoryNodeType } from '@nexus/core';
import { Badge, StatusVariant } from '@nexus/ui';
import {
  Lightbulb,
  GitBranch,
  FileCheck2,
  HelpCircle,
  ShieldAlert,
  FolderGit2,
  Binary,
  FlaskConical,
  Boxes,
  Lock
} from 'lucide-react';

interface TheoryNodeData {
  node: TheoryNode;
  isSelected?: boolean;
}

const statusMap: Record<TheoryStatus, StatusVariant> = {
  VALID: 'VALID',
  IN_REVIEW: 'IN_REVIEW',
  BLOCKED: 'BLOCKED',
  UNDETERMINED: 'UNDETERMINED',
  INVALID: 'INVALID'
};

const typeIcons: Record<TheoryNodeType, React.ReactNode> = {
  HypothesisNode: <Lightbulb className="w-3.5 h-3.5 text-sky-400" />,
  DerivationNode: <GitBranch className="w-3.5 h-3.5 text-indigo-400" />,
  EvidenceNode: <FileCheck2 className="w-3.5 h-3.5 text-emerald-400" />,
  QuestionNode: <HelpCircle className="w-3.5 h-3.5 text-amber-400" />,
  BlockedNode: <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />,
  ResourceNode: <FolderGit2 className="w-3.5 h-3.5 text-blue-400" />,
  EquationNode: <Binary className="w-3.5 h-3.5 text-purple-400" />,
  ExperimentNode: <FlaskConical className="w-3.5 h-3.5 text-teal-400" />,
  SimulationNode: <Boxes className="w-3.5 h-3.5 text-cyan-400" />
};

export const BaseTheoryNodeCard: React.FC<{ data: TheoryNodeData; selected?: boolean }> = memo(
  ({ data, selected }) => {
    const { node } = data;
    const isFrozen = node.isFrozen;
    const isBlocked = node.status === 'BLOCKED' || node.type === 'BlockedNode';

    return (
      <div
        className={`w-64 rounded-[var(--nexus-radius)] border p-2.5 transition-all text-left shadow-lg select-none backdrop-blur-sm ${
          selected
            ? 'ring-2 ring-[var(--nexus-accent)] border-[var(--nexus-accent)] shadow-[var(--nexus-shadow-glow)]'
            : isBlocked
            ? 'border-rose-500/60 bg-rose-950/20'
            : isFrozen
            ? 'border-cyan-700/50 bg-slate-900/90'
            : 'border-[var(--nexus-border)] bg-[var(--nexus-surface)] hover:border-[var(--nexus-border-glow)]'
        }`}
      >
        <Handle
          type="target"
          position={Position.Top}
          className="!bg-[var(--nexus-border)] hover:!bg-[var(--nexus-accent)] !w-2.5 !h-2.5 !-top-1.5"
        />

        {/* Node Header */}
        <div className="flex items-center justify-between gap-1 mb-1.5">
          <div className="flex items-center gap-1.5 min-w-0">
            {typeIcons[node.type] || <Lightbulb className="w-3.5 h-3.5 text-sky-400" />}
            <span className="font-mono text-xs font-bold text-[var(--nexus-accent)] tracking-tight">
              {node.alias}
            </span>
            {isFrozen && (
              <span title="Branch Frozen" className="flex items-center text-cyan-400 text-[10px]">
                <Lock className="w-3 h-3" />
              </span>
            )}
          </div>
          <Badge status={statusMap[node.status] || 'DEFAULT'}>
            {node.status}
          </Badge>
        </div>

        {/* Title */}
        <div className="text-xs font-semibold text-[var(--nexus-text)] leading-tight mb-1 truncate">
          {node.title}
        </div>

        {/* Content Preview */}
        <div className="text-[11px] font-mono text-[var(--nexus-text-muted)] line-clamp-2 leading-relaxed bg-[var(--nexus-surface-2)] p-1.5 rounded border border-[var(--nexus-border)]/50">
          {node.content}
        </div>

        {/* Mathematical Equation Pill if present */}
        {node.metadata.equationLatex && (
          <div className="mt-1.5 text-[10px] font-mono text-cyan-300 bg-cyan-950/40 border border-cyan-800/40 px-1.5 py-0.5 rounded truncate">
            $$ {node.metadata.equationLatex} $$
          </div>
        )}

        {/* Footer badges: dependencies / resources count */}
        <div className="mt-2 flex items-center justify-between text-[10px] font-mono text-[var(--nexus-text-dim)] border-t border-[var(--nexus-border)]/40 pt-1">
          <span>{node.type.replace('Node', '')}</span>
          <div className="flex items-center gap-1.5">
            {node.parentIds.length > 0 && (
              <span title="Parents">↑{node.parentIds.length}</span>
            )}
            {node.resourceIds.length > 0 && (
              <span title="Resources">📎{node.resourceIds.length}</span>
            )}
            {node.documentFragmentIds.length > 0 && (
              <span title="Fragments">§{node.documentFragmentIds.length}</span>
            )}
          </div>
        </div>

        <Handle
          type="source"
          position={Position.Bottom}
          className="!bg-[var(--nexus-accent)] !w-2.5 !h-2.5 !-bottom-1.5"
        />
      </div>
    );
  }
);

BaseTheoryNodeCard.displayName = 'BaseTheoryNodeCard';

// Wrap custom types
export const HypothesisNode = (props: NodeProps<any>) => <BaseTheoryNodeCard {...props} />;
export const DerivationNode = (props: NodeProps<any>) => <BaseTheoryNodeCard {...props} />;
export const EvidenceNode = (props: NodeProps<any>) => <BaseTheoryNodeCard {...props} />;
export const QuestionNode = (props: NodeProps<any>) => <BaseTheoryNodeCard {...props} />;
export const BlockedNode = (props: NodeProps<any>) => <BaseTheoryNodeCard {...props} />;
export const ResourceNode = (props: NodeProps<any>) => <BaseTheoryNodeCard {...props} />;
export const EquationNode = (props: NodeProps<any>) => <BaseTheoryNodeCard {...props} />;
export const ExperimentNode = (props: NodeProps<any>) => <BaseTheoryNodeCard {...props} />;
export const SimulationNode = (props: NodeProps<any>) => <BaseTheoryNodeCard {...props} />;

export const theoryNodeTypes: any = {
  HypothesisNode,
  DerivationNode,
  EvidenceNode,
  QuestionNode,
  BlockedNode,
  ResourceNode,
  EquationNode,
  ExperimentNode,
  SimulationNode
};
