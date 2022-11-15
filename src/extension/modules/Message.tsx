import { useState } from 'react';
import classNames from 'classnames/bind';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { Coins, Msg } from '@xpla/xpla.js';
import { readMsg } from '@xpla/msg-reader';
import { useIsClassic } from 'data/query';
import TxMessage from 'app/containers/TxMessage';
import styles from './Message.module.scss';

const cx = classNames.bind(styles);

const Message = ({ msg, warn }: { msg: Msg; warn: boolean }) => {
  const summary = readMsg(msg);
  const isClassic = useIsClassic();
  const { '@type': type } = msg.toData(isClassic);

  const [collapsed, setCollapsed] = useState(true);
  const toggle = () => setCollapsed(!collapsed);

  const renderValue = (value: string | object | Coins) => {
    return value instanceof Coins ? (
      <pre>{JSON.stringify(value.toData())}</pre>
    ) : typeof value === 'object' ? (
      <pre>{JSON.stringify(value, null, 2)}</pre>
    ) : (
      value
    );
  };

  return (
    <article className={cx(styles.component, { warn })}>
      <button className={styles.header} onClick={toggle}>
        <TxMessage>{summary}</TxMessage>
        <KeyboardArrowDownIcon style={{ fontSize: 16 }} />
      </button>

      {!collapsed && (
        <section>
          {[['type', type], ...Object.entries(msg)].map(([key, value]) => {
            return (
              <article className={styles.detail} key={key}>
                <h1>{key}</h1>
                <section className={styles.value}>{renderValue(value)}</section>
              </article>
            );
          })}
        </section>
      )}
    </article>
  );
};

export default Message;
