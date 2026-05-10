import { Pencil, Trash2 } from 'lucide-react';
import type { Provider } from '../types';

interface Props {
  providers: Provider[];
  activeId: string | null;
  onSelect: (p: Provider) => void;
  onEdit: (p: Provider) => void;
  onDelete: (id: string) => void;
}

export default function ProviderList({ providers, activeId, onSelect, onEdit, onDelete }: Props) {
  if (providers.length === 0) {
    return <div className="provider-list empty-state" style={{ fontSize: 13, padding: 16, textAlign: 'center' }}>暂无提供商，点击下方新增</div>;
  }

  return (
    <div className="provider-list">
      {providers.map(p => (
        <div
          key={p.id}
          className={`provider-item ${p.id === activeId ? 'active' : ''}`}
          onClick={() => onSelect(p)}
        >
          <span className="name">{p.name}</span>
          <span className="actions">
            <button className="icon-btn" onClick={e => { e.stopPropagation(); onEdit(p); }} title="编辑"><Pencil size={14} /></button>
            <button className="icon-btn danger" onClick={e => { e.stopPropagation(); onDelete(p.id); }} title="删除"><Trash2 size={14} /></button>
          </span>
        </div>
      ))}
    </div>
  );
}
