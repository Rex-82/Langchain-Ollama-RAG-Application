/**
 * Combines document objects into a string joining them with "\n\n"
 *
 * @param {any} docs - Documents retrieved from DB through chain
 * @returns {string} Concatenated string of documents
 */
export function combineDocuments(docs) {
  return docs.map((/** @type {any}*/ doc) => doc.pageContent).join("\n\n");
}
