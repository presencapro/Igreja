import { generatePixPayload } from './pix';

function crc16CcittFalse(payload: string): string {
  let crc = 0xffff;

  for (let index = 0; index < payload.length; index += 1) {
    crc ^= payload.charCodeAt(index) << 8;

    for (let bit = 0; bit < 8; bit += 1) {
      if (crc & 0x8000) {
        crc = (crc << 1) ^ 0x1021;
      } else {
        crc <<= 1;
      }
      crc &= 0xffff;
    }
  }

  return crc.toString(16).toUpperCase().padStart(4, '0');
}

function hasValidCrc(payload: string): boolean {
  return payload.slice(-4) === crc16CcittFalse(payload.slice(0, -4));
}

describe('generatePixPayload', () => {
  it('calcula CRC conforme exemplo estático do BACEN', () => {
    const payloadWithoutCrc =
      '00020126580014br.gov.bcb.pix0136123e4567-e12b-12d1-a456-4266554400005204000053039865802BR5913Fulano de Tal6008BRASILIA62070503***';

    expect(crc16CcittFalse(`${payloadWithoutCrc}6304`)).toBe('1D3D');
  });

  it('gera payload de doação com valor decimal e CRC válido', () => {
    const payload = generatePixPayload({
      chave: 'escadariamatriz@gmail.com',
      nome: 'Paróquia Nossa Senhora do Carmo - Paraopeba',
      cidade: 'PARAOPEBA',
      valor: '10',
    });

    expect(payload).toContain('010211');
    expect(payload).toContain('540510.00');
    expect(hasValidCrc(payload)).toBe(true);
  });
});
