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
    <div className='flex items-center justify-center gap-2.5 pointer-events-auto z-20'>
      {shortcuts
        .filter((s) => s && typeof s.url === 'string' && s.url.trim())
        .map((s) => (
          <a
            key={s.id || s.url}
            href={s.url}
            className='figma-glass-card h-[6.5vh] w-[6.5vh] min-h-[42px] min-w-[42px] rounded-full flex items-center justify-center text-white cursor-pointer transition-all'
            title={s.title || s.url}
          >
            {s.iconDataUrl || s.iconUrl ? (
              <img src={s.iconDataUrl || s.iconUrl} alt={s.title || ''} className='h-[3vh] w-[3vh] min-h-[20px] min-w-[20px] object-contain relative z-10' />
            ) : s.iconClass ? (
              <i className={`${s.iconClass} text-[2.8vh] text-white relative z-10`}></i>
            ) : (
              <i className='ri-link text-[2.8vh] text-white relative z-10'></i>
            )}
          </a>
        ))}
    </div>
  )
}

export default Taskbar