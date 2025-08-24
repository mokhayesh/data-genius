// components/data-genius/ChatMessage.tsx
import * as React from 'react'
import clsx from 'clsx'
import Card from '@/components/ui/Card'

export type ChatMessageProps = {
  role: 'user' | 'assistant'
  content: string | React.ReactNode
}

export default function ChatMessage({ role, content }: ChatMessageProps) {
  const isUser = role === 'user'
  const body =
    typeof content === 'string'
      ? (
          <div
            className="prose prose-sm max-w-none prose-p:leading-relaxed prose-pre:whitespace-pre-wrap"
            dangerouslySetInnerHTML={{ __html: content.replace(/\n/g, '<br/>') }}
          />
        )
      : (
          <div className="prose prose-sm max-w-none prose-p:leading-relaxed prose-pre:whitespace-pre-wrap">
            {content}
          </div>
        )

  return (
    <div className={clsx('flex w-full', isUser ? 'justify-end' : 'justify-start')}>
      <Card className={clsx('max-w-[85%] p-4', isUser ? 'bg-brand-600 text-white' : 'bg-white')}>
        {body}
      </Card>
    </div>
  )
}
