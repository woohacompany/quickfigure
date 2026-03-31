export interface ToolContentData {
  about: { en: string; ko: string };
  howItWorks: { en: string; ko: string };
  howItWorksTitle?: { en: string; ko: string };
  disclaimer?: { en: string; ko: string };
}

import { financeToolContent } from "./tool-content-finance";
import { healthUtilityToolContent } from "./tool-content-health-utility";
import { devTextToolContent } from "./tool-content-dev-text";
import { imageFileToolContent } from "./tool-content-image-file";

const allToolContent: Record<string, ToolContentData> = {
  ...financeToolContent,
  ...healthUtilityToolContent,
  ...devTextToolContent,
  ...imageFileToolContent,
};

export function getToolContent(slug: string): ToolContentData | undefined {
  return allToolContent[slug];
}
