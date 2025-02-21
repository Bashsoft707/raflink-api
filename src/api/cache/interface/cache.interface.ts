import { GenericMatch } from '../../../interfaces';
import { RegisterCacheDto } from '../dto/cache.dto';

export interface ICache {
  save(payload: RegisterCacheDto): void;
  get(key: string): Promise<GenericMatch>;
  delete(key: string): void;
}
