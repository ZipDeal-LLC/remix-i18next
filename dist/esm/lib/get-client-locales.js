import { parseAcceptLanguage } from "intl-parse-accept-language";
export function getClientLocales(requestOrHeaders) {
    let headers = getHeaders(requestOrHeaders);
    let acceptLanguage = headers.get("Accept-Language");
    // if the header is not defined, return undefined
    if (!acceptLanguage)
        return undefined;
    let locales = parseAcceptLanguage(acceptLanguage, {
        validate: Intl.DateTimeFormat.supportedLocalesOf,
        ignoreWildcard: true,
    });
    // if there are no locales found, return undefined
    if (locales.length === 0)
        return undefined;
    // if there is only one locale, return it
    if (locales.length === 1)
        return locales[0];
    // if there are multiple locales, return the array
    return locales;
}
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
