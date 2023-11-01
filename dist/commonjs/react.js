"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useChangeLanguage = exports.useLocale = exports.PreloadTranslations = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("@remix-run/react");
const react_2 = require("react");
const react_i18next_1 = require("react-i18next");
/**
 * Preload the translations files for the current language and the namespaces
 * required by the routes.
 *
 * It receives a single `loadPath` prop with the path to the translation files.
 *
 * @example
 * <PreloadTranslations loadPath="/locales/{{lng}}/{{ns}}.json" />
 *
 */
function PreloadTranslations({ loadPath }) {
    let { i18n } = (0, react_i18next_1.useTranslation)();
    let namespaces = [
        ...new Set((0, react_1.useMatches)()
            .filter((route) => route.handle?.i18n !== undefined)
            .flatMap((route) => route.handle.i18n)),
    ];
    let lang = i18n.language;
    return ((0, jsx_runtime_1.jsx)(jsx_runtime_1.Fragment, { children: namespaces.map((namespace) => {
            return ((0, jsx_runtime_1.jsx)("link", { rel: "preload", as: "fetch", href: loadPath
                    .replace("{{lng}}", lang)
                    .replace("{{ns}}", namespace) }, namespace));
        }) }));
}
exports.PreloadTranslations = PreloadTranslations;
/**
 * Get the locale returned by the root route loader under the `locale` key.
 * @example
 * let locale = useLocale()
 * let formattedDate = date.toLocaleDateString(locale);
 * @example
 * let locale = useLocale("language")
 * let formattedDate = date.toLocaleDateString(locale);
 */
function useLocale(localeKey = "locale") {
    let [rootMatch] = (0, react_1.useMatches)();
    let { [localeKey]: locale } = rootMatch.data ?? {};
    if (!locale)
        throw new Error("Missing locale returned by the root loader.");
    if (typeof locale === "string")
        return locale;
    throw new Error("Invalid locale returned by the root loader.");
}
exports.useLocale = useLocale;
/**
 * Detect when the locale returned by the root route loader changes and call
 * `i18n.changeLanguage` with the new locale.
 * This will ensure translations are loaded automatically.
 */
function useChangeLanguage(locale) {
    let { i18n } = (0, react_i18next_1.useTranslation)();
    (0, react_2.useEffect)(() => {
        i18n.changeLanguage(locale);
    }, [locale, i18n]);
}
exports.useChangeLanguage = useChangeLanguage;
