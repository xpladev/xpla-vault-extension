import { useCallback } from 'react';
import { CreateTxOptions, EvmMsg, Fee, Msg, Tx, SignMode } from '@xpla/xpla.js';
import { useIsClassic } from 'data/query';

/* primitive */
export interface PrimitiveDefaultRequest {
  id: number;
  origin: string;
}

export interface PrimitiveTxRequest
  extends Partial<TxResponse>,
    PrimitiveDefaultRequest {
  msgs: string[];
  fee?: string;
  memo?: string;
  sequence?: number;
  accountNumber?: number;
  signMode?: SignMode;
}

export interface PrimitiveSignBytesRequest
  extends Partial<TxResponse>,
    PrimitiveDefaultRequest {
  bytes: string;
}

export interface ExtensionStorage {
  connect?: { allowed: string[]; request: string[] };
  sign?: (PrimitiveTxRequest | PrimitiveSignBytesRequest)[];
  post?: PrimitiveTxRequest[];
}

/* app */
export interface ConnectRequest {
  origin: string;
}

export interface DefaultRequest extends PrimitiveDefaultRequest {
  timestamp: Date;
}

export type RequestType = 'sign' | 'post' | 'signBytes';

export interface TxRequest extends DefaultRequest {
  tx: CreateTxOptions & {
    sequence?: number;
    accountNumber?: number;
    signMode?: SignMode;
  };
  requestType: 'sign' | 'post';
}

export interface SignBytesRequest extends DefaultRequest {
  bytes: Buffer;
  requestType: 'signBytes';
}

/* response */
export interface TxResponse<T = any> {
  success: boolean;
  result?: T;
  error?: { code: number; message?: string };
}

/* utils */
export const isSign = (
  request: PrimitiveTxRequest | PrimitiveSignBytesRequest,
): request is PrimitiveTxRequest => 'msgs' in request;

export const isBytes = (
  request: PrimitiveTxRequest | PrimitiveSignBytesRequest,
): request is PrimitiveSignBytesRequest => 'bytes' in request;

/* parse */
export const parseDefault = (
  request: PrimitiveDefaultRequest,
): DefaultRequest => {
  return { ...request, timestamp: new Date(request.id) };
};

export const useParseTx = () => {
  const isClassic = useIsClassic();

  return useCallback(
    (request: PrimitiveTxRequest): TxRequest['tx'] => {
      const { msgs, fee, memo, sequence, accountNumber, signMode } = request;
      const isProto = '@type' in JSON.parse(msgs[0]);
      return isProto
        ? {
            msgs: msgs.map((msg) => Msg.fromData(JSON.parse(msg), isClassic)),
            fee: fee ? Fee.fromData(JSON.parse(fee)) : undefined,
            memo,
            sequence,
            accountNumber,
            signMode,
          }
        : {
            msgs: msgs.map((msg) => Msg.fromAmino(JSON.parse(msg), isClassic)),
            fee: fee ? Fee.fromAmino(JSON.parse(fee)) : undefined,
            memo,
            sequence,
            accountNumber,
            signMode,
          };
    },
    [isClassic],
  );
};

export const parseBytes = (
  request: PrimitiveSignBytesRequest,
): SignBytesRequest['bytes'] => {
  const { bytes } = request;
  return Buffer.from(bytes, 'base64');
};

export const toData = (result: any, isClassic: boolean) => {
  return result instanceof Tx ? result.toData(isClassic) : result;
};

/* helpers */
export const getIsNativeMsgFromExternal = (origin: string) => {
  return (msg: Msg, isClassic: boolean) => {
    if (origin.includes('https://station.c2x.world')) return false;
    return true;
  };
};

export const getIsDangerousTx = (
  { msgs }: CreateTxOptions,
  isClassic: boolean,
) =>
  msgs.some((msg) => {
    if (!isEvmMsg(msg)) {
      const data = msg.toData(isClassic);
      return data['@type'] === '/cosmos.authz.v1beta1.MsgGrant';
    }
  });

export const isEvmMsg = (msg: Msg | EvmMsg): msg is EvmMsg => {
  return 'tx()' in msg;
};
