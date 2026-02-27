import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { useState } from 'react';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { useTranslation } from 'react-i18next';
import useTimeout from 'utils/hooks/useTimeout';

import styles from './Copy.module.scss';

const Copy = (props: CopyToClipboard.Props) => {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  useTimeout(() => setCopied(false), copied ? 1000 : 0);

  return (
    <CopyToClipboard {...props} onCopy={() => setCopied(true)}>
      <button type="button" className={styles.button}>
        <ContentCopyIcon fontSize="inherit" />
        {copied ? t('Copied') : t('Copy')}
      </button>
    </CopyToClipboard>
  );
};

export default Copy;
