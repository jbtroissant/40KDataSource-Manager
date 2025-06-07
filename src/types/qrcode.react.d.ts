declare module 'qrcode.react' {
  import { Component } from 'react';

  interface QRCodeProps {
    value: string;
    size?: number;
    level?: 'L' | 'M' | 'Q' | 'H';
    bgColor?: string;
    fgColor?: string;
    style?: React.CSSProperties;
    includeMargin?: boolean;
    imageSettings?: {
      src: string;
      height: number;
      width: number;
      excavate: boolean;
    };
  }

  export class QRCodeSVG extends Component<QRCodeProps> {}
  export class QRCodeCanvas extends Component<QRCodeProps> {}
} 