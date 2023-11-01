"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RemixI18Next = void 0;
const accept_language_parser_1 = require("accept-language-parser");
const i18next_1 = require("i18next");
const get_client_locales_js_1 = require("./lib/get-client-locales.js");
const DEFAULT_NS = "translation";
class RemixI18Next {
    options;
    detector;
    constructor(options) {
        this.options = options;
        this.detector = new LanguageDetector(this.options.detection);
    }
    /**
     * Detect the current locale by following the order defined in the
     * `detection.order` option.
     * By default the order is
     * - searchParams
     * - cookie
     * - session
     * - header
     * And finally the fallback language.
     */
    async getLocale(request) {
        return this.detector.detect(request);
    }
    /**
     * Get the namespaces required by the routes which are going to be rendered
     * when doing SSR.
     *
     * @param context The EntryContext object received by `handleRequest` in entry.server
     *
     * @example
     * await instance.init({
     *   ns: i18n.getRouteNamespaces(context),
     *   // ...more options
     * });
     */
    getRouteNamespaces(context) {
        let namespaces = Object.values(context.routeModules)
            .filter((route) => route.handle?.i18n !== undefined)
            .flatMap((route) => {
            let i18n = route.handle.i18n;
            if (typeof i18n === "string")
                return i18n;
            if (!Array.isArray(i18n))
                return [];
            if (i18n.every((ns) => typeof ns === "string"))
                return i18n;
            return [];
        });
        return [...new Set(namespaces)];
    }
    async getFixedT(requestOrLocale, namespaces, options = {}) {
        let parsedNamespaces = namespaces ?? DEFAULT_NS;
        // Make sure there's at least one namespace
        if (!namespaces || namespaces.length === 0) {
            parsedNamespaces = (this.options.i18next?.defaultNS ||
                "translation");
        }
        let [instance, locale] = await Promise.all([
            this.createInstance({
                ...this.options.i18next,
                ...options,
                fallbackNS: parsedNamespaces,
                defaultNS: typeof parsedNamespaces === "string"
                    ? parsedNamespaces
                    : parsedNamespaces[0],
            }),
            typeof requestOrLocale === "string"
                ? requestOrLocale
                : this.getLocale(requestOrLocale),
        ]);
        await instance.changeLanguage(locale);
        await instance.loadNamespaces(parsedNamespaces);
        return instance.getFixedT(locale, parsedNamespaces);
    }
    async createInstance(options = {}) {
        let instance = (0, i18next_1.createInstance)();
        let plugins = [
            ...(this.options.backend ? [this.options.backend] : []),
            ...(this.options.plugins || []),
        ];
        for (const plugin of plugins)
            instance.use(plugin);
        await instance.init(options);
        return instance;
    }
}
exports.RemixI18Next = RemixI18Next;
class LanguageDetector {
    options;
    constructor(options) {
        this.options = options;
        this.isSessionOnly(options);
        this.isCookieOnly(options);
    }
    isSessionOnly(options) {
        if (options.order?.length === 1 &&
            options.order[0] === "session" &&
            !options.sessionStorage) {
            throw new Error("You need a sessionStorage if you want to only get the locale from the session");
        }
    }
    isCookieOnly(options) {
        if (options.order?.length === 1 &&
            options.order[0] === "cookie" &&
            !options.cookie) {
            throw new Error("You need a cookie if you want to only get the locale from the cookie");
        }
    }
    async detect(request) {
        let order = this.options.order ?? [
            "searchParams",
            "cookie",
            "session",
            "header",
        ];
        for (let method of order) {
            let locale = null;
            if (method === "searchParams") {
                locale = await this.fromSearchParams(request);
            }
            if (method === "cookie") {
                locale = await this.fromCookie(request);
            }
            if (method === "session") {
                locale = await this.fromSessionStorage(request);
            }
            if (method === "header") {
                locale = await this.fromHeader(request);
            }
            if (locale)
                return locale;
        }
        return this.options.fallbackLanguage;
    }
    async fromSearchParams(request) {
        let url = new URL(request.url);
        if (!url.searchParams.has(this.options.searchParamKey ?? "lng")) {
            return null;
        }
        return this.fromSupported(url.searchParams.get(this.options.searchParamKey ?? "lng"));
    }
    async fromCookie(request) {
        if (!this.options.cookie)
            return null;
        let cookie = this.options.cookie;
        let lng = (await cookie.parse(request.headers.get("Cookie"))) ?? "";
        if (!lng)
            return null;
        return this.fromSupported(lng);
    }
    async fromSessionStorage(request) {
        if (!this.options.sessionStorage)
            return null;
        let session = await this.options.sessionStorage.getSession(request.headers.get("Cookie"));
        let lng = session.get(this.options.sessionKey ?? "lng");
        if (!lng)
            return null;
        return this.fromSupported(lng);
    }
    async fromHeader(request) {
        let locales = (0, get_client_locales_js_1.getClientLocales)(request);
        if (!locales)
            return null;
        if (Array.isArray(locales))
            return this.fromSupported(locales.join(","));
        return this.fromSupported(locales);
    }
    fromSupported(language) {
        return ((0, accept_language_parser_1.pick)(this.options.supportedLanguages, language ?? this.options.fallbackLanguage, { loose: false }) ||
            (0, accept_language_parser_1.pick)(this.options.supportedLanguages, language ?? this.options.fallbackLanguage, { loose: true }));
    }
}
