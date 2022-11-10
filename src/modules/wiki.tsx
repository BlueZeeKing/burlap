import Sanitizer from '../components/sanitize'
import { Page } from '../types'

export function Wiki(props: { data: Page }) {
  return <Sanitizer html={props.data.body} />
}
