import React, { useMemo, useState } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight, Clock3, MapPin, Pencil, Plus, Trash2, Users } from 'lucide-react';
import { AgendaEvent, Divisao, EventType } from '../types';

interface AgendaViewProps {
  events: AgendaEvent[];
  divisoes: Divisao[];
  isAdmin: boolean;
  onRequireAdmin: () => void;
  onSaveEvent: (event: AgendaEvent) => void;
  onDeleteEvent: (eventId: string) => void;
}

const EVENT_TYPES: { value: EventType; label: string; color: string }[] = [
  { value: 'REUNIAO', label: 'Reunião', color: 'border-amber-700/70 bg-amber-950/30 text-amber-300' },
  { value: 'COMBOIO', label: 'Comboio', color: 'border-red-700/70 bg-red-950/30 text-red-300' },
  { value: 'EVENTO', label: 'Evento', color: 'border-blue-700/70 bg-blue-950/30 text-blue-300' },
  { value: 'TREINAMENTO', label: 'Treinamento', color: 'border-emerald-700/70 bg-emerald-950/30 text-emerald-300' },
  { value: 'OUTRO', label: 'Outro', color: 'border-zinc-700 bg-zinc-900 text-zinc-300' }
];

const toDateInput = (date: Date) => date.toISOString().slice(0, 10);
const monthLabel = (date: Date) => date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
const formatEventDate = (date: string) => new Date(`${date}T12:00:00`).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });

export const AgendaView: React.FC<AgendaViewProps> = ({ events, divisoes, isAdmin, onRequireAdmin, onSaveEvent, onDeleteEvent }) => {
  const [currentMonth, setCurrentMonth] = useState(() => new Date());
  const [editingEvent, setEditingEvent] = useState<AgendaEvent | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [typeFilter, setTypeFilter] = useState<EventType | 'TODOS'>('TODOS');

  const monthEvents = useMemo(() => events
    .filter(event => {
      const eventDate = new Date(`${event.date}T12:00:00`);
      return eventDate.getMonth() === currentMonth.getMonth() && eventDate.getFullYear() === currentMonth.getFullYear();
    })
    .filter(event => typeFilter === 'TODOS' || event.type === typeFilter)
    .sort((a, b) => `${a.date}${a.time || ''}`.localeCompare(`${b.date}${b.time || ''}`)), [events, currentMonth, typeFilter]);

  const openNewEvent = () => {
    if (!isAdmin) { onRequireAdmin(); return; }
    setEditingEvent(null);
    setIsFormOpen(true);
  };

  const openEditEvent = (event: AgendaEvent) => {
    if (!isAdmin) { onRequireAdmin(); return; }
    setEditingEvent(event);
    setIsFormOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-gradient-to-r from-[#141720] via-[#1a1e29] to-[#141720] border border-zinc-800 p-6 rounded-2xl shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1"><CalendarDays size={16} className="text-red-400" /><span className="text-xs uppercase font-bold tracking-widest text-red-400">Planejamento operacional</span></div>
          <h2 className="text-2xl font-black text-white font-cinzel tracking-wide">Agenda de Eventos</h2>
          <p className="text-xs text-zinc-400 mt-1">Reuniões, comboios, treinamentos e compromissos das divisões em um só lugar.</p>
        </div>
        <button type="button" onClick={openNewEvent} className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-black uppercase tracking-wider shadow-lg shadow-red-950/40"><Plus size={16} /> Novo evento</button>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button type="button" aria-label="Mês anterior" onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))} className="p-2 rounded-lg border border-zinc-800 bg-[#12151c] text-zinc-300 hover:text-white"><ChevronLeft size={18} /></button>
          <h3 className="min-w-44 text-center text-lg font-bold text-white capitalize">{monthLabel(currentMonth)}</h3>
          <button type="button" aria-label="Próximo mês" onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))} className="p-2 rounded-lg border border-zinc-800 bg-[#12151c] text-zinc-300 hover:text-white"><ChevronRight size={18} /></button>
        </div>
        <select value={typeFilter} onChange={event => setTypeFilter(event.target.value as EventType | 'TODOS')} className="bg-[#12151c] border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-200 outline-none focus:border-red-600"><option value="TODOS">Todos os tipos</option>{EVENT_TYPES.map(type => <option key={type.value} value={type.value}>{type.label}</option>)}</select>
      </div>

      {monthEvents.length === 0 ? (
        <div className="border border-dashed border-zinc-800 rounded-2xl py-16 text-center"><CalendarDays size={32} className="mx-auto text-zinc-600 mb-3" /><p className="text-sm text-zinc-400">Nenhum evento neste mês.</p><button type="button" onClick={openNewEvent} className="mt-4 text-xs font-bold text-red-400 hover:text-red-300">Adicionar primeiro evento</button></div>
      ) : (
        <div className="grid gap-3">{monthEvents.map(event => {
          const eventType = EVENT_TYPES.find(type => type.value === event.type) || EVENT_TYPES[4];
          const division = divisoes.find(item => item.id === event.divisaoId);
          return <article key={event.id} className="bg-[#12151c] border border-zinc-800 rounded-xl p-4 flex flex-col md:flex-row md:items-center gap-4 hover:border-zinc-700 transition">
            <div className="w-20 shrink-0 text-center border-r border-zinc-800 pr-4"><strong className="block text-2xl text-white font-cinzel">{new Date(`${event.date}T12:00:00`).getDate()}</strong><span className="text-[10px] text-zinc-500 uppercase">{formatEventDate(event.date).split(' ')[1]}</span></div>
            <div className="flex-1 min-w-0"><div className="flex flex-wrap items-center gap-2"><span className={`px-2 py-1 rounded-md border text-[10px] font-bold uppercase ${eventType.color}`}>{eventType.label}</span><h4 className="text-base font-bold text-white truncate">{event.title}</h4></div><div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-zinc-400"><span className="inline-flex items-center gap-1"><Clock3 size={13} />{event.time || 'Horário não definido'}</span>{event.location && <span className="inline-flex items-center gap-1"><MapPin size={13} />{event.location}</span>}{division && <span className="inline-flex items-center gap-1"><Users size={13} />{division.name}</span>}</div>{event.description && <p className="text-xs text-zinc-500 mt-2">{event.description}</p>}{event.acontecimentos && <p className="text-xs text-amber-300/90 mt-2"><strong>Acontecimentos:</strong> {event.acontecimentos}</p>}</div>
            <div className="flex items-center gap-2 self-end md:self-center"><button type="button" onClick={() => openEditEvent(event)} aria-label={`Editar ${event.title}`} className="p-2 rounded-lg border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-600"><Pencil size={15} /></button><button type="button" onClick={() => isAdmin ? onDeleteEvent(event.id) : onRequireAdmin()} aria-label={`Excluir ${event.title}`} className="p-2 rounded-lg border border-zinc-800 text-zinc-400 hover:text-red-400 hover:border-red-900"><Trash2 size={15} /></button></div>
          </article>;
        })}</div>
      )}

      {isFormOpen && <EventForm event={editingEvent} divisoes={divisoes} onClose={() => setIsFormOpen(false)} onSave={(event) => { onSaveEvent(event); setIsFormOpen(false); }} />}
    </div>
  );
};

const EventForm: React.FC<{ event: AgendaEvent | null; divisoes: Divisao[]; onClose: () => void; onSave: (event: AgendaEvent) => void }> = ({ event, divisoes, onClose, onSave }) => {
  const [form, setForm] = useState<AgendaEvent>(event || { id: `event-${Date.now()}`, title: '', date: toDateInput(new Date()), time: '', type: 'REUNIAO', location: '', divisaoId: '', description: '', acontecimentos: '', createdAt: new Date().toISOString() });
  const update = (field: keyof AgendaEvent, value: string) => setForm(current => ({ ...current, [field]: value }));
  const submit = (eventObject: React.FormEvent) => { eventObject.preventDefault(); if (form.title.trim() && form.date) onSave({ ...form, title: form.title.trim() }); };
  return <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"><form onSubmit={submit} className="w-full max-w-xl bg-[#11141a] border border-zinc-700 rounded-2xl shadow-2xl p-6 space-y-4"><div className="flex items-center justify-between"><h3 className="text-lg font-bold text-white">{event ? 'Editar evento' : 'Novo evento'}</h3><button type="button" onClick={onClose} className="text-zinc-500 hover:text-white text-xl">×</button></div><div className="grid sm:grid-cols-2 gap-3"><label className="sm:col-span-2 text-xs text-zinc-400">Título<input required value={form.title} onChange={event => update('title', event.target.value)} className="mt-1 w-full bg-[#0d0f14] border border-zinc-800 rounded-lg p-2.5 text-sm text-white outline-none focus:border-red-600" placeholder="Ex.: Reunião mensal da diretoria" /></label><label className="text-xs text-zinc-400">Data<input required type="date" value={form.date} onChange={event => update('date', event.target.value)} className="mt-1 w-full bg-[#0d0f14] border border-zinc-800 rounded-lg p-2.5 text-sm text-white" /></label><label className="text-xs text-zinc-400">Horário<input type="time" value={form.time || ''} onChange={event => update('time', event.target.value)} className="mt-1 w-full bg-[#0d0f14] border border-zinc-800 rounded-lg p-2.5 text-sm text-white" /></label><label className="text-xs text-zinc-400">Tipo<select value={form.type} onChange={event => update('type', event.target.value)} className="mt-1 w-full bg-[#0d0f14] border border-zinc-800 rounded-lg p-2.5 text-sm text-white">{EVENT_TYPES.map(type => <option key={type.value} value={type.value}>{type.label}</option>)}</select></label><label className="text-xs text-zinc-400">Divisão<select value={form.divisaoId || ''} onChange={event => update('divisaoId', event.target.value)} className="mt-1 w-full bg-[#0d0f14] border border-zinc-800 rounded-lg p-2.5 text-sm text-white"><option value="">Todas / Geral</option>{divisoes.map(division => <option key={division.id} value={division.id}>{division.name}</option>)}</select></label><label className="sm:col-span-2 text-xs text-zinc-400">Local<input value={form.location || ''} onChange={event => update('location', event.target.value)} className="mt-1 w-full bg-[#0d0f14] border border-zinc-800 rounded-lg p-2.5 text-sm text-white" placeholder="Sede, cidade ou ponto de encontro" /></label><label className="sm:col-span-2 text-xs text-zinc-400">Observações<textarea value={form.description || ''} onChange={event => update('description', event.target.value)} rows={3} className="mt-1 w-full bg-[#0d0f14] border border-zinc-800 rounded-lg p-2.5 text-sm text-white resize-none" /></label><label className="sm:col-span-2 text-xs text-zinc-400">Acontecimentos<textarea value={form.acontecimentos || ''} onChange={event => update('acontecimentos', event.target.value)} rows={3} className="mt-1 w-full bg-[#0d0f14] border border-amber-900/60 rounded-lg p-2.5 text-sm text-white resize-none" placeholder="Registre o que aconteceu, decisões ou ocorrências relacionadas." /></label></div><div className="flex justify-end gap-2 pt-2"><button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border border-zinc-800 text-xs font-bold text-zinc-300 hover:text-white">Cancelar</button><button type="submit" className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-xs font-bold text-white">Salvar evento</button></div></form></div>;
};