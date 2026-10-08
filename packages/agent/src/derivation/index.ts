/**
 * NEXUS-232 Agent Derivation Subsystem
 */

export interface DerivationProposal {
  premiseAlias: string;
  suggestedEquation: string;
  rationale: string;
  epistemicConfidence: number;
}
