import { validStatusCodes } from './Util'
import { clearCache } from '../singletons/QueryEngine';
const auth = require('solid-auth-client')
const DEFAULTSHOWPOPUPS = false;
const FileClient = require("solid-file-client");
const mime = require('mime');

// TODO: automatically create directories using solid-file-client

const getContentType = (URI) => {
  return mime.getType(URI.split('#')[0]) || 'text/turtle'
}

// export async function getFile(URI) {
//   return doRequest('GET', URI, null, null)
// }

export async function patchFile(URI, body) {
  clearCache(URI);
  return doRequest('PATCH', URI, body, { "Content-Type": "application/sparql-update" })
}

export async function putFile(URI, body, headers) {
  clearCache(URI);
  return doRequest('PUT', URI, body, headers || { "Content-Type": getContentType(URI) })
}

export async function postFile(URI, body, headers) {
  clearCache(URI);
  return doRequest('POST', URI, body, headers || { "Content-Type": getContentType(URI) })
}

export async function deleteFile(URI) {
  clearCache(URI);
  return doRequest('DELETE', URI)
}

async function doRequest(requestType, URI, body, headers, showPopups) {
  try {
    const options = {method: requestType}
    if (body) options.body = body
    if (headers) options.headers = headers
    const response = await auth.fetch(URI, options);
    const code = (await response).status
    if (validStatusCodes.indexOf(code) === -1) {
      showErrorPopup(URI, code, requestType, showPopups)
    }
    return response;
  } catch (e) {
    throw new Error(`Error during ${requestType} operation on ${URI}`)
    return null;
  }
  
}

function showErrorPopup(URI, statusCode, requestType, showPopups) {
  let alert = null
  if ([401, 403].indexOf(statusCode) !== -1) {
    alert =`Incorrect authorization during ${requestType} request to resource on ${URI}. Please double check the permissions set in your solid pod!`
  } else if ([404].indexOf(statusCode) !== -1) {
    alert =`Could not do ${requestType} request to resource at ${URI}, as it has been removed or does not exist.`
  } else {
    alert =`Could not do ${requestType} request to resource at ${URI}. Please double check the permissions set in your solid pod!`
  }
  if (alert && showPopups) window.alert(alert)
  else if (alert) console.error(alert)
}

export async function fileExists(fileURL) {
  const fc = new FileClient(auth);
  return fc.itemExists(fileURL);
}

export function parse_link_header(result) {
  if (!result || !result.headers) return null;
  const header = Object.fromEntries(result.headers).link
  if (!header || header.length === 0) return null;

  // Split parts by comma
  var parts = header.split(',');
  var links = {};
  // Parse each part into a named link
  for(var i=0; i<parts.length; i++) {
      var section = parts[i].split(';');
      if (section.length !== 2) {
          throw new Error("section could not be split on ';'");
      }
      var url = section[0].replace(/<(.*)>/, '$1').trim();
      var name = section[1].replace(/rel="(.*)"/, '$1').trim();
      links[name] = url;
  }
  return links;
}
