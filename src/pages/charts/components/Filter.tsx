import { Flex } from 'components/layout';
import { PropsWithChildren } from 'react';

const Filter = ({ children }: PropsWithChildren<{}>) => {
  return <Flex gap={8}>{children}</Flex>;
};

export default Filter;
