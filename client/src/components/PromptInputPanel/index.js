import { useState } from 'react';

export default function PromptInputPanel({ onGenerate, loading }) {
  const [prompt, setPrompt] = useState('Read invoice emails, append the details to a Google Sheet, then send a Slack notification.');
  return <section className="mb-5 rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-4"><label className="block text-sm font-medium">Describe the automation you need</label><div className="mt-2 flex flex-col gap-3 md:flex-row"><textarea className="min-h-20 flex-1 rounded-lg border border-slate-700 bg-slate-950 p-3 text-sm outline-none focus:border-cyan-400" value={prompt} onChange={(event) => setPrompt(event.target.value)} /><button disabled={loading || prompt.trim().length < 3} className="bg-cyan-500 text-slate-950 hover:bg-cyan-400" onClick={() => onGenerate(prompt)}>{loading ? 'Generating…' : 'Generate graph'}</button></div></section>;
}
