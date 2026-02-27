import { RadioGroup } from 'components/form';
import { useMinimumValue } from 'data/settings/MinimumValue';

const BalanceSetting = () => {
  const [value, set, list] = useMinimumValue();
  return <RadioGroup options={list} value={value} onChange={set} />;
};

export default BalanceSetting;
