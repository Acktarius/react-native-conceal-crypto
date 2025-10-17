import { NitroModules } from 'react-native-nitro-modules';
import type { ConcealCrypto } from './specs/ConcealCrypto.nitro';

const concealCrypto = NitroModules.createHybridObject<ConcealCrypto>('ConcealCrypto');
export default concealCrypto;
