import type { INode } from '../store/store'

export function generateFreeMindXML(nodes: INode[], centralNodeId: string): string {
  const buildNodeXML = (node: INode, nodes: INode[]): string => {
    const childNodes = nodes.filter(n => n.parentId === node.id)
    const childrenXML = childNodes.map(child => buildNodeXML(child, nodes)).join('')
    
    return `<node ID="${node.id}" TEXT="${escapeXML(node.content)}"${childrenXML ? `>${childrenXML}</node>` : '/>'}`
  }

  const escapeXML = (text: string): string => {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;')
  }

  const centralNode = nodes.find(node => node.id === centralNodeId)
  if (!centralNode) return ''

  return `<?xml version="1.0" encoding="UTF-8"?>
<map version="1.0.1">
  ${buildNodeXML(centralNode, nodes)}
</map>`
}

export function downloadFreeMind(xml: string, filename: string = 'mindmap.mm'): void {
  const blob = new Blob([xml], { type: 'application/xml' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}


export function parseFreeMindXML(xmlContent: string): { nodes: INode[], centralNodeId: string } {
  const parser = new DOMParser()
  const xmlDoc = parser.parseFromString(xmlContent, 'application/xml')
  const nodes: INode[] = []
  let centralNodeId = ''

  function processNode(element: Element, parentId: string | null = null, level: number = 0): void {
    const id = element.getAttribute('ID') || crypto.randomUUID()
    const text = element.getAttribute('TEXT') || ''
    
    if (level === 0) {
      centralNodeId = id
    }

    const node: INode = {
      id,
      title: text,
      content: text,
      parentId: parentId || undefined,
      level: level as 0 | 1 | 2 | 3,
      position: { x: 0, y: 0 },
      connectionPoints: [],
      branchColor: '',
      x: 0,
      y: 0
    }
    nodes.push(node)

    // Process all child nodes recursively
    const childNodes = Array.from(element.children).filter(child => child.tagName === 'node')
    childNodes.forEach(childElement => {
      processNode(childElement as Element, id, level + 1)
    })
  }

  const rootNode = xmlDoc.querySelector('map > node')
  if (rootNode) {
    processNode(rootNode)
  }

  return { nodes, centralNodeId }
}

export function importFreeMind(file: File): Promise<{ nodes: INode[], centralNodeId: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string
        const result = parseFreeMindXML(content)
        resolve(result)
      } catch (error) {
        reject(error)
      }
    }
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsText(file)
  })
}