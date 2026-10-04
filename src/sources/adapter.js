/**
 * Generic source adapter.
 *
 * Source-specific behavior belongs here.
 * The implementation below is deliberately a placeholder.
 */

export function createSourceAdapter() {
  return {
    async search() {
      throw new Error("SOURCE_SPECIFIC_SEARCH_NOT_IMPLEMENTED");
    },

    isIndexPage() {
      return false;
    },

    async findGamePage() {
      throw new Error("SOURCE_SPECIFIC_NAVIGATION_NOT_IMPLEMENTED");
    },

    parseGamePage() {
      throw new Error("SOURCE_SPECIFIC_PARSER_NOT_IMPLEMENTED");
    }
  };
}

// TODO: SOURCE-SPECIFIC INTEGRATION
// Add the implementation here without changing the core pipeline.
