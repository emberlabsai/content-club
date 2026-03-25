import { useState, useRef, useEffect } from 'react'
import type { ChatMessage } from '../../types'
import { chatWithGemini } from '../../api/client'
import { SendIcon, CopyIcon, SparklesIcon, WandIcon } from '../common/Icons'

interface ChatViewProps {
  onUseAsPrompt?: (text: string) => void
}

export default function ChatView({ onUseAsPrompt }: ChatViewProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [model, setModel] = useState('gemini-2.5-flash')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    const el = textareaRef.current
    if (el) {
      el.style.height = 'auto'
      el.style.height = `${Math.min(el.scrollHeight, 120)}px`
    }
  }, [input])

  const handleSend = async () => {
    const text = input.trim()
    if (!text || isLoading) return

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: text,
      timestamp: Date.now(),
    }

    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setIsLoading(true)

    try {
      const apiMessages = [...messages, userMsg].map((m) => ({
        role: m.role,
        content: m.content,
      }))
      const response = await chatWithGemini(apiMessages, model)

      const assistantMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: response,
        timestamp: Date.now(),
      }
      setMessages((prev) => [...prev, assistantMsg])
    } catch (err) {
      const errMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: `Error: ${err instanceof Error ? err.message : 'Something went wrong'}`,
        timestamp: Date.now(),
      }
      setMessages((prev) => [...prev, errMsg])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const quickPrompts = [
    'Help me write a VEO prompt for a luxury handbag reveal',
    'Brainstorm 3 creative video concepts for a fashion brand lookbook',
    'Write an Imagen prompt for editorial fashion photography',
  ]

  return (
    <div className="h-full flex flex-col animate-fade-in">
      {/* Header */}
      <div className="p-6 pb-4 border-b border-white/[0.06]">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <SparklesIcon className="w-5 h-5 text-champagne/60" />
              <h2 className="serif text-2xl font-light tracking-tight text-ivory">Chat</h2>
            </div>
            <p className="text-xs text-stone/50 ml-8">
              Brainstorm with Gemini — craft prompts, explore concepts, plan content
            </p>
          </div>
          <select
            value={model}
            onChange={(e) => setModel(e.target.value)}
            className="bg-white/[0.03] border border-white/[0.06] rounded-lg px-3 py-1.5 text-xs text-ivory appearance-none hover:border-white/10 transition-all"
          >
            <option value="gemini-2.5-flash">Gemini 2.5 Flash</option>
            <option value="gemini-2.5-pro-preview-05-06">Gemini 2.5 Pro</option>
          </select>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <span className="text-stone/10 text-6xl mb-6">✦</span>
            <h3 className="serif text-xl font-light text-ivory/60 mb-2">
              Start a Conversation
            </h3>
            <p className="text-xs text-stone/40 max-w-sm mb-8">
              Chat with Gemini to brainstorm video concepts, craft the perfect VEO prompt,
              or plan image generation for your clients.
            </p>
            <div className="space-y-2 w-full max-w-md">
              {quickPrompts.map((qp, i) => (
                <button
                  key={i}
                  onClick={() => setInput(qp)}
                  className="w-full text-left p-3 bg-white/[0.02] border border-white/[0.06] rounded-lg text-xs text-ivory/60 hover:border-champagne/20 hover:text-ivory hover:bg-champagne/[0.03] transition-all"
                >
                  <WandIcon className="w-3 h-3 inline mr-2 text-champagne/40" />
                  {qp}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-xl px-4 py-3 ${
                msg.role === 'user'
                  ? 'bg-champagne/10 border border-champagne/15 text-ivory'
                  : 'bg-white/[0.03] border border-white/[0.06] text-ivory/80'
              }`}
            >
              {msg.role === 'assistant' && (
                <div className="flex items-center gap-1.5 mb-2">
                  <SparklesIcon className="w-3 h-3 text-champagne/50" />
                  <span className="text-[9px] uppercase tracking-wider text-champagne/50 font-medium">Gemini</span>
                </div>
              )}
              <div className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</div>
              {msg.role === 'assistant' && (
                <div className="flex items-center gap-2 mt-3 pt-2 border-t border-white/[0.04]">
                  <button
                    onClick={() => copyToClipboard(msg.content)}
                    className="flex items-center gap-1 text-[10px] text-stone/40 hover:text-champagne transition-colors"
                  >
                    <CopyIcon className="w-3 h-3" /> Copy
                  </button>
                  {onUseAsPrompt && (
                    <button
                      onClick={() => onUseAsPrompt(msg.content)}
                      className="flex items-center gap-1 text-[10px] text-stone/40 hover:text-champagne transition-colors"
                    >
                      <WandIcon className="w-3 h-3" /> Use as VEO prompt
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3">
              <div className="flex items-center gap-2">
                <SparklesIcon className="w-3 h-3 text-champagne/50 animate-pulse-gold" />
                <span className="text-xs text-stone/50">Thinking...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-white/[0.06]">
        <div className="flex items-end gap-3">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask Gemini anything..."
            className="flex-1 bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-ivory placeholder-stone/30 resize-none min-h-[44px] max-h-[120px] focus:border-champagne/20 transition-all"
            rows={1}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="flex items-center justify-center w-10 h-10 bg-champagne text-obsidian rounded-lg hover:bg-champagne-glow disabled:opacity-30 disabled:cursor-not-allowed transition-all shrink-0"
          >
            <SendIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
