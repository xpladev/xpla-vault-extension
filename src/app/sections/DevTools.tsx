import { Button } from 'components/general';
import { useQueryClient } from 'react-query';
import { debug } from 'utils/env';

const DevTools = () => {
  const queryClient = useQueryClient();
  if (!debug.query) return null;

  return (
    <Button onClick={() => queryClient.resetQueries()} size="small" outline>
      Refresh
    </Button>
  );
};

export default DevTools;
