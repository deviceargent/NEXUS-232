/**
 * NEXUS-232 Derivation Model
 */

export type DerivationStatus =
  | 'RIGOROUS'
  | 'PLAUSIBLE'
  | 'SPECULATIVE'
  | 'UNJUSTIFIABLE'
  | 'CONTRADICTORY';

export type DerivationRule =
  | 'modus_ponens'
  | 'mathematical_deduction'
  | 'algebraic_transform'
  | 'perturbative_expansion'
  | 'empirical_induction'
  | 'boundary_condition_check'
  | 'hypothesis_postulation';

export interface DerivationStep {
  id: string;
  stepIndex: number;
  premiseNodeIds: string[];
  rule: DerivationRule;
  justification: string;
  conclusionNodeId: string;
  formulaLatex?: string;
  isJustified: boolean;
  notes?: string;
}

export interface Derivation {
  id: string;
  title: string;
  description: string;
  rootNodeId: string;
  terminalNodeId?: string;
  steps: DerivationStep[];
  status: DerivationStatus;
  createdAt: string;
  updatedAt: string;
}
