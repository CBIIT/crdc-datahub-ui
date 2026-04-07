import { v4 } from "uuid";

/**
 * Gets the current viewport height, or returns a fallback value if window is unavailable.
 *
 * @param {number} fallback - Default height if window is unavailable
 * @return {number} Current viewport height in pixels
 */
export const getViewportHeightPx = (fallback: number): number => {
  if (typeof window === "undefined") {
    return fallback;
  }

  return window.innerHeight;
};

/**
 * Determines if an error is an AbortError.
 *
 * @param {unknown} error - Error object to check
 * @return {boolean} True if error is an AbortError
 */
export const isAbortError = (error: unknown): boolean => {
  if (!(error instanceof Error)) {
    return false;
  }

  return error.name === "AbortError";
};

/**
 * Generates a unique identifier with the given prefix.
 *
 * @param {string} prefix - ID prefix
 * @return {string} Unique ID with prefix and UUID
 */
export const createId = (prefix: string): string => `${prefix}${v4()}`;

/**
 * Creates a chat message object with provided content and metadata.
 *
 * @param {{ text: string; sender: ChatSender; senderName: string; variant?: ChatMessageVariant; id?: string; citations?: ChatCitation[] }} args - Message text, sender, name, optional variant, optional custom id, and optional citations
 * @return {ChatMessage} New chat message object
 */
export const createChatMessage = (args: {
  text: string;
  sender: ChatSender;
  senderName: string;
  variant?: ChatMessageVariant;
  id?: string;
  citations?: ChatCitation[];
}): ChatMessage => ({
  id: args.id ?? createId("chat_msg_"),
  timestamp: new Date(),
  variant: args.variant ?? "default",
  text: args.text,
  sender: args.sender,
  senderName: args.senderName,
  citations: args.citations,
});

/**
 * Escapes special characters in a string for use in a regular expression character class.
 *
 * @param value - String to escape
 * @returns Escaped string
 */
const _escapeCharacterClass = (value: string): string => value.replace(/[\\\]^-]/g, "\\$&");

/**
 * Sanitizes a chat message by:
 * - removing disallowed characters
 * - collapsing consecutive punctuation runs to the first punctuation mark
 * - collapsing whitespace
 * - rejecting values that contain no alphanumeric characters
 *
 * Allowed characters:
 * - English letters
 * - numbers
 * - whitespace
 * - common punctuation
 *
 * @param {string} message - The raw user message
 * @returns {string} The sanitized message
 */
export const sanitizeChatMessage = (message: string): string => {
  const ALLOWED_PUNCTUATION = String.raw`.,!?;:'-/()\\"@#$%&*+=[]{}|<>~\``;
  const PUNCTUATION_CLASS = _escapeCharacterClass(ALLOWED_PUNCTUATION);
  const DISALLOWED_CHARACTERS_REGEX = new RegExp(`[^A-Za-z0-9\\s${PUNCTUATION_CLASS}]`, "g");
  const CONSECUTIVE_PUNCTUATION_REGEX = new RegExp(
    `([${PUNCTUATION_CLASS}])(?:\\s*[${PUNCTUATION_CLASS}])+`,
    "g"
  );
  const HAS_ALPHANUMERIC_REGEX = /[A-Za-z0-9]/;

  const sanitizedMessage = message
    .replace(DISALLOWED_CHARACTERS_REGEX, "")
    .replace(CONSECUTIVE_PUNCTUATION_REGEX, "$1")
    .replace(/\s+/g, " ")
    .trim();

  return HAS_ALPHANUMERIC_REGEX.test(sanitizedMessage) ? sanitizedMessage : "";
};
