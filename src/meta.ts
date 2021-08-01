
const canonicalRoot = 'https://bubistats.hu'

export const canonicalUrl = (page: string): { hid: string, rel: string, href: string } => {
  return {
    hid: 'canonical',
    rel: 'canonical',
    href: page ? `${canonicalRoot}/#/${page}` : canonicalRoot + '/'
  }
}
