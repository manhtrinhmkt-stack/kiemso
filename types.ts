
export interface CheckResult {
  id: string;
  number: string;
  isValid: boolean;
  timestamp: Date;
}

export interface FileData {
  name: string;
  count: number;
  numbers: Set<string>;
}
