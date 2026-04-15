export function validateCPF(cpf: string): { valid: boolean; message: string } {
  const cleaned = cpf.replace(/\D/g, '');

  if (!cleaned) {
    return { valid: false, message: 'O campo CPF está vazio' };
  }

  if (cleaned.length !== 11) {
    return { valid: false, message: 'Olha, você errou no CPF, revise' };
  }

  if (/^(\d)\1{10}$/.test(cleaned)) {
    return { valid: false, message: 'Olha, você errou no CPF, revise' };
  }

  let sum = 0;
  let remainder = 0;

  for (let i = 1; i <= 9; i++) {
    sum += parseInt(cleaned.substring(i - 1, i)) * (11 - i);
  }

  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleaned.substring(9, 10))) {
    return { valid: false, message: 'Olha, você errou no CPF, revise' };
  }

  sum = 0;
  for (let i = 1; i <= 10; i++) {
    sum += parseInt(cleaned.substring(i - 1, i)) * (12 - i);
  }

  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleaned.substring(10, 11))) {
    return { valid: false, message: 'Olha, você errou no CPF, revise' };
  }

  return { valid: true, message: '' };
}

export function validateCEP(cep: string): { valid: boolean; message: string } {
  const cleaned = cep.replace(/\D/g, '');

  if (!cleaned) {
    return { valid: false, message: 'Está faltando algo no CEP' };
  }

  if (cleaned.length !== 8) {
    return { valid: false, message: 'Está faltando algo no CEP' };
  }

  return { valid: true, message: '' };
}

export function validateEmail(email: string): { valid: boolean; message: string } {
  if (!email || email.trim().length === 0) {
    return { valid: false, message: 'O campo E-mail está vazio' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { valid: false, message: 'E-mail inválido, revise' };
  }

  return { valid: true, message: '' };
}

export function validatePhone(phone: string): { valid: boolean; message: string } {
  const cleaned = phone.replace(/\D/g, '');

  if (!cleaned) {
    return { valid: false, message: 'O campo Telefone está vazio' };
  }

  if (cleaned.length < 10) {
    return { valid: false, message: 'Está faltando algo no Telefone' };
  }

  return { valid: true, message: '' };
}

export function validateCNPJ(cnpj: string): { valid: boolean; message: string } {
  const cleaned = cnpj.replace(/\D/g, '');

  if (!cleaned) {
    return { valid: false, message: 'O campo CNPJ está vazio' };
  }

  if (cleaned.length !== 14) {
    return { valid: false, message: 'Olha, você errou no CNPJ, revise' };
  }

  if (/^(\d)\1{13}$/.test(cleaned)) {
    return { valid: false, message: 'Olha, você errou no CNPJ, revise' };
  }

  // Validar dígito verificador
  let sum = 0;
  let multiplier = 5;

  for (let i = 0; i < 12; i++) {
    sum += parseInt(cleaned[i]) * multiplier;
    multiplier = multiplier === 2 ? 9 : multiplier - 1;
  }

  let remainder = sum % 11;
  let firstDigit = remainder < 2 ? 0 : 11 - remainder;

  if (parseInt(cleaned[12]) !== firstDigit) {
    return { valid: false, message: 'Olha, você errou no CNPJ, revise' };
  }

  sum = 0;
  multiplier = 6;

  for (let i = 0; i < 13; i++) {
    sum += parseInt(cleaned[i]) * multiplier;
    multiplier = multiplier === 2 ? 9 : multiplier - 1;
  }

  remainder = sum % 11;
  let secondDigit = remainder < 2 ? 0 : 11 - remainder;

  if (parseInt(cleaned[13]) !== secondDigit) {
    return { valid: false, message: 'Olha, você errou no CNPJ, revise' };
  }

  return { valid: true, message: '' };
}

export function validateRequired(value: string, fieldName: string): { valid: boolean; message: string } {
  if (!value || value.trim().length === 0) {
    return { valid: false, message: `O campo ${fieldName} está vazio` };
  }

  return { valid: true, message: '' };
}
