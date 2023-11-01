export interface PreloadTranslationsProps {
    loadPath: string;
}
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
export declare function PreloadTranslations({ loadPath }: PreloadTranslationsProps): JSX.Element;
/**
 * Get the locale returned by the root route loader under the `locale` key.
 * @example
 * let locale = useLocale()
 * let formattedDate = date.toLocaleDateString(locale);
 * @example
 * let locale = useLocale("language")
 * let formattedDate = date.toLocaleDateString(locale);
 */
export declare function useLocale(localeKey?: string): string;
/**
 * Detect when the locale returned by the root route loader changes and call
 * `i18n.changeLanguage` with the new locale.
 * This will ensure translations are loaded automatically.
 */
export declare function useChangeLanguage(locale: string): void;
