import { Fragment } from 'react';
import { useTranslation } from 'react-i18next';
import { useNetwork } from 'data/wallet';
import { useIsClassic } from 'data/query';
import { Grid } from 'components/layout';
import { Dl, ToNow } from 'components/display';
import { ReadMultiple } from 'components/token';
import { getIsNativeMsgFromExternal, TxRequest } from '../utils';
import Message from './Message';
import styles from './TxDetails.module.scss';
import { EvmMsg, Msg } from '@xpla/xpla.js';

const isEvmMsg = (msg: Msg | EvmMsg): msg is EvmMsg => {
  return 'tx()' in msg;
};

const TxDetails = ({ origin, timestamp, tx }: TxRequest) => {
  const { msgs, memo, fee } = tx;

  const { t } = useTranslation();
  const isClassic = useIsClassic();
  const network = useNetwork();

  const fees = fee?.amount.toData();
  const contents = [
    { title: t('Network'), content: `${network.name} (${network.chainID})` },
    { title: t('Origin'), content: origin },
    { title: t('Timestamp'), content: <ToNow update>{timestamp}</ToNow> },
    { title: t('Fee'), content: fees && <ReadMultiple list={fees} /> },
    { title: t('Memo'), content: memo },
  ];

  const filteredMsgs: Msg[] = (msgs as any).filter((msg: any) => isEvmMsg(msg));

  return (
    <Grid gap={12}>
      <Dl className={styles.dl}>
        {contents.map(({ title, content }) => {
          if (!content) return null;
          return (
            <Fragment key={title}>
              <dt>{title}</dt>
              <dd>{content}</dd>
            </Fragment>
          );
        })}
      </Dl>

      {filteredMsgs.map((msg, index) => {
        const isNative = getIsNativeMsgFromExternal(origin);
        return (
          <Message msg={msg} warn={isNative(msg, isClassic)} key={index} />
        );
      })}
    </Grid>
  );
};

export default TxDetails;
