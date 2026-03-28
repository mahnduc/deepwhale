export * from './types';
export { OpfsRepository } from './opfsRepository';
export { OpfsCore } from './OpfsCore';
import { OpfsCore } from './OpfsCore';
import { OpfsRepository } from './opfsRepository';

export const getStorage = () => OpfsRepository.getInstance();