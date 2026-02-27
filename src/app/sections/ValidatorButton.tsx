import { LinkButton } from 'components/general';
import { useConnectedMoniker } from 'data/queries/distribution';

const ValidatorButton = () => {
  const moniker = useConnectedMoniker();
  if (!moniker) return null;

  return (
    <LinkButton to="/commission" size="small" outline>
      {moniker}
    </LinkButton>
  );
};

export default ValidatorButton;
