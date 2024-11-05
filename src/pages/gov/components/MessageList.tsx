import { Msg } from '@xpla/xpla.js';
import classNames from 'classnames/bind';
import { Grid } from 'components/layout';
import styles from './DataList.module.scss';

const cx = classNames.bind(styles);

interface Props {
  list: Msg.Data[];
  type: 'horizontal' | 'vertical';
}

const MessageList = ({ list, type }: Props) => {
  return (
    <div className={cx(styles.list, type)}>
      {list.map((msg, index) => (
        <Grid gap={4} key={index}>
          <pre>{JSON.stringify(msg, null, 2)}</pre>
        </Grid>
      ))}
    </div>
  );
};

export default MessageList;
