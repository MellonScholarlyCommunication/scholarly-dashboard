export const NS_ORE = "http://www.openarchives.org/ore/terms/"
export const NS_DCMI = "http://purl.org/dc/elements/1.1/"

export function getBaseIRI(IRI) {
  let path = IRI;
  path = path.replace(/(^\w+:|^)\/\//, "");
  path = path.split("/").slice(1).join("/");
  path =
    IRI.substring(0, IRI.indexOf(path)).replace(/\/$/, "") +
    "/";
  return path;
}