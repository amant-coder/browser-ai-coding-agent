import { FileIcon, FolderIcon, PlusIcon, TrashIcon } from 'lucide-react'
import { useStore } from '@/store'
import { cn } from '@/lib/utils'
import type { FileNode } from '@/types'

function FileTreeItem({ file, depth = 0 }: { file: FileNode; depth?: number }) {
  const { openTab, activeFileId, deleteFile } = useStore()

  const handleClick = () => {
    if (file.type === 'file') {
      openTab(file)
    }
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    deleteFile(file.id)
  }

  return (
    <div>
      <div
        className={cn(
          'flex items-center gap-1 px-2 py-0.5 text-sm cursor-pointer rounded hover:bg-accent group',
          activeFileId === file.id && 'bg-accent text-accent-foreground'
        )}
        style={{ paddingLeft: `${(depth + 1) * 12}px` }}
        onClick={handleClick}
      >
        {file.type === 'directory' ? (
          <FolderIcon className="h-3.5 w-3.5 text-yellow-400 flex-shrink-0" />
        ) : (
          <FileIcon className="h-3.5 w-3.5 text-blue-400 flex-shrink-0" />
        )}
        <span className="truncate flex-1">{file.name}</span>
        <button
          onClick={handleDelete}
          className="hidden group-hover:flex items-center justify-center h-4 w-4 rounded hover:bg-destructive/20 hover:text-destructive"
        >
          <TrashIcon className="h-3 w-3" />
        </button>
      </div>
      {file.children?.map((child) => (
        <FileTreeItem key={child.id} file={child} depth={depth + 1} />
      ))}
    </div>
  )
}

export function FileTree() {
  const { files, addFile } = useStore()

  const createNewFile = () => {
    const name = prompt('Enter file name:')
    if (!name) return
    const ext = name.split('.').pop() || 'txt'
    const languageMap: Record<string, string> = {
      ts: 'typescript', tsx: 'typescript', js: 'javascript', jsx: 'javascript',
      py: 'python', html: 'html', css: 'css', json: 'json', md: 'markdown',
    }
    addFile({
      id: `file-${Date.now()}`,
      name,
      path: name,
      type: 'file',
      content: '',
      language: languageMap[ext] || 'plaintext',
    })
  }

  return (
    <div className="h-full flex flex-col bg-background">
      <div className="flex items-center justify-between px-3 py-2 border-b">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Explorer</span>
        <button
          onClick={createNewFile}
          className="h-5 w-5 flex items-center justify-center rounded hover:bg-accent"
          title="New File"
        >
          <PlusIcon className="h-3.5 w-3.5" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto py-1">
        {files.length === 0 ? (
          <div className="px-3 py-4 text-xs text-muted-foreground text-center">
            No files yet.<br />Ask the AI to create some!
          </div>
        ) : (
          files.map((file) => <FileTreeItem key={file.id} file={file} />)
        )}
      </div>
    </div>
  )
}
