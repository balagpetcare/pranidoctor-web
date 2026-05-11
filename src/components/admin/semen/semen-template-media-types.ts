import type { SemenTemplateMediaKindValue } from "./semen-ui-options";

export type SemenTemplateMediaFormRow = {
  clientKey: string;
  kind: SemenTemplateMediaKindValue;
  uploadedFileId: string;
  externalUrl: string;
};
