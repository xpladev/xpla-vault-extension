import { useQuery } from 'react-query';
import { Buffer } from 'buffer';
import keccak256 from 'keccak256';
import { queryKey, RefetchOptions } from '../query';
import { useLCDClient } from '../queries/lcdClient';
import { useXplaContracts } from '../Xpla/XplaAssets';

/**
 * Resolve xpla address from a domain name.
 *
 * @param name - A TNS identifier such as "alice.ust"
 * @returns The xpla address of the specified name, null if not resolvable
 */
export const useTnsAddress = (name: string) => {
  const lcd = useLCDClient();
  const { data: contracts } = useXplaContracts();

  return useQuery(
    [queryKey.TNS, name],
    async () => {
      if (!contracts) return;

      const { tnsRegistry: registry } = contracts;

      if (!registry) return;

      /**
       * Get the resolver address of a given domain name.
       *
       * @param name - A TNS identifier such as "alice.ust"
       * @returns The Resolver contract address of the specified name, null if the domain does not exist.
       *
       * @see https://docs.ens.domains/#ens-architecture for the role of Resolver Contract
       */
      const { resolver } = await lcd.wasm.contractQuery<{ resolver: string }>(
        registry,
        { get_record: { name } },
      );

      if (!resolver) return;

      const { address } = await lcd.wasm.contractQuery<{ address: string }>(
        resolver,
        { get_xpla_address: { node: node(name) } },
      );

      return address;
    },
    { ...RefetchOptions.INFINITY, enabled: name.endsWith('.ust') },
  );
};

/**
 * Resolve TNS name from a xpla address.
 *
 * @param address - A xpla address
 * @returns The TNS name of the specified address, null if not resolvable
 */
export const useTnsName = (address: string) => {
  const lcd = useLCDClient();
  const { data: contracts } = useXplaContracts();

  return useQuery(
    [queryKey.TNS, address],
    async () => {
      if (!contracts || !address) return;

      const { tnsReverseRecord: reverseRecord } = contracts;

      if (!reverseRecord) return;

      const { name } = await lcd.wasm.contractQuery<{ name: string | null }>(
        reverseRecord,
        { get_name: { address } },
      );

      return name;
    },
    { ...RefetchOptions.INFINITY, enabled: Boolean(contracts) },
  );
};

/**
 * Generate a unique hash for any valid domain name.
 *
 * @param name - A TNS identifier such as "alice.ust"
 * @returns The result of namehash function in a {@link Buffer} form
 *
 * @see https://docs.ens.domains/contract-api-reference/name-processing#hashing-names
 * for ENS Terminology
 *
 * @see https://eips.ethereum.org/EIPS/eip-137#namehash-algorithm
 * for namehash algorithm specification proposed in EIP-137
 */
function namehash(name: string): Buffer {
  if (name) {
    const [label, remainder] = name.split('.');
    return keccak256(Buffer.concat([namehash(remainder), keccak256(label)]));
  }

  return Buffer.from(''.padStart(64, '0'), 'hex');
}

/**
 * Generate the output of the namehash function in a form of number array
 * which is supported by the contract query.
 *
 * @param name - A TNS identifier such as "alice.ust"
 * @returns The result of namehash function in a number array format
 */
function node(name: string): number[] {
  return Array.from(Uint8Array.from(namehash(name)));
}
