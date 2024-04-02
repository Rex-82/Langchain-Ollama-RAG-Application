/**
 * Function used to check launch command arguments and
 * return the code relative to that argument. Used to choose
 * to also perform a document embed generation or just retrieve them.
 *
 * @returns {string} Returns a string "code" based on the given argument
 */
export function checkCommandArgument() {
  // Note: for now it is simplified as follows, could grow later as options grow
  return process.argv.length === 3 && process.argv[2] === "-e" ? "e" : "c";
}
