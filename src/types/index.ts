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