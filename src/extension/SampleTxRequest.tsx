import { MsgSend } from '@xpla/xpla.js';

const id = Date.now();
const address = 'xpla1x46rqay4d3cssq8gxxvqz8xt6nwlz4td20k38v';
const memo =
  'Loremipsumdolorsitamet,consecteturadipisicingelit,seddoeiusmodtemporincididuntutlaboreetdoloremagnaaliqua.Utenimadminimveniam,quisnostrudexercitationullamcolaborisnisiutaliquipexeacommodoconsequat.Duisauteiruredolorinreprehenderitinvoluptatevelitessecillumdoloreeufugiatnullapariatur.Excepteursintoccaecatcupidatatnonproident,suntinculpaquiofficiadeseruntmollitanimidestlaborum.';

const SampleTxRequest = {
  id,
  timestamp: new Date(id),
  origin: 'https://vault.xpla.io',
  requestType: 'post' as const,
  tx: { msgs: [new MsgSend(address, address, '1axpla')], memo },
};

export default SampleTxRequest;
