import { useGoBackOnError } from 'app/routes';
import { Auto, Col, Page } from 'components/layout';
import { useValidator } from 'data/queries/staking';
import { useXplaValidator } from 'data/Xpla/XplaAPI';
import { useTranslation } from 'react-i18next';

import useAddressParams from './useAddressParams';
import ValidatorActions from './ValidatorActions';
import ValidatorAddresses from './ValidatorAddresses';
import ValidatorCommission from './ValidatorCommission';
import ValidatorCompact from './ValidatorCompact';
import ValidatorSummary from './ValidatorSummary';
import ValidatorVotes from './ValidatorVotes';

const ValidatorDetails = () => {
  const { t } = useTranslation();
  const address = useAddressParams();
  const { data: validator, ...state } = useValidator(address);
  const { data: XplaValidator } = useXplaValidator(address);

  useGoBackOnError(state);

  const render = () => {
    if (!validator) return null;

    return (
      <Auto
        columns={[
          <Col>
            <ValidatorCompact />

            {XplaValidator && (
              <>
                <ValidatorSummary validator={XplaValidator} />
                <ValidatorCommission validator={XplaValidator} />
                <ValidatorVotes validator={XplaValidator} />
              </>
            )}

            <ValidatorAddresses validator={validator} />
          </Col>,
          <ValidatorActions destination={validator.operator_address} />,
        ]}
      />
    );
  };

  return (
    <Page {...state} title={t('Validator details')}>
      {render()}
    </Page>
  );
};

export default ValidatorDetails;
