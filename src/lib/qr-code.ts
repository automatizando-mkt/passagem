import QRCode from "qrcode";

export async function generateQRDataURL(passagemId: string): Promise<string> {
  const url = `${process.env.NEXT_PUBLIC_APP_URL || ""}/validar/${passagemId}`;
  return QRCode.toDataURL(url, { width: 200, margin: 2 });
}
