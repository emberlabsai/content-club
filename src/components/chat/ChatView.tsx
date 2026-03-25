import { useState, useRef, useEffect } from 'react'
import type { ChatMessage, ChatMessagePart, AssetItem } from '../../types'
import { chatWithGemini } from '../../api/client'
import {
  SendIcon,
  CopyIcon,
  SparklesIcon,
  WandIcon,
  ImagePlusIcon,
  DownloadIcon,
  PlusIcon,
  XIcon,
} from '../common/Icons'

interface ChatViewProps {
  activeClient: string
  onUseAsPrompt?: (text: string) => void
  onSaveAsset?: (asset: AssetItem) => void
}

export default function ChatView({ activeClient, onUseAsPrompt, onSaveAsset }: ChatViewProps) {
  const storageKey = activeClient ? `tcc-chat-${activeClient}` : 'tcc-chat-all'
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem(storageKey)
      return saved ? JSON.parse(saved) : []
    } catch { return [] }
  })
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [model, setModel] = useState('gemini-2.5-flash')
  const [attachedImage, setAttachedImage] = useState<{ base64: string; mimeType: string; previewUrl: string } | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey)
      setMessages(saved ? JSON.parse(saved) : [])
    } catch { setMessages([]) }
  }, [storageKey])

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(messages))
    } catch { /* quota exceeded */ }
  }, [messages, storageKey])

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

  const handleImageAttach = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      const b64 = result.split(',')[1]
      if (b64) {
        setAttachedImage({
          base64: b64,
          mimeType: file.type,
          previewUrl: URL.createObjectURL(file),
        })
      }
    }
    reader.readAsDataURL(file)
    if (fileRef.current) fileRef.current.value = ''
  }

  const handleSend = async () => {
    const text = input.trim()
    if ((!text && !attachedImage) || isLoading) return

    const userParts: ChatMessagePart[] = []
    if (text) userParts.push({ type: 'text', content: text })
    if (attachedImage) {
      userParts.push({ type: 'image', base64: attachedImage.base64, mimeType: attachedImage.mimeType })
    }

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      parts: userParts,
      timestamp: Date.now(),
    }

    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setAttachedImage(null)
    setIsLoading(true)

    try {
      const allMsgs = [...messages, userMsg]
      const apiMessages = allMsgs.map((m, idx) => {
        const textContent = m.parts.filter(p => p.type === 'text').map(p => p.content).join('\n')
        const isLastUserMsg = idx === allMsgs.length - 1 && m.role === 'user'
        const imgPart = isLastUserMsg
          ? m.parts.find(p => p.type === 'image' && p.base64)
          : undefined
        return {
          role: m.role,
          content: textContent || '.',
          imageData: imgPart ? { base64: imgPart.base64!, mimeType: imgPart.mimeType! } : undefined,
        }
      })

      const responseParts = await chatWithGemini(apiMessages, model)

      const assistantMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        parts: responseParts.length > 0 ? responseParts : [{ type: 'text', content: 'No response generated.' }],
        timestamp: Date.now(),
      }
      setMessages((prev) => [...prev, assistantMsg])
    } catch (err) {
      const errMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        parts: [{ type: 'text', content: `Error: ${err instanceof Error ? err.message : 'Something went wrong'}` }],
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

  const extractPromptText = (parts: ChatMessagePart[]): string => {
    const textParts = parts.filter(p => p.type === 'text' && p.content)
    const combined = textParts.map(p => p.content!).join('\n')
    const codeBlockMatch = combined.match(/```[\s\S]*?\n([\s\S]*?)```/)
    if (codeBlockMatch) return codeBlockMatch[1].trim()
    const quotedMatch = combined.match(/"([^"]{20,})"/)
    if (quotedMatch) return quotedMatch[1].trim()
    return combined.replace(/^#+\s.*$/gm, '').replace(/\*\*/g, '').replace(/\*/g, '').trim()
  }

  const handleSaveImageAsset = (part: ChatMessagePart) => {
    if (!part.base64 || !onSaveAsset) return
    const asset: AssetItem = {
      id: crypto.randomUUID(),
      type: 'image',
      name: `NanoBanana_${new Date().toISOString().slice(0, 10)}_${activeClient || 'draft'}`,
      previewUrl: `data:${part.mimeType};base64,${part.base64}`,
      base64: part.base64,
      mimeType: part.mimeType || 'image/png',
      createdAt: Date.now(),
      source: 'nano-banana',
      prompt: input,
      client: activeClient,
    }
    onSaveAsset(asset)
  }

  const handleDownloadImage = (part: ChatMessagePart) => {
    if (!part.base64) return
    const link = document.createElement('a')
    link.href = `data:${part.mimeType};base64,${part.base64}`
    link.download = `tcc-nano-banana-${Date.now()}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleClearHistory = () => {
    setMessages([])
  }

  const isImageModel = model.includes('image')

  const quickPrompts = [
    'Help me write a VEO prompt for a luxury handbag reveal',
    'Brainstorm 3 creative video concepts for a fashion brand lookbook',
    isImageModel ? 'Generate a high-fashion editorial photograph, dramatic studio lighting' : 'Write a compelling campaign concept for a summer collection',
  ]

  return (
    <div className="h-full flex flex-col animate-fade-in">
      {/* Header */}
      <div className="p-6 pb-4 border-b border-white/[0.06] shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <SparklesIcon className="w-5 h-5 text-champagne/60" />
              <h2 className="serif text-2xl font-light tracking-tight text-ivory">Gemini</h2>
            </div>
            <p className="text-xs text-stone/50 ml-8">
              {isImageModel
                ? 'Nano Banana 2 — text + image generation in one conversation'
                : 'Gemini Pro — brainstorm prompts, plan creative direction'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {messages.length > 0 && (
              <button
                onClick={handleClearHistory}
                className="text-[10px] text-stone/40 hover:text-error px-2 py-1 rounded transition-colors"
              >
                Clear
              </button>
            )}
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="bg-white/[0.03] border border-white/[0.06] rounded-lg px-3 py-1.5 text-xs text-ivory appearance-none hover:border-white/10 transition-all"
            >
              <option value="gemini-2.5-flash">Gemini 2.5 Flash</option>
              <option value="gemini-2.5-pro">Gemini 2.5 Pro</option>
              <option value="gemini-3.1-flash-image-preview">Nano Banana 2</option>
            </select>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <span className="text-stone/10 text-6xl mb-6">✦</span>
            <h3 className="serif text-xl font-light text-ivory/60 mb-2">
              {isImageModel ? 'Create Images with Nano Banana 2' : 'Start a Conversation'}
            </h3>
            <p className="text-xs text-stone/40 max-w-sm mb-8">
              {isImageModel
                ? 'Ask for images and iterate on them conversationally. Upload reference images for editing. All generated images can be saved to your Assets.'
                : 'Chat with Gemini to brainstorm video concepts, craft the perfect VEO prompt, or plan content for your clients.'}
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
                  <span className="text-[9px] uppercase tracking-wider text-champagne/50 font-medium">
                    {isImageModel ? 'Nano Banana 2' : 'Gemini'}
                  </span>
                </div>
              )}

              {msg.parts.map((part, i) => (
                <div key={i}>
                  {part.type === 'text' && part.content && (
                    <div className="text-sm leading-relaxed whitespace-pre-wrap">{part.content}</div>
                  )}
                  {part.type === 'image' && part.base64 && (
                    <div className="mt-2 mb-2 relative group">
                      <img
                        src={`data:${part.mimeType};base64,${part.base64}`}
                        alt="Generated"
                        className="rounded-lg max-w-full border border-white/[0.06]"
                      />
                      <div className="flex items-center gap-2 mt-2">
                        {onSaveAsset && (
                          <button
                            onClick={() => handleSaveImageAsset(part)}
                            className="flex items-center gap-1 px-2.5 py-1 bg-champagne/10 text-champagne text-[10px] font-medium rounded-md hover:bg-champagne/20 transition-all"
                          >
                            <PlusIcon className="w-3 h-3" /> Save to Assets
                          </button>
                        )}
                        <button
                          onClick={() => handleDownloadImage(part)}
                          className="flex items-center gap-1 px-2.5 py-1 bg-white/[0.06] text-ivory/60 text-[10px] rounded-md hover:bg-white/10 transition-all"
                        >
                          <DownloadIcon className="w-3 h-3" /> Download
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {msg.role === 'assistant' && msg.parts.some(p => p.type === 'text' && p.content) && (
                <div className="flex items-center gap-2 mt-3 pt-2 border-t border-white/[0.04]">
                  <button
                    onClick={() => copyToClipboard(msg.parts.filter(p => p.type === 'text').map(p => p.content).join('\n'))}
                    className="flex items-center gap-1 text-[10px] text-stone/40 hover:text-champagne transition-colors"
                  >
                    <CopyIcon className="w-3 h-3" /> Copy
                  </button>
                  {onUseAsPrompt && (
                    <button
                      onClick={() => onUseAsPrompt(extractPromptText(msg.parts))}
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
                <span className="text-xs text-stone/50">
                  {isImageModel ? 'Generating...' : 'Thinking...'}
                </span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Attached Image Preview */}
      {attachedImage && (
        <div className="px-4 pt-2 shrink-0">
          <div className="inline-flex items-center gap-2 px-3 py-2 bg-white/[0.03] border border-white/[0.06] rounded-lg">
            <img
              src={attachedImage.previewUrl}
              alt="Attached"
              className="w-10 h-10 rounded object-cover"
            />
            <span className="text-[10px] text-stone/50">Image attached</span>
            <button
              onClick={() => setAttachedImage(null)}
              className="p-0.5 text-stone/40 hover:text-error transition-colors"
            >
              <XIcon className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t border-white/[0.06] shrink-0">
        <div className="flex items-end gap-3">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="flex items-center justify-center w-10 h-10 bg-white/[0.03] border border-white/[0.06] rounded-lg text-stone/40 hover:text-champagne hover:border-champagne/20 transition-all shrink-0"
            title="Attach image"
          >
            <ImagePlusIcon className="w-4 h-4" />
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={handleImageAttach}
            className="hidden"
          />
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isImageModel ? 'Ask for images or describe edits...' : 'Ask Gemini anything...'}
            className="flex-1 bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-ivory placeholder-stone/30 resize-none min-h-[44px] max-h-[120px] focus:border-champagne/20 transition-all"
            rows={1}
          />
          <button
            onClick={handleSend}
            disabled={(!input.trim() && !attachedImage) || isLoading}
            className="flex items-center justify-center w-10 h-10 bg-champagne text-obsidian rounded-lg hover:bg-champagne-glow disabled:opacity-30 disabled:cursor-not-allowed transition-all shrink-0"
          >
            <SendIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
