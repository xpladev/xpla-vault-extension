import { useTranslation } from 'react-i18next';
import { ProposalV1 } from '@xpla/xpla.js';
import { useParseProposalV1Type } from 'data/queries/gov';
import { useProposalStatusItem } from 'data/queries/gov';
import { ToNow } from 'components/display';
import styles from './ProposalHeader.module.scss';

const ProposalHeader = ({ proposal }: { proposal: ProposalV1 }) => {
  const { id, title, status, submit_time } = proposal;

  const { t } = useTranslation();
  const type = useParseProposalV1Type(proposal);
  const { color, label } = useProposalStatusItem(status);

  return (
    <header className={styles.header}>
      <section className={styles.meta}>
        <aside>
          {id} | {type}
        </aside>
        <strong className={color}>{label}</strong>
      </section>

      <h1 className={styles.title}>{title}</h1>
      <p className={styles.date}>
        {t('Submitted')} <ToNow>{submit_time}</ToNow>
      </p>
    </header>
  );
};

export default ProposalHeader;
