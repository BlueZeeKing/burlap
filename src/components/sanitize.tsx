import { ReactNode, useEffect, useRef } from 'react'
import { sanitize } from 'isomorphic-dompurify'
import { MutableRefObject } from 'react'
import { LinkType } from '../types'
import { Type, useRouter } from '../lib/context'
import { Box } from '@chakra-ui/react'

const courseRegex = new RegExp('/courses/(\\d)/')

export default function Sanitizer(props: { html: string; header?: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const { setRoute } = useRouter()

  useEffect(() => {
    clean(props.html, ref, setRoute)
  }, [props.html, setRoute])

  return (
    <Box
      bg="gray.800"
      boxShadow="lg"
      rounded="lg"
      className="prose prose-invert p-8 lg:prose-lg w-full overflow-auto h-full"
    >
      {props.header != null ? (
        <>
          {props.header}
          <hr className="!m-8" />
        </>
      ) : (
        ''
      )}
      <div ref={ref} />
    </Box>
  )
}

export function clean(html: string, ref: MutableRefObject<HTMLDivElement>, setRoute) {
  ref.current.innerHTML = sanitize(html)
  ref.current.querySelectorAll('a').forEach(a => {
    if (a.getAttribute('data-api-returntype') != null) {
      const type = a.getAttribute('data-api-returntype') as LinkType
      a.onclick = e => {
        e.preventDefault()
        let url = a.getAttribute('data-api-endpoint')

        setRoute({
          type: convertType(type),
          url: new URL(url).pathname.split('/').slice(3).join('/'),
          course: courseRegex.test(url) ? courseRegex.exec(url)[1] : undefined,
          sidebar: courseRegex.test(url),
        })
      }
    } else {
      a.target = '_blank'
      a.rel = 'noreferrer'
    }
    a.classList.add('text-sky-400')
  })
  for (let item of ref.current.getElementsByTagName('*')) {
    const e = item as HTMLElement
    if (
      e.style.getPropertyValue('background-color') != '' &&
      !(e instanceof HTMLTableCellElement) &&
      !isLink(e)
    ) {
      e.style.setProperty('background-color', '')
      e.classList.add('bg-lime-300')
      e.classList.add('dark:bg-lime-700')
    } else if (e.style.getPropertyValue('background-color') != '' && isLink(e)) {
      e.style.setProperty('background-color', '')
      e.classList.add('font-bold')
      e.firstElementChild?.classList.add('font-bold')
    }
    if (e.style.getPropertyValue('font-size') != '') {
      let size = parseInt(e.style.getPropertyValue('font-size'))
      if (size > 30) {
        e.classList.add('text-3xl')
      } else if (size > 24) {
        e.classList.add('text-2xl')
      } else if (size > 20) {
        e.classList.add('text-xl')
      } else if (size > 18) {
        e.classList.add('text-lg')
      } else if (size > 16) {
        e.classList.add('text-base')
      } else if (size < 14) {
        e.classList.add('text-sm')
      } else if (size < 12) {
        e.classList.add('text-xs')
      }
      e.style.setProperty('font-size', '')
    }
    if (e.style.getPropertyValue('color') != '') {
      e.style.setProperty('color', '')
    }
    if (e.style.getPropertyValue('width') != '') {
      e.style.setProperty('width', '')
    }
    if (!(e instanceof HTMLImageElement)) {
      try {
        ;(e as any).width = undefined
      } catch (e) {
        console.error(e)
      }
    }
  }
}

function isLink(e: HTMLElement): boolean {
  return e instanceof HTMLAnchorElement || e.firstChild instanceof HTMLAnchorElement
}

function convertType(type: LinkType): Type {
  switch (type) {
    case 'Assignment':
      return 'assignment'
    case 'Discussion':
      return 'discussion'
    case 'File':
      return 'file'
    case 'Module':
      return 'modules'
    case 'Page':
      return 'page'
    case 'Quiz':
      return 'quiz'
    default:
      return 'unknown'
  }
}
