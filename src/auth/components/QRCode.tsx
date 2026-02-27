import { Flex } from 'components/layout';
import { QRCodeSVG } from 'qrcode.react';
import variable from 'styles/variable';

const QRCode = ({ value }: { value: string }) => {
  return (
    <Flex>
      <QRCodeSVG
        value={value}
        size={320}
        bgColor={variable('--card-bg')}
        fgColor={variable('--text')}
      />
    </Flex>
  );
};

export default QRCode;
