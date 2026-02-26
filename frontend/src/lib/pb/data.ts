/**
 * PocketBase API Response Wrapper
 *
 * Provides convenient access to PocketBase API responses with processed relations.
 *
 * Usage:
 *   // List response - use PBDataList
 *   const list = new PBDataList(listResult)
 *   list.items.first()
 *
 *   // Single record - use PBData
 *   const record = new PBData(record)
 *   record.id
 *   record.user_feedback
 */

interface PBExpand {
  [key: string]: unknown;
}

/**
 * Base interface for PocketBase records with known fields
 */
interface PBRecordBase {
  id: string;
  collectionId: string;
  collectionName: string;
  created: string;
  updated: string;
  expand?: PBExpand;
}

/**
 * PocketBase record type that allows any additional fields
 */
export type PBRecord = PBRecordBase & {
  [key: string]: unknown;
};

/**
 * Recursively process a record to flatten back-relations and merge expand
 */
function processRecord(record: PBRecord): PBRecord {
  const expand = record.expand;

  if (!expand) {
    return record;
  }

  // Process expand recursively and get the updated expand (includes *_via_* keys now)
  const processedExpand = processExpand(expand);

  // Create result: start with record but without expand
  const { expand: _expand, ...recordWithoutExpand } = record;

  // Build shortcuts for back-relations from ORIGINAL expand (e.g., user_feedback_via_user -> user_feedback)
  const shortcuts: Record<string, unknown> = {};

  for (const key of Object.keys(expand)) {
    const viaMatch = key.match(/^(.+)_via_.+$/);
    if (viaMatch) {
      // Back-relation: add as shortcut using processed value
      shortcuts[viaMatch[1]] = processedExpand[key];
    }
  }

  // Merge expand into record (expanded values override ID arrays)
  const mergedExpand: Record<string, unknown> = {};

  for (const key of Object.keys(processedExpand)) {
    // Skip back-relations - they're handled above as shortcuts
    if (key.includes('_via_')) {
      continue;
    }
    // Regular expand: merge into result (this overrides any ID array)
    mergedExpand[key] = processedExpand[key];
  }

  // Return: original fields + expanded fields + back-relation shortcuts (no expand property)
  return {
    ...recordWithoutExpand,
    ...mergedExpand,
    ...shortcuts,
  } as PBRecord;
}

/**
 * Recursively process expand object to flatten nested back-relations
 * Returns a new expand object with processed values (including *_via_* keys)
 */
function processExpand(expand: PBExpand): PBExpand {
  const result: PBExpand = {};

  for (const [key, value] of Object.entries(expand)) {
    // Process the value recursively (include *_via_* keys now)
    if (Array.isArray(value)) {
      result[key] = value.map((item) => {
        if (item && typeof item === 'object' && 'expand' in item) {
          return processRecord(item as PBRecord);
        }
        return item;
      });
    } else if (value && typeof value === 'object' && 'expand' in value) {
      result[key] = processRecord(value as PBRecord);
    } else {
      result[key] = value;
    }
  }

  return result;
}

/**
 * Wrapper for a single PocketBase record with processed relations.
 * The instance has all record properties directly accessible.
 */
export class PBData {
  [key: string]: unknown;

  /**
   * Create PBData from a single record
   * @param record - A single PocketBase record
   */
  constructor(record: unknown) {
    // Unwrap 'data' property if present
    let unwrapped = record;
    if (record !== null && typeof record === 'object' && 'data' in record) {
      unwrapped = (record as Record<string, unknown>).data;
    }

    // Process the record
    const processed = processRecord(unwrapped as PBRecord);

    // Copy all properties from processed record to this instance
    Object.assign(this, processed);
  }

  /**
   * Get the processed record as a plain object
   */
  getRecord(): PBRecord {
    const { id, collectionId, collectionName, created, updated, ...rest } = this;
    return { id, collectionId, collectionName, created, updated, ...rest } as PBRecord;
  }
}

/**
 * Collection of processed PBRecord items with helper methods
 */
class PBItemCollection {
  private items: PBRecord[];

  constructor(data: PBRecord[]) {
    this.items = data.map((d) => processRecord(d));
  }

  /**
   * Get all items as processed records
   */
  get all(): PBRecord[] {
    return this.items;
  }

  /**
   * Get the first item as a processed record
   */
  get first(): PBRecord | undefined {
    return this.items[0];
  }

  /**
   * Get the last item as a processed record
   */
  get last(): PBRecord | undefined {
    return this.items[this.items.length - 1];
  }

  /**
   * Get the total count
   */
  get length(): number {
    return this.items.length;
  }

  /**
   * Convert to array (for iteration)
   */
  toArray(): PBRecord[] {
    return this.all;
  }

  /**
   * Map over items
   */
  map<T>(callback: (item: PBRecord) => T): T[] {
    return this.all.map(callback);
  }

  /**
   * Filter items
   */
  filter(callback: (item: PBRecord) => boolean): PBRecord[] {
    return this.all.filter(callback);
  }

  /**
   * Find an item
   */
  find(callback: (item: PBRecord) => boolean): PBRecord | undefined {
    return this.all.find(callback);
  }
}

/**
 * Wrapper for PocketBase list responses with pagination.
 *
 * List response structure:
 * {
 *   page: 1,
 *   perPage: 30,
 *   totalPages: 1,
 *   totalItems: 20,
 *   items: [...]
 * }
 */
export class PBDataList {
  private readonly page: number;
  private readonly perPage: number;
  private readonly totalPages: number;
  private readonly totalItems: number;
  private itemCollection: PBItemCollection;

  /**
   * Create PBDataList from a list response
   * @param response - A list response from PocketBase
   */
  constructor(response: unknown) {
    // Unwrap 'data' property if present
    let unwrapped = response;
    if (response !== null && typeof response === 'object' && 'data' in response) {
      unwrapped = (response as Record<string, unknown>).data;
    }

    // Check if it's a list response (has items array)
    if (unwrapped !== null && typeof unwrapped === 'object' && 'items' in unwrapped && Array.isArray((unwrapped as Record<string, unknown>).items)) {
      const listResponse = unwrapped as Record<string, unknown>;
      this.page = (listResponse.page as number) || 1;
      this.perPage = (listResponse.perPage as number) || 30;
      this.totalPages = (listResponse.totalPages as number) || 1;
      this.totalItems = (listResponse.totalItems as number) || 0;
      this.itemCollection = new PBItemCollection((listResponse.items as PBRecord[]) || []);
    } else {
      // Single item wrapped in list format
      this.page = 1;
      this.perPage = 1;
      this.totalPages = 1;
      this.totalItems = 1;
      this.itemCollection = new PBItemCollection([unwrapped as PBRecord]);
    }
  }

  /**
   * Access items collection with helper methods
   */
  get items(): PBItemCollection {
    return this.itemCollection;
  }

  /**
   * Get first item
   */
  get first(): PBRecord | undefined {
    return this.itemCollection.first;
  }

  /**
   * Get last item
   */
  get last(): PBRecord | undefined {
    return this.itemCollection.last;
  }

  /**
   * Current page number (1-based)
   */
  getPage(): number {
    return this.page;
  }

  /**
   * Items per page
   */
  getPerPage(): number {
    return this.perPage;
  }

  /**
   * Total number of pages
   */
  getTotalPages(): number {
    return this.totalPages;
  }

  /**
   * Total number of items
   */
  getTotalItems(): number {
    return this.totalItems;
  }

  /**
   * Check if there is a next page
   */
  get hasNextPage(): boolean {
    return this.page < this.totalPages;
  }

  /**
   * Check if there is a previous page
   */
  get hasPrevPage(): boolean {
    return this.page > 1;
  }
}
