import SimplePage from '../_shared/SimplePage'
import { pageMetadata } from '../meta'

const meta = pageMetadata['politica-de-privacidad']

export default function Page() {
  return <SimplePage title={meta.title} description={meta.description} />
}
