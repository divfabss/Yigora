/**
 * Palabras frecuentes por idioma (normalizadas: sin tildes, minúsculas).
 * Las palabras compartidas entre idiomas pesan menos en la detección.
 */
const words = (list: string): readonly string[] => list.split(" ");

export const LANGUAGE_LEXICON: Readonly<Record<string, readonly string[]>> = {
  es: words(
    "hola buenas buenos dias tardes noches tienen tiene tienes hay que quiero necesito ocupo " +
      "algo para por favor precio cuanto cuesta vale gracias el los las del de y me mi un una " +
      "con sin como donde esta estan disculpe dolor cabeza tos garganta fiebre alergia alergias " +
      "si puede pueden pastillas venden tendran tendra usted ustedes saludos duele recomienda " +
      "es",
  ),
  en: words(
    "hi hello hey good morning afternoon evening do does you have has any anything something " +
      "for the a an is are how much price cost please thanks thank need want looking what can i " +
      "my it available sell medicine pills headache cough throat fever allergy allergies pain " +
      "sore got would like recommend of",
  ),
  pt: words(
    "ola oi bom boa dia tarde noite voces voce tem temos tenho preciso quero algo alguma " +
      "coisa para pra por favor preco quanto custa obrigado obrigada o os as do da dos das e um " +
      "uma com sem remedio dor cabeca tosse garganta febre alergia vende vendem nao sim tudo " +
      "bem recomenda",
  ),
  fr: words(
    "bonjour bonsoir salut vous avez je j ai besoin quelque chose pour contre le la les des " +
      "du un une est prix combien merci s il plait mal tete gorge toux fievre allergie " +
      "allergies medicament vendez oui non et avec sans recommandez",
  ),
  de: words(
    "hallo guten tag morgen abend haben sie ich brauche etwas gegen fur der die das ein eine " +
      "ist preis wie viel kostet danke bitte kopfschmerzen husten hals halsschmerzen fieber " +
      "allergie schmerzen medikament verkaufen ja nein und mit ohne gibt es",
  ),
  it: words(
    "ciao buongiorno buonasera salve avete ho bisogno qualcosa per il lo la gli le di del " +
      "della un una e prezzo quanto costa grazie mal testa gola tosse febbre allergia farmaco " +
      "vendete si no con senza vorrei c consigliate",
  ),
};

/** Caracteres distintivos (se buscan en el texto original, antes de quitar tildes). */
export const CHARACTER_HINTS: Readonly<Record<string, RegExp>> = {
  es: /[ñ¿¡]/u,
  pt: /[ãõ]/u,
  de: /[ßäöü]/u,
  fr: /[èêëœ]/u,
  it: /[òì]/u,
};
