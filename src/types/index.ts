export interface Profile {
  id: string;
  name: string;
  typeName: string;
  characteristics: Array<{
    name: string;
    $text: string;
  }>;
  sourceUnit?: string;
}

export type { Datasheet, LinkedUnit } from './datasheet'; 