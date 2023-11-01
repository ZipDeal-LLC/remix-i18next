"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getHeaders = void 0;
/**
 * Receives a Request or Headers objects.
 * If it's a Request returns the request.headers
 * If it's a Headers returns the object directly.
 */
function getHeaders(requestOrHeaders) {
    if (requestOrHeaders instanceof Request) {
        return requestOrHeaders.headers;
    }
    return requestOrHeaders;
}
exports.getHeaders = getHeaders;
