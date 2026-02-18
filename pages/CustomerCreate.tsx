import React, { useState } from 'react';
import { AppState, Customer } from '../types';
import TopMenu from '../components/TopMenu';
import AppLogo from '../components/AppLogo';
import { FormButton, FormInput, FormLabel, FormSelect } from '../components/form';

interface CustomerCreateProps {
  navigate: (page: AppState, customerId?: string | null) => void;
  customers: Customer[];
  onCreate: (customer: Customer) => void;
}

const onlyDigits = (value: string) => value.replace(/\D/g, '');

const formatPhone = (value: string) => {
  const d = onlyDigits(value).slice(0, 11);
  if (d.length <= 2) return d;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
};

const formatCPF = (value: string) => {
  const d = onlyDigits(value).slice(0, 11);
  if (d.length <= 3) return d;
  if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`;
  if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`;
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
};

const formatCNPJ = (value: string) => {
  const d = onlyDigits(value).slice(0, 14);
  if (d.length <= 2) return d;
  if (d.length <= 5) return `${d.slice(0, 2)}.${d.slice(2)}`;
  if (d.length <= 8) return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5)}`;
  if (d.length <= 12) return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8)}`;
  return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8, 12)}-${d.slice(12)}`;
};

const formatCEP = (value: string) => {
  const d = onlyDigits(value).slice(0, 8);
  if (d.length <= 5) return d;
  return `${d.slice(0, 5)}-${d.slice(5)}`;
};

const isValidCPF = (value: string) => {
  const cpf = onlyDigits(value);
  if (cpf.length !== 11) return false;
  if (/^(\d)\1+$/.test(cpf)) return false;
  let sum = 0;
  for (let i = 0; i < 9; i += 1) sum += Number(cpf[i]) * (10 - i);
  let rev = 11 - (sum % 11);
  if (rev >= 10) rev = 0;
  if (rev !== Number(cpf[9])) return false;
  sum = 0;
  for (let i = 0; i < 10; i += 1) sum += Number(cpf[i]) * (11 - i);
  rev = 11 - (sum % 11);
  if (rev >= 10) rev = 0;
  return rev === Number(cpf[10]);
};

const CustomerCreate: React.FC<CustomerCreateProps> = ({ navigate, customers, onCreate }) => {
  const [customerType, setCustomerType] = useState<'PF' | 'PJ'>('PF');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [birthday, setBirthday] = useState('');
  const [cpf, setCpf] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [establishmentName, setEstablishmentName] = useState('');
  const [cep, setCep] = useState('');
  const [street, setStreet] = useState('');
  const [number, setNumber] = useState('');
  const [district, setDistrict] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [complement, setComplement] = useState('');
  const [reference, setReference] = useState('');
  const [error, setError] = useState<string | null>(null);

  const phoneDigits = onlyDigits(phone);
  const cpfDigits = onlyDigits(cpf);
  const cnpjDigits = onlyDigits(cnpj);

  const hasRequiredFields = [
    name.trim().length >= 3,
    phoneDigits.length >= 10,
    establishmentName.trim().length >= 2,
    cep.length >= 8,
    street.trim().length >= 3,
    number.trim().length >= 1,
    district.trim().length >= 2,
    city.trim().length >= 2,
    state.trim().length === 2
  ].every(Boolean);

  const documentOk = customerType === 'PF'
    ? (cpfDigits.length === 0 || isValidCPF(cpfDigits))
    : cnpjDigits.length === 14;

  const isValid = hasRequiredFields && documentOk;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!isValid) {
      setError('Revise os campos obrigatórios e o documento informado.');
      return;
    }

    const duplicatedPhone = customers.some(c => onlyDigits(c.phone) === phoneDigits);
    if (duplicatedPhone) {
      setError('Já existe cliente com esse telefone.');
      return;
    }

    if (customerType === 'PF' && cpfDigits.length > 0) {
      const duplicatedCpf = customers.some(c => onlyDigits(c.cpf || '') === cpfDigits);
      if (duplicatedCpf) {
        setError('CPF já cadastrado.');
        return;
      }
    }

    const newCustomer: Customer = {
      id: `c${Date.now()}`,
      name: name.trim(),
      customerType,
      phone: phoneDigits,
      birthday: birthday.trim() || undefined,
      cpf: customerType === 'PF' ? (cpfDigits || undefined) : undefined,
      cnpj: customerType === 'PJ' ? (cnpjDigits || undefined) : undefined,
      establishmentName: establishmentName.trim(),
      serviceAddress: {
        cep: onlyDigits(cep),
        street: street.trim(),
        number: number.trim(),
        district: district.trim(),
        city: city.trim(),
        state: state.trim().toUpperCase(),
        complement: complement.trim() || undefined,
        reference: reference.trim() || undefined
      },
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDVszlZncxvjVAbz59MMfQPS1ujxF8aoL9GMmc0IuSnjtAD2xO891qhtPDhhparviKXCmVqkhWajBwGqZZI_7cUW4IlED4msssxAbK4p-SZ_C0gcrHNuujwKy9-GKUhS48ch8vcd_8R05hThAo6NxhQYIICC4jTlIyAsMGrctxRNQvPHsQT1MykOqmOfvhdP-f40iKzdnj1I3WYNAngdYoF3ygOTNaBqOwmz_2pn6jW_ydTbBcThhPOChQwY6TjtJOFYAlqESyrf-co',
      isFavorite: false,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    onCreate(newCustomer);
    navigate('customers');
  };

  return (
    <div className="pb-32">
      <header className="sticky top-0 z-50 bg-background-dark/80 backdrop-blur-xl safe-area-top">
        <div className="px-5 py-4 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <AppLogo className="w-9 h-9" />
              <h1 className="text-[12px] font-extrabold tracking-tight">Novo Cliente</h1>
            </div>
            <p className="text-xs text-primary/60 font-medium uppercase tracking-widest mt-0.5">Cadastro simples</p>
          </div>
          <button
            onClick={() => navigate('customers')}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 text-white/60"
          >
            <span className="material-icons-round">close</span>
          </button>
        </div>
        <div className="px-5 pb-4">
          <TopMenu active="create" navigate={navigate} />
        </div>
      </header>

      <main className="px-5 py-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <section className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-3">
            <h2 className="text-sm font-bold uppercase tracking-widest text-white/60">Cliente</h2>
            <div className="space-y-2">
              <FormLabel className="text-white/40">Tipo</FormLabel>
              <FormSelect value={customerType} onChange={(e) => setCustomerType(e.target.value as 'PF' | 'PJ')}>
                <option value="PF">Pessoa Física (PF)</option>
                <option value="PJ">Pessoa Jurídica (PJ)</option>
              </FormSelect>
            </div>
            <div className="space-y-2">
              <FormLabel className="text-white/40">Nome *</FormLabel>
              <FormInput
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Mariana Costa"
                required
              />
            </div>
            <div className="space-y-2">
              <FormLabel className="text-white/40">Telefone/WhatsApp *</FormLabel>
              <FormInput
                type="tel"
                value={formatPhone(phone)}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(11) 98877-6655"
                required
              />
            </div>
            <div className="space-y-2">
              <FormLabel className="text-white/40">Aniversário</FormLabel>
              <FormInput
                type="date"
                value={birthday}
                onChange={(e) => setBirthday(e.target.value)}
              />
            </div>
            {customerType === 'PF' ? (
              <div className="space-y-2">
                <FormLabel className="text-white/40">CPF (opcional)</FormLabel>
                <FormInput
                  type="text"
                  value={formatCPF(cpf)}
                  onChange={(e) => setCpf(e.target.value)}
                  placeholder="000.000.000-00"
                />
              </div>
            ) : (
              <div className="space-y-2">
                <FormLabel className="text-white/40">CNPJ *</FormLabel>
                <FormInput
                  type="text"
                  value={formatCNPJ(cnpj)}
                  onChange={(e) => setCnpj(e.target.value)}
                  placeholder="00.000.000/0000-00"
                  required
                />
              </div>
            )}
          </section>

          <section className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-3">
            <h2 className="text-sm font-bold uppercase tracking-widest text-white/60">Estabelecimento e Endereço</h2>
            <div className="space-y-2">
              <FormLabel className="text-white/40">Nome do estabelecimento *</FormLabel>
              <FormInput
                type="text"
                value={establishmentName}
                onChange={(e) => setEstablishmentName(e.target.value)}
                placeholder="Ex: Lanchonete da Mari"
                required
              />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2 space-y-2">
                <FormLabel className="text-white/40">CEP *</FormLabel>
                <FormInput
                  type="text"
                  value={formatCEP(cep)}
                  onChange={(e) => setCep(e.target.value)}
                  placeholder="00000-000"
                  required
                />
              </div>
              <div className="space-y-2">
                <FormLabel className="text-white/40">UF *</FormLabel>
                <FormInput
                  type="text"
                  value={state}
                  onChange={(e) => setState(e.target.value.toUpperCase().slice(0, 2))}
                  placeholder="SP"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <FormLabel className="text-white/40">Logradouro *</FormLabel>
              <FormInput
                type="text"
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                placeholder="Rua, avenida..."
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <FormLabel className="text-white/40">Número *</FormLabel>
                <FormInput
                  type="text"
                  value={number}
                  onChange={(e) => setNumber(e.target.value)}
                  placeholder="123"
                  required
                />
              </div>
              <div className="space-y-2">
                <FormLabel className="text-white/40">Bairro *</FormLabel>
                <FormInput
                  type="text"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  placeholder="Centro"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <FormLabel className="text-white/40">Cidade *</FormLabel>
              <FormInput
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="São Paulo"
                required
              />
            </div>
            <div className="space-y-2">
              <FormLabel className="text-white/40">Complemento</FormLabel>
              <FormInput
                type="text"
                value={complement}
                onChange={(e) => setComplement(e.target.value)}
                placeholder="Sala, bloco..."
              />
            </div>
            <div className="space-y-2">
              <FormLabel className="text-white/40">Ponto de referência</FormLabel>
              <FormInput
                type="text"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                placeholder="Em frente à praça..."
              />
            </div>
          </section>
          {error && <p className="text-red-400 text-sm font-semibold">{error}</p>}

          <FormButton
            type="submit"
            variant="contained"
            tone="primary"
            disabled={!isValid}
            className={`w-full h-14 rounded-2xl font-black text-sm uppercase tracking-widest transition-all ${
              isValid ? 'shadow-xl shadow-primary/20' : 'bg-white/5 text-white/20'
            }`}
          >
            Salvar
          </FormButton>
        </form>
      </main>
    </div>
  );
};

export default CustomerCreate;
