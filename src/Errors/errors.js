const getError = (URI, response, requestBody) => {
  const code = response && response.code
  if (code === 404 || 500) {
    return new ResourceMissingError(URI, response, requestBody)
  } else if (code === 401 || code === 403) {
    return new PermissionError(URI, response, requestBody)
  } else if (code === 409) {
    return new UpdateError(URI, response, requestBody)
  } else {
    return new DefaultRequestError(URI, response, requestBody)
  }
}

class CustomError extends Error {
  constructor(response, body, message) {
    super(message)
    this.response = response;
    this.requestBody = body;
  }
}


/**
 * Error to throw if update is not executed because of 
 */
class ResourceMissingError extends CustomError {
  constructor(URI, response, body) {
    const message = `Resource at location ${URI} has been removed or does not exist.`
    super(response, body, message)
  }
}


/**
 * Error to throw if update is not executed because of incorrect update with regards to server state
 */
class UpdateError extends CustomError {
  constructor(URI, response, body) {
    const message = `Could not update the resource at location ${URI}. Please refresh the page and try again.`
    super(response, body, message)
  }
}

class PermissionError extends CustomError {
  constructor(URI, response, body) {
    const message = `The current logged in user does not have adequate permission for the interaction with the resource at location ${URI}. Please check that all required permissions are set correctly.`
    super(response, body, message)
  }
}

class DefaultRequestError extends CustomError {
  constructor(URI, response, body) {
    const message = `The current operation for the resource at location ${URI} could not be done. Please restart the application and try again.`
    super(response, body, message)
  }
}


export {
  getError
}