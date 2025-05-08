export interface IUnset {
  $unset: string[];
}
export interface ISkip {
  $skip: number;
}
export interface ILimit {
  $limit: number;
}

export interface DomainCheckResult {
  domain: string;
  isAvailable: boolean;
  price?: number;
}

export interface DomainSuggestion {
  domain: string;
  isAvailable: boolean;
  price?: number;
  tld?: string;
}
