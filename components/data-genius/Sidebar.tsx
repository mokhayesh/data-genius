// components/data-genius/Sidebar.tsx
'use client'
import * as React from 'react'
import Card from '@/components/ui/Card'
import PersonaSelect from './PersonaSelect'
import LanguageSelect from './LanguageSelect'
// NOTE: We no longer rely on UploadPanel here.
// import UploadPanel from './UploadPanel'
import QuickActions from './QuickActions'

type SidebarProps = {
  persona: string
  setPersona: (v: string) => void
  language: string
  setLanguage: (v: string) => void
  onPickAction: (text: string) => void
  onDataFiles: (files: File[]) => void
  onImageFiles: (files: File[]) => void
}

export default function Sidebar({
  persona,
  setPersona,
  language,
  setLanguage,
  onPickAction,
  onDataFiles,
  onImageFiles,
}: SidebarProps) {
  // local UI state just to show “it worked”
  const [dataSummary, setDataSummary] = React.useState<string>('')
  const [imageSummary, setImageSummary] = React.useState<string>('')

  // click-to-open refs
  const dataInputRef = React.useRef<HTMLInputElement>(null)
  const imageInputRef = React.useRef<HTMLInputElement>(null)

  // drag styles
  const [dragData, setDragData] = React.useState(false)
  const [dragImage, setDragImage] = React.useState(false)

  function handlePickedData(files: File[]) {
    if (!files?.length) return
    setDataSummary(summarize(files))
    onDataFiles(files)
  }

  function handlePickedImages(files: File[]) {
    if (!files?.length) return
    setImageSummary(summarize(files))
    onImageFiles(files)
  }

  function summarize(files: File[]) {
    if (files.length === 1) return files[0].name
    const first = files[0]?.name ?? ''
    return `${files.length} files (${first}${files.length > 1 ? ', …' : ''})`
  }

  // Reusable drop zone card
  function DropCard({
    label,
    helper,
    accept,
    multiple,
    onChooseClick,
    onDropFiles,
    dragging,
    setDragging,
    inputRef,
  }: {
    label: string
    helper: string
    accept: string
    multiple?: boolean
    onChooseClick: () => void
    onDropFiles: (files: File[]) => void
    dragging: boolean
    setDragging: (v: boolean) => void
    // ✅ Accept null so useRef<HTMLInputElement>(null) is assignable
    inputRef: React.RefObject<HTMLInputElement | null>
  }) {
    return (
      <Card
        className={
          'p-4 border-dashed transition ' +
          (dragging ? 'border-brand-400 bg-brand-50' : 'border-surface-ring')
        }
        onDragOver={(e) => {
          e.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragging(false)
          const files = Array.from(e.dataTransfer?.files || [])
          onDropFiles(files)
        }}
      >
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="text-sm font-medium text-slate-800">{label}</div>
            <p className="text-xs text-slate-500">{helper}</p>
          </div>
          <button
            type="button"
            className="h-9 px-3 rounded-lg text-sm bg-slate-100 hover:bg-slate-200"
            onClick={onChooseClick}
          >
            Choose Files
          </button>
          <input
            ref={inputRef}
            type="file"
            className="hidden"
            accept={accept}
            multiple={multiple}
            onChange={(e) => onDropFiles(Array.from(e.target.files || []))}
          />
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-full bg-brand-600 text-white grid place-items-center font-semibold">
            DG
          </div>
          <div>
            <div className="font-semibold">Data Genius</div>
            <div className="text-xs text-slate-500">with Simba</div>
          </div>
        </div>
        <div className="mt-4 grid gap-3">
          <PersonaSelect value={persona} onChange={setPersona} />
          <LanguageSelect value={language} onChange={setLanguage} />
        </div>
      </Card>

      {/* Data uploads */}
      <DropCard
        label="Upload data files"
        helper={dataSummary || 'Drag & drop or pick .csv, .xlsx, .json, .parquet'}
        accept=".csv,.xlsx,.xls,.json,.parquet"
        multiple
        dragging={dragData}
        setDragging={setDragData}
        inputRef={dataInputRef}
        onChooseClick={() => dataInputRef.current?.click()}
        onDropFiles={handlePickedData}
      />

      {/* Image uploads */}
      <DropCard
        label="Upload images"
        helper={imageSummary || 'Drag & drop or pick image files'}
        accept="image/*"
        multiple
        dragging={dragImage}
        setDragging={setDragImage}
        inputRef={imageInputRef}
        onChooseClick={() => imageInputRef.current?.click()}
        onDropFiles={handlePickedImages}
      />

      <Card className="p-4">
        <div className="text-sm font-medium text-slate-800 mb-2">Quick actions</div>
        <QuickActions onPick={onPickAction} />
      </Card>
    </div>
  )
}
