export function validateCPF(cpf: string): { valid: boolean; message: string } {
  const d = cpf.replace(/\D/g, '');
  if (!d) return { valid: false, message: 'CPF é obrigatório' };
  if (d.length !== 11) return { valid: false, message: 'CPF incompleto — são 11 dígitos' };
  if (/^(\d)\1{10}$/.test(d)) return { valid: false, message: 'CPF inválido' };

  let sum = 0;
  for (let i = 0; i < 9; i++) sum += parseInt(d[i]) * (10 - i);
  let r = (sum * 10) % 11;
  if (r === 10 || r === 11) r = 0;
  if (r !== parseInt(d[9])) return { valid: false, message: 'CPF inválido — verifique os dígitos' };

  sum = 0;
  for (let i = 0; i < 10; i++) sum += parseInt(d[i]) * (11 - i);
  r = (sum * 10) % 11;
  if (r === 10 || r === 11) r = 0;
  if (r !== parseInt(d[10])) return { valid: false, message: 'CPF inválido — verifique os dígitos' };

  return { valid: true, message: '' };
}

export function validateCNPJ(cnpj: string): { valid: boolean; message: string } {
  const d = cnpj.replace(/\D/g, '');
  if (!d) return { valid: false, message: 'CNPJ é obrigatório' };
  if (d.length !== 14) return { valid: false, message: 'CNPJ incompleto — são 14 dígitos' };
  if (/^(\d)\1{13}$/.test(d)) return { valid: false, message: 'CNPJ inválido' };

  const calc = (str: string, weights: number[]) => {
    let sum = 0;
    for (let i = 0; i < weights.length; i++) sum += parseInt(str[i]) * weights[i];
    const r = sum % 11;
    return r < 2 ? 0 : 11 - r;
  };

  const w1 = [5,4,3,2,9,8,7,6,5,4,3,2];
  const w2 = [6,5,4,3,2,9,8,7,6,5,4,3,2];

  if (calc(d, w1) !== parseInt(d[12])) return { valid: false, message: 'CNPJ inválido — verifique os dígitos' };
  if (calc(d, w2) !== parseInt(d[13])) return { valid: false, message: 'CNPJ inválido — verifique os dígitos' };

  return { valid: true, message: '' };
}

export function validateEmail(email: string): { valid: boolean; message: string } {
  if (!email || !email.trim()) return { valid: false, message: 'E-mail é obrigatório' };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
    return { valid: false, message: 'E-mail inválido' };
  return { valid: true, message: '' };
}

export function validatePhone(phone: string): { valid: boolean; message: string } {
  const d = phone.replace(/\D/g, '');
  if (!d) return { valid: false, message: 'Telefone é obrigatório' };
  if (d.length < 10) return { valid: false, message: 'Telefone incompleto' };
  return { valid: true, message: '' };
}

export function validateCEP(cep: string): { valid: boolean; message: string } {
  const d = cep.replace(/\D/g, '');
  if (!d) return { valid: false, message: 'CEP é obrigatório' };
  if (d.length !== 8) return { valid: false, message: 'CEP incompleto — são 8 dígitos' };
  return { valid: true, message: '' };
}

export function validateRequired(value: string, fieldName: string): { valid: boolean; message: string } {
  if (!value || !value.trim()) return { valid: false, message: `${fieldName} é obrigatório` };
  return { valid: true, message: '' };
}
