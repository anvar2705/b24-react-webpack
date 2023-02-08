const getQueryArray = (obj: any, path: any[] = [], result = []) =>
  Object.entries(obj).reduce((acc: any, [k, v]) => {
    path.push(k)

    if (v instanceof Object) {
      getQueryArray(v, path, acc)
    } else {
      acc.push(`${path.map((n, i) => (i ? `[${n}]` : n)).join('')}=${v}`)
    }

    path.pop()

    return acc
  }, result)

export const getQueryString = (obj: any) => getQueryArray(obj).join('&')
