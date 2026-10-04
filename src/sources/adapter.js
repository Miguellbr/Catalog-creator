/**
 * SOURCE ADAPTER TEMPLATE
 * ========================
 *
 * This file is the only place where source-specific behavior should live.
 *
 * The core Catalog Creator expects four operations:
 *
 *   1. search(query)
 *      -> Find candidate pages.
 *
 *   2. isIndexPage(page)
 *      -> Decide whether a candidate is an intermediate page
 *         (search/tag/category/listing) rather than the actual game page.
 *
 *   3. findGamePage(page, game)
 *      -> Navigate from an intermediate page to the actual game page.
 *
 *   4. parseGamePage(page)
 *      -> Turn the actual game page into the normalized structure
 *         expected by the core.
 *
 * IMPORTANT:
 * - Keep source-specific selectors and navigation here.
 * - Do not put version-comparison logic here.
 * - Do not put catalog sorting logic here.
 * - Do not change src/index.js just to support a new source.
 *
 * This template intentionally contains NO source-specific resolver,
 * downloader, shortener bypass, or protected-link automation.
 * Those parts, if applicable to a source you are authorized to use,
 * belong behind the clearly marked integration points below.
 */

/**
 * Optional helper for representing a fetched page.
 *
 * Your source implementation can use any internal representation,
 * but keeping these fields makes the adapter easier to understand.
 *
 * @typedef {Object} SourcePage
 * @property {string} url
 * @property {string} html
 * @property {string} [title]
 * @property {string} [text]
 */

/**
 * Create a source adapter.
 *
 * @returns {{
 *   search: (query: string) => Promise<SourcePage[]>,
 *   isIndexPage: (page: SourcePage) => boolean,
 *   findGamePage: (page: SourcePage, game: string) => Promise<SourcePage|null>,
 *   parseGamePage: (page: SourcePage) => object|null
 * }}
 */
export function createSourceAdapter() {
  return {
    /**
     * ================================================================
     * 1. SEARCH
     * ================================================================
     *
     * Put the source's SEARCH implementation here.
     *
     * INPUT:
     *   query = "Risk of Rain 2"
     *
     * SHOULD RETURN:
     * [
     *   {
     *     url: "...",
     *     html: "...",
     *     title: "...",
     *     text: "..."
     *   }
     * ]
     *
     * If your source has no search API, this function can instead
     * receive a list/index URL from your own integration and return
     * the fetched candidate pages.
     *
     * DO NOT parse CUSA/version/Game/Update/DLC here.
     */
    async search(query) {
      // ==============================================================
      // >>> YOUR CODE GOES HERE: SEARCH <<<
      // ==============================================================
      //
      // Example shape only:
      //
      // const page = await fetchSomewhere(...);
      // return [{
      //   url: page.url,
      //   html: page.html,
      //   title: page.title,
      //   text: page.text
      // }];
      //
      // Replace this whole section with your authorized source code.

      throw new Error("SOURCE_SEARCH_NOT_IMPLEMENTED");
    },

    /**
     * ================================================================
     * 2. PAGE CLASSIFICATION
     * ================================================================
     *
     * This answers one question:
     *
     *   "Is this page an index/listing page that still needs navigation?"
     *
     * Examples of intermediate pages:
     *   - search results
     *   - tag pages
     *   - category pages
     *   - game listings
     *
     * Examples of final pages:
     *   - individual game/article page
     *   - page containing the CUSA/version blocks
     *
     * Return:
     *   true  -> navigator should call findGamePage()
     *   false -> parser can process this page directly
     */
    isIndexPage(page) {
      // ==============================================================
      // >>> YOUR CODE GOES HERE: PAGE DETECTION <<<
      // ==============================================================
      //
      // Use page.url, page.title, page.html or page.text.
      //
      // Example logic:
      //
      // if (page.url.includes("/tag/")) return true;
      // if (page.url.includes("/category/")) return true;
      // return false;
      //
      // Prefer structural detection when possible instead of relying
      // only on URL names.

      return false;
    },

    /**
     * ================================================================
     * 3. NAVIGATION
     * ================================================================
     *
     * Called only when isIndexPage(page) returns true.
     *
     * Its job is to find the relevant game link/card and return the
     * actual game page.
     *
     * IMPORTANT:
     * This is where the "don't stop at the tag page" behavior belongs.
     *
     * Example flow:
     *
     *   tag/search page
     *        ↓
     *   find matching card/title/image
     *        ↓
     *   extract href
     *        ↓
     *   fetch href
     *        ↓
     *   return individual game page
     *
     * It may return null when no matching game page is found.
     */
    async findGamePage(page, game) {
      // ==============================================================
      // >>> YOUR CODE GOES HERE: NAVIGATION <<<
      // ==============================================================
      //
      // 1. Inspect page.html.
      // 2. Find links/cards corresponding to "game".
      // 3. Select the relevant href.
      // 4. Fetch that page.
      // 5. Return:
      //
      // {
      //   url: "...",
      //   html: "...",
      //   title: "...",
      //   text: "..."
      // }
      //
      // If another intermediate page can appear, you can return it
      // and let the outer navigation layer be extended later.

      throw new Error("SOURCE_NAVIGATION_NOT_IMPLEMENTED");
    },

    /**
     * ================================================================
     * 4. GAME PAGE PARSER
     * ================================================================
     *
     * This is the most important parser section.
     *
     * It receives the INDIVIDUAL GAME PAGE, not the search/tag page.
     *
     * The parser must keep these concepts separate:
     *
     *   Version / CUSA / Region
     *      ├── Game
     *      ├── Update
     *      └── DLC
     *
     * A page may contain multiple CUSA blocks.
     * A block may contain multiple updates.
     * A block may contain no DLC.
     * A CUSA may have a mirror.
     *
     * Do NOT flatten all links into one array.
     */
    parseGamePage(page) {
      // ==============================================================
      // >>> YOUR CODE GOES HERE: STRUCTURAL PARSER <<<
      // ==============================================================
      //
      // The parser should ultimately return something approximately
      // like this:
      //
      // {
      //   title: "Risk of Rain 2",
      //   versions: [
      //     {
      //       cusa: "CUSA16209",
      //       region: "EUR",
      //       version: "1.18",
      //
      //       game: [
      //         { label: "Game", url: "..." }
      //       ],
      //
      //       updates: [
      //         {
      //           version: "1.18",
      //           label: "Update 1.18",
      //           links: [...]
      //         }
      //       ],
      //
      //       dlc: [
      //         { label: "DLC", links: [...] }
      //       ]
      //     }
      //   ]
      // }
      //
      // IMPORTANT:
      // - Keep Game separate from Update.
      // - Keep Update separate from DLC.
      // - Keep separate CUSA/region blocks separate.
      // - A "Mirror" should remain identifiable as a mirror/source
      //   variant of its corresponding CUSA/version.
      // - Missing DLC is valid.
      // - Missing updates is valid.
      // - Do not assume the first link on the page is the game.
      //
      // Version selection is NOT done here.
      // Return all relevant versions; src/catalog/normalize.js handles
      // version comparison and marks the preferred one.

      throw new Error("SOURCE_PARSER_NOT_IMPLEMENTED");
    }
  };
}

/**
 * =====================================================================
 * WHERE TO PUT EACH PIECE
 * =====================================================================
 *
 * SEARCH CODE
 *   -> createSourceAdapter().search()
 *
 * INDEX/TAG/CATEGORY DETECTION
 *   -> createSourceAdapter().isIndexPage()
 *
 * "CLICK/FOLLOW THE GAME CARD"
 *   -> createSourceAdapter().findGamePage()
 *
 * CUSA / REGION / GAME / UPDATE / DLC EXTRACTION
 *   -> createSourceAdapter().parseGamePage()
 *
 * VERSION COMPARISON
 *   -> DO NOT put it here.
 *      It already belongs to src/parser/version.js.
 *
 * "WHICH VERSION IS PREFERRED?"
 *   -> DO NOT put it here.
 *      It already belongs to src/catalog/normalize.js.
 *
 * If you later add another source, create another adapter instead of
 * rewriting the core pipeline.
 */
