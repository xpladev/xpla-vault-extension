import { ProposalV1 } from '@xpla/xpla.js';
import xss from 'xss';

const ProposalDescription = ({ proposal }: { proposal: ProposalV1 }) => {
  const { summary: description } = proposal;
  return <p dangerouslySetInnerHTML={{ __html: linkify(description) }} />;
};

export default ProposalDescription;

/* helpers */
const linkify = (text: string) => {
  return xss(
    text.replace(
      /(https?:\/\/[^\s]+)/g,
      '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>',
    ),
  );
};
