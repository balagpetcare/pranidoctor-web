'use client';

import { AiGovernancePanel } from './AiGovernancePanel';

/** AI Center settings — governance, kill switch, and scope controls. */
export function AiSettingsPanel() {
  return <AiGovernancePanel headingTitle="AI Settings" headingDescription="Governance, kill switch, feature scopes, and change history" />;
}
