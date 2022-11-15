import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useCW721Tokens } from 'data/queries/wasm';
import { ExternalLink } from 'components/general';
import { Card, Grid } from 'components/layout';
import { TokenIcon } from 'components/token';
import NFTAssetItem from './NFTAssetItem';
import styles from './NFTAssetGroup.module.scss';

import { InternalButton } from 'components/general';
import { useLCDClient } from 'data/queries/lcdClient';
import useAddress from 'auth/hooks/useAddress';

const NFTAssetGroup = (props: CW721ContractItem) => {
  const [lastTokenId, setLastTokenId] = useState<string>();
  const [tokenIds, setTokenIds] = useState<string[]>();
  const [isShow, setIsShow] = useState<boolean>(false);

  const { contract, name, icon, marketplace } = props;
  const { t } = useTranslation();
  const { data, ...state } = useCW721Tokens(contract);

  const address = useAddress();
  const lcd = useLCDClient();

  useEffect(() => {
    if (data) {
      const { tokens } = data;
      if (tokens.length === 10) {
        const lastId = tokens[tokens.length - 1];
        setLastTokenId(lastId);
      }

      setTokenIds(tokens);
    }
  }, [data]);

  const getAddList = async (): Promise<void> => {
    const data = await lcd.wasm.contractQuery<{ tokens: string[] }>(contract, {
      tokens: {
        owner: address,
        start_after: lastTokenId,
        limit: 10,
      },
    });

    const { tokens: newTokens } = data;

    const newTokenIds = tokenIds?.concat(newTokens);
    setTokenIds(newTokenIds);

    if (newTokens.length === 10) {
      setLastTokenId(newTokens[newTokens.length - 1]);
    } else {
      setLastTokenId(undefined);
    }
  };

  const title = (
    <>
      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-start',
          alignItems: 'center',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          width: '100%',
          gap: '4px',
          cursor: tokenIds && tokenIds.length > 0 ? 'pointer' : 'default',
        }}
        onClick={() => {
          if (tokenIds && tokenIds.length > 0) {
            setIsShow(!isShow);
          }
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gridGap: '8px',
            gap: '8px',
          }}
        >
          <TokenIcon
            token={contract}
            icon={icon}
            className={styles.icon}
            size={20}
          />
          <span
            style={{
              fontWeight: 500,
              margin: 0,
              fontSize: 12,
            }}
          >
            {name}
          </span>
        </div>
        {tokenIds && tokenIds.length > 0 && (
          <svg
            width="18"
            height="18"
            viewBox="0 0 18 18"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={isShow ? styles.close : styles.open}
          >
            <path
              d="M5.5575 6.4425L9 9.8775L12.4425 6.4425L13.5 7.5L9 12L4.5 7.5L5.5575 6.4425Z"
              fill="#439CF4"
            />
          </svg>
        )}
      </div>
    </>
  );

  const renderExtra = () => {
    if (!marketplace?.length) return null;
    const [link] = marketplace;
    return (
      <ExternalLink href={link} className={styles.link}>
        {t('Collection')}
      </ExternalLink>
    );
  };

  const render = () => {
    if (!data) return null;
    // const { tokens } = data;
    if (!tokenIds) return null;
    return tokenIds.map((id) => (
      <NFTAssetItem contract={contract} id={id} compact key={id} />
    ));
  };

  return (
    <Card
      {...state}
      title={title}
      extra={renderExtra()}
      className={styles.card}
      mainClassName={styles.main}
      size="small"
      bordered
      bg
    >
      <div style={{ display: isShow ? 'block' : 'none' }}>{render()}</div>

      {isShow && tokenIds && lastTokenId && (
        <Grid>
          <InternalButton
            onClick={() => {
              if (lastTokenId) {
                getAddList();
              }
            }}
            style={{ padding: '20px 0' }}
          >
            {t('Load more')}
          </InternalButton>
        </Grid>
      )}
    </Card>
  );
};

export default NFTAssetGroup;
