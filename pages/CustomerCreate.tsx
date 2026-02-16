import React, { useState } from 'react';
import { AppState, Customer } from '../types';
import TopMenu from '../components/TopMenu';
import AppLogo from '../components/AppLogo';

interface CustomerCreateProps {
  navigate: (page: AppState, customerId?: string | null) => void;
  onCreate: (customer: Customer) => void;
}

const CustomerCreate: React.FC<CustomerCreateProps> = ({ navigate, onCreate }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [birthday, setBirthday] = useState('');
  const [cpf, setCpf] = useState('');

  const isValid = name.trim().length > 0 && phone.trim().length > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    const newCustomer: Customer = {
      id: `c${Date.now()}`,
      name: name.trim(),
      phone: phone.trim(),
      birthday: birthday.trim() || undefined,
      cpf: cpf.trim() || undefined,
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
      <header className="sticky top-0 z-50 bg-background-dark/80 backdrop-blur-xl border-b border-primary/10 safe-area-top">
        <div className="px-5 py-4 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <AppLogo className="w-9 h-9" />
              <h1 className="text-2xl font-extrabold tracking-tight">Novo Cliente</h1>
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
          <div className="space-y-2">
            <label className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Nome *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm"
              placeholder="Ex: Mariana Costa"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Telefone *</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm"
              placeholder="Ex: +55 11 98877-6655"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Aniversário</label>
            <input
              type="date"
              value={birthday}
              onChange={(e) => setBirthday(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] text-white/40 uppercase tracking-widest font-bold">CPF</label>
            <input
              type="text"
              value={cpf}
              onChange={(e) => setCpf(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm"
              placeholder="Somente números (opcional)"
            />
          </div>

          <button
            type="submit"
            disabled={!isValid}
            className={`w-full h-14 rounded-2xl font-black text-sm uppercase tracking-widest transition-all ${
              isValid
                ? 'bg-primary text-background-dark shadow-xl shadow-primary/20'
                : 'bg-white/5 text-white/20 cursor-not-allowed'
            }`}
          >
            Salvar
          </button>
        </form>
      </main>
    </div>
  );
};

export default CustomerCreate;
