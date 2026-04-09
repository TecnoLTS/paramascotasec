import { getSuggestionsResponse } from '@/lib/server/suggestions'

export async function GET(req: Request) {
  return getSuggestionsResponse(req)
}
