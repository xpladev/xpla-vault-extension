import { Validator } from '@xpla/xpla.js';
import { Contacts } from './components';

export interface XplaValidator extends Validator.Data {
  picture?: string;
  contact?: Contacts;
  miss_counter?: string;
  voting_power?: string;
  self?: string;
  votes?: Vote[];
  rewards_30d?: string;
  time_weighted_uptime?: number;
}

interface Vote {
  options: Option[];
  proposal_id: string;
  title: string;
}

interface Option {
  option: string;
  weight: string;
}
