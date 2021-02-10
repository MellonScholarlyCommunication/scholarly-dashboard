const { default: data } = require('@solid/query-ldflex');
var QueryEngine = (function () {
  var instance;
  const createInstance = () => data
  return {
      getInstance: function () {
          if (!instance) {
              instance = createInstance();
          }
          return instance;
      }
  };
})();


export async function getVal(...args) {
  const arr = await getValArray(...args);
  return arr && arr[0]
}

export async function getValArray(...args) {
  try {
    const data = QueryEngine.getInstance();
    if(!args || args.length === 0) return null;
    let results = data[args[0]];
    for (let arg of args.slice(1)) {
      if (!arg) return null
      results = results[arg]
    }
    const resultValues = []
    for await (const result of results) {
      resultValues.push(result.value)
    }
    return resultValues
  } catch {
    return null;
  }
}

export async function clearCache(documentId) {
  const data = QueryEngine.getInstance();
  await data.clearCache(documentId.split('#')[0])
}