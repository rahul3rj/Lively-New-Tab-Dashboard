import React from 'react'

const DEFAULT_SHORTCUTS = [
  { id: 'gemini', title: 'Gemini', url: 'https://gemini.google.com', iconClass: 'ri-gemini-fill' },
  { id: 'claude', title: 'Claude', url: 'https://claude.ai', iconClass: 'ri-claude-fill' },
  { id: 'copilot', title: 'Copilot', url: 'https://copilot.microsoft.com', iconClass: 'ri-copilot-fill' },
  { id: 'openai', title: 'OpenAI', url: 'https://chat.openai.com', iconClass: 'ri-openai-fill' },
  { id: 'perplexity', title: 'Perplexity', url: 'https://perplexity.ai', iconClass: 'ri-perplexity-fill' },
  { id: 'deepseek', title: 'DeepSeek', url: 'https://chat.deepseek.com/', iconClass: 'ri-deepseek-fill' },
  {
    id: 'higgsfield',
    title: 'Higgsfield AI',
    url: 'https://higgsfield.ai',
    iconUrl: 'https://higgsfield.ai/favicon.ico',
  },
]

const Taskbar = ({ shortcuts = DEFAULT_SHORTCUTS }) => {
  return (
    <div className='h-12 w-full flex items-center justify-center gap-10 px-4'>
      {shortcuts
        .filter((s) => s && typeof s.url === 'string' && s.url.trim())
        .map((s) => (
          <a
            key={s.id || s.url}
            href={s.url}
            className='h-12 w-12 rounded-xl cursor-pointer bg-[color:var(--theme)]/36 backdrop-blur-md flex items-center justify-center hover:bg-[#4C4C5C] transition-all duration-200 hover:scale-110'
            title={s.title || s.url}
          >
            {s.iconDataUrl || s.iconUrl ? (
              <img src={s.iconDataUrl || s.iconUrl} alt={s.title || ''} className='h-6 w-6 object-contain' />
            ) : s.iconClass ? (
              <i className={`${s.iconClass} text-2xl text-white`}></i>
            ) : (
              <i className='ri-link text-2xl text-white'></i>
            )}
          </a>
        ))}
    </div>
  )
}

export default Taskbar