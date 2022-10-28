import { BreadcrumbItem } from '@chakra-ui/react'
import { useEffect, useState } from 'react'

interface BreadcrumbItem {
  name: string
  url: string
}

export function setBreadcrumb(index: number, name: string, url: string) {
  let breadcrumb: BreadcrumbItem[] = []
  if (window.localStorage.getItem('breadcrumb') != null) {
    breadcrumb = JSON.parse(window.localStorage.getItem('breadcrumb')).slice(0, index)
  }
  breadcrumb.push({
    name: name,
    url: url,
  })
  window.localStorage.setItem('breadcrumb', JSON.stringify(breadcrumb))
}

export function useBreadcrumb(data?: [number, string, string]) {
  const [state, setState] = useState<BreadcrumbItem[]>([])

  useEffect(() => {
    if (data != null) {
      setBreadcrumb(data[0], data[1], data[2])
    }
    if (window.localStorage.getItem('breadcrumb') != null) {
      setState(JSON.parse(window.localStorage.getItem('breadcrumb')))
    }
  }, [])

  return state
}
