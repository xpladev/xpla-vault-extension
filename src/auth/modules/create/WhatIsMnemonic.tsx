import { useState } from 'react';
import ArrowBack from '@mui/icons-material/ArrowBack';
import mnemonicLoopGif from 'styles/images/mnemonic-loop.gif';
import { Button } from 'components/general';
import styles from './WhatIsMnemonic.module.scss';

interface Props {
  handleOK: () => Promise<void>;
}

const WhatIsMnemonic = ({ handleOK }: Props) => {
  const [step, setStep] = useState<number>(1);

  return (
    <>
      {step === 1 ? (
        <>
          <section className={styles['mnemonic-modal-main']}>
            <h1 className={styles['mnemonic-modal-title']}>
              What is Mnemonic?
            </h1>
            <img
              src={mnemonicLoopGif}
              className={styles['mnemonic-img']}
              alt=""
            />
            <div className={styles['mnemonic-details']}>
              Mnemonic is a <b>secret code to access to your wallet.</b>
            </div>
          </section>
          <footer className={styles['mnemonic-footer']}>
            <Button color="primary" block onClick={() => setStep(2)}>
              <span>Next</span>
            </Button>
          </footer>
        </>
      ) : (
        <>
          <button
            type="button"
            className={styles['modal-back']}
            onClick={() => setStep(1)}
          >
            <ArrowBack style={{ fontSize: '20px' }} />
          </button>
          <section className={styles['mnemonic-modal-main']}>
            <h1 className={styles['mnemonic-modal-title']}>
              What is Mnemonic?
            </h1>

            <div className={styles['mnemonic-message']}>
              Mnemonic is asked when:
              <br />
              <br />
              You are connecting your wallet from
              <br />
              different environment or devices.
              <br />
              <br />
              <b>&nbsp;NEVER in other case.</b>
            </div>
            {/* <!-- <div className="mnemonic-details-mnemonic">
            <i>Yes, ‘Seed Phrase’ is also known as ‘Mnemonic’ as well.</i>
          </div> --> */}
          </section>
          <footer className={styles['mnemonic-footer']}>
            <Button color="primary" block onClick={handleOK}>
              <span>OK</span>
            </Button>
          </footer>
        </>
      )}
    </>
  );
};

export default WhatIsMnemonic;
