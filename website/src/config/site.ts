/**
 * Central site configuration for the TriggerHub company website.
 *
 * Placeholders are clearly marked with [PLATZHALTER].
 * Do NOT enter Handelsregisternummer, USt-ID, or confirmed partner names
 * before the legal entity is registered and data is confirmed.
 */

export const SITE = {
  company: {
    /** Display name — no legal suffix in UI, use legalName for legal pages */
    name: 'TriggerHub',
    /** Used in Impressum and footer only, once formation is finalized */
    legalName: 'TriggerHub UG (haftungsbeschränkt) in Gründung',
    /** Status badge for public display */
    statusLabel: 'Unternehmen im Aufbau',
    /**
     * [PLATZHALTER] Update once HRB entry is confirmed.
     * Do NOT show on the website until actual registration is complete.
     */
    hrb: null as null | string,
    /**
     * [PLATZHALTER] Update once Finanzamt assigns USt-Id.
     */
    ustId: null as null | string,
  },

  owner: {
    name: 'Alexander Posdziech',
    /** Confirmed from legal-context.md — update if address changes */
    address: 'Voßort 14',
    city: '21037 Hamburg',
    country: 'Deutschland',
    /** Public contact email — shown in Impressum per § 5 TMG */
    email: 'Triggerhub@outlook.com',
  },

  links: {
    github: 'https://github.com/Alox040/TriggerHub',
    mailto: 'mailto:Triggerhub@outlook.com',
    imprint: '/impressum',
    privacy: '/datenschutz',
    resqbrain: '/resqbrain',
    contact: '/kontakt',
  },

  resqbrain: {
    name: 'ResQBrain',
    tagline: 'Knowledge-only Referenzwerkzeug für den Rettungsdienst',
    /** Status — update when pilot launches */
    status: 'In Entwicklung' as const,
    /**
     * Disclaimer text — displayed prominently on ResQBrain page.
     * NEVER remove or shorten without legal review.
     */
    knowledgeOnlyDisclaimer:
      'ResQBrain ist eine Lernhilfe und kein Ersatz für medizinische Ausbildung, Leitlinien oder Einsatzentscheidungen. Die Inhalte dienen ausschließlich der Wissensvorbereitung und ersetzen keine klinische Beurteilung.',
  },
} as const
