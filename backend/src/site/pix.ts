function toPixAmount(value: string | number): string {
  const normalized = String(value).replace(/[^\d.,-]/g, '').replace(',', '.');
  const numericValue = Number(normalized);
  if (!Number.isFinite(numericValue) || numericValue <= 0) {
    throw new Error('Valor inválido para PIX.');
  }

  return numericValue.toFixed(2);
}

function sanitizePixAns(value: string, maxLength: number): string {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .replace(/[^A-Z0-9 .\-]/g, '')
    .trim()
    .slice(0, maxLength);
}

function toField(fieldId: string, value: string): string {
  const content = String(value);
  return `${fieldId}${String(content.length).padStart(2, '0')}${content}`;
}

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

export function generatePixPayload({
  chave,
  nome,
  cidade,
  valor,
}: {
  chave: string;
  nome: string;
  cidade: string;
  valor?: string | number;
}): string {
  const normalizedKey = String(chave || '').trim();
  const normalizedName = sanitizePixAns(nome, 25);
  const normalizedCity = sanitizePixAns(cidade, 15);
  const hasAmount = valor !== undefined && valor !== null && String(valor).trim() !== '';
  const normalizedValue = hasAmount ? toPixAmount(valor) : '';

  if (!normalizedKey || !normalizedName || !normalizedCity) {
    throw new Error('Preencha todos os dados para gerar o PIX.');
  }

  if (hasAmount && !normalizedValue) {
    throw new Error('Valor inválido para PIX.');
  }

  const merchantAccountInfo = `${toField('00', 'br.gov.bcb.pix')}${toField('01', normalizedKey)}`;
  const payloadFields = [
    toField('00', '01'),
    ...(hasAmount ? [toField('01', '11')] : []),
    toField('26', merchantAccountInfo),
    toField('52', '0000'),
    toField('53', '986'),
    ...(hasAmount ? [toField('54', normalizedValue)] : []),
    toField('58', 'BR'),
    toField('59', normalizedName),
    toField('60', normalizedCity),
    toField('62', toField('05', '***')),
  ];
  const payloadWithoutCrc = payloadFields.join('');

  const crc = crc16CcittFalse(`${payloadWithoutCrc}6304`);
  return `${payloadWithoutCrc}6304${crc}`;
}
