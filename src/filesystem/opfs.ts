export class OPFSManager {
  private root: FileSystemDirectoryHandle | null = null

  async init(): Promise<void> {
    this.root = await navigator.storage.getDirectory()
  }

  async readFile(path: string): Promise<string> {
    if (!this.root) throw new Error('OPFS not initialized')
    const parts = path.split('/').filter(Boolean)
    let dir: FileSystemDirectoryHandle = this.root
    for (let i = 0; i < parts.length - 1; i++) {
      dir = await dir.getDirectoryHandle(parts[i], { create: true })
    }
    const fileHandle = await dir.getFileHandle(parts[parts.length - 1])
    const file = await fileHandle.getFile()
    return await file.text()
  }

  async writeFile(path: string, content: string): Promise<void> {
    if (!this.root) throw new Error('OPFS not initialized')
    const parts = path.split('/').filter(Boolean)
    let dir: FileSystemDirectoryHandle = this.root
    for (let i = 0; i < parts.length - 1; i++) {
      dir = await dir.getDirectoryHandle(parts[i], { create: true })
    }
    const fileHandle = await dir.getFileHandle(parts[parts.length - 1], { create: true })
    const writable = await fileHandle.createWritable()
    await writable.write(content)
    await writable.close()
  }

  async deleteFile(path: string): Promise<void> {
    if (!this.root) throw new Error('OPFS not initialized')
    const parts = path.split('/').filter(Boolean)
    let dir: FileSystemDirectoryHandle = this.root
    for (let i = 0; i < parts.length - 1; i++) {
      dir = await dir.getDirectoryHandle(parts[i])
    }
    await dir.removeEntry(parts[parts.length - 1])
  }

  async listFiles(dirPath = ''): Promise<string[]> {
    if (!this.root) throw new Error('OPFS not initialized')
    const files: string[] = []
    let dir: FileSystemDirectoryHandle = this.root
    if (dirPath) {
      const parts = dirPath.split('/').filter(Boolean)
      for (const part of parts) {
        dir = await dir.getDirectoryHandle(part)
      }
    }
    // FileSystemDirectoryHandle is async-iterable but TypeScript's DOM lib types don't include
    // the Symbol.asyncIterator overload, so we cast to the known runtime shape.
    for await (const [name, handle] of (dir as unknown as AsyncIterable<[string, FileSystemHandle]>)) {
      if (handle.kind === 'file') {
        files.push(dirPath ? `${dirPath}/${name}` : name)
      }
    }
    return files
  }
}

export const opfsManager = new OPFSManager()
