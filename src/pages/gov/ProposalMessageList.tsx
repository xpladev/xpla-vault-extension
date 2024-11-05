import { ProposalV1 } from '@xpla/xpla.js';
import { Col, Card } from 'components/layout';
import MessageList from './components/MessageList';

const ProposalMessageList = ({ proposal }: { proposal: ProposalV1 }) => {
  const messages = proposal.toData().messages;

  return !messages.length ? null : (
    <Col>
      <Card>
        <MessageList list={messages} type="vertical" />
      </Card>
    </Col>
  );
};

export default ProposalMessageList;
