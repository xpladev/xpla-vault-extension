import { Vote } from '@xpla/xpla.js';

export interface XplaProposalItem {
  voter: string;
  options: { option: Vote.Option; weight: string }[];
}
