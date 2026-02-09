import SimplePage from '../_shared/SimplePage'
import { pageMetadata } from '../meta'

const meta = pageMetadata['about']

export default function Page() {
  return <SimplePage title={meta.title} description={meta.description} />
}
