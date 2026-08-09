const catalogue = [
  ['Triggers', [['manual-trigger', 'Manual trigger'], ['schedule-trigger', 'Schedule trigger']]],
  ['Actions', [['gmail-send', 'Send email'], ['slack-message', 'Post Slack message'], ['discord-message', 'Post Discord message'], ['sheets-append', 'Append sheet row']]],
  ['AI nodes', [['ai-prompt', 'AI prompt']]],
  ['Logic', [['condition', 'Condition']]]
];

export default function NodePalette({ onAdd }) {
  return <aside className="space-y-5 rounded-xl border border-slate-800 bg-slate-900/50 p-4"><h2 className="font-semibold">Node palette</h2>{catalogue.map(([group, items]) => <section key={group}><h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">{group}</h3><div className="space-y-2">{items.map(([type, label]) => <button key={type} className="w-full bg-slate-800 text-left text-sm text-slate-200 hover:bg-slate-700" onClick={() => onAdd(type, label)}>{label}</button>)}</div></section>)}</aside>;
}
