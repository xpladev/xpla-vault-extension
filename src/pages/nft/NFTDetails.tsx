import { Fragment } from 'react';
// import { Pre } from 'components/general';
import _ from 'lodash';
import { Details } from 'components/display';
import styles from './NFTDetails.module.scss';
import { TokenBadge } from 'components/token';

const NFTDetails = ({
  data,
  id,
  evm,
  nft,
}: {
  data: object;
  id: string;
  evm?: boolean;
  nft?: boolean;
}) => {
  const { description, attributes: attr } = data as any;

  const arrAttr: { type: string; value: string }[] = [];
  _.forEach(attr, (item) => {
    arrAttr.push({
      type: item.trait_type,
      value: item.value,
    });
  });

  // return <Pre height={120}>{data}</Pre>;
  return (
    <>
      {description && (
        <Details>
          {description.split('\n').map((line: any) => {
            return (
              <span>
                {line}
                <br />
              </span>
            );
          })}
        </Details>
      )}

      <Details>
        <dl className={styles.dl}>
          <dt className={styles.dt}>NFT Type</dt>
          <dd className={styles.dd}>
            <TokenBadge className="nft-type" evm={evm} nft={nft} />
          </dd>
          <dt className={styles.dt}>token id</dt>
          <dd className={styles.dd}>{id}</dd>
          {arrAttr &&
            arrAttr.map((item) => (
              <Fragment key={item.type}>
                <dt className={styles.dt}>{item.type}</dt>
                <dd className={styles.dd}>{item.value}</dd>
              </Fragment>
            ))}
        </dl>
      </Details>
    </>
  );
};

export default NFTDetails;
