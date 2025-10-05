/**
 * JXA Helper Functions
 * These functions are injected into JXA scripts to provide common functionality
 */

/**
 * Helper function to lookup a record by UUID
 */
export const lookupByUuidHelper = `
function lookupByUuid(theApp, uuid) {
  if (!uuid) return null;
  try {
    return theApp.getRecordWithUuid(uuid);
  } catch (e) {
    return null;
  }
}`;

/**
 * Helper function to lookup a record by ID
 */
export const lookupByIdHelper = `
function lookupById(theApp, id) {
  if (!id || typeof id !== "number") return null;
  try {
    return theApp.getRecordWithId(id);
  } catch (e) {
    return null;
  }
}`;

/**
 * Helper function to lookup a record by path
 * Navigates the hierarchy by splitting the path and traversing children
 * If database is provided, starts from database.root(), otherwise searches globally
 */
export const lookupByPathHelper = `
function lookupByPath(theApp, path, database) {
  if (!path) return null;
  try {
    // Remove leading/trailing slashes and split path into components
    const pathComponents = path.replace(/^\\/+|\\/+$/g, "").split("/").filter(p => p.length > 0);

    // If no components (root path), return database root or null
    if (pathComponents.length === 0) {
      return database ? database.root() : null;
    }

    // Start from database root if database provided
    if (!database) return null; // Path lookup requires database context

    let current = database.root();

    // Navigate through each path component
    for (const component of pathComponents) {
      const children = current.children();
      const found = children.find(c => c.name() === component);
      if (!found) return null;
      current = found;
    }

    return current;
  } catch (e) {
    return null;
  }
}`;

/**
 * Helper function to lookup a record by name
 */
export const lookupByNameHelper = `
function lookupByName(theApp, name, database) {
  if (!name || !database) return null;
  try {
    const searchOptions = {};
    searchOptions["in"] = database;
    const searchResults = theApp.search(name, searchOptions);
    if (!searchResults || searchResults.length === 0) return null;
    
    // Find exact name match
    const matches = searchResults.filter(r => r.name() === name);
    return matches.length > 0 ? matches[0] : null;
  } catch (e) {
    return null;
  }
}`;

/**
 * Master lookup function that tries all methods in order
 */
export const getRecordHelper = `
function getRecord(theApp, options) {
  if (!options) return null;
  
  let record = null;
  let error = null;
  
  // Try UUID first (most reliable)
  if (options.uuid) {
    record = lookupByUuid(theApp, options.uuid);
    if (record) {
      const result = {};
      result["record"] = record;
      result["method"] = "uuid";;
      return result;
    }
    // Use safer error message construction
    const uuidValue = options.uuid || "undefined";
    error = "UUID not found: " + uuidValue;
  }
  
  // Try ID next (fast and reliable)
  if (options.id) {
    record = lookupById(theApp, options.id);
    if (record) {
      const result = {};
      result["record"] = record;
      result["method"] = "id";
      return result;
    }
    const idValue = options.id || "undefined";
    if (!error) error = "ID not found: " + idValue;
  }
  
  // Try path (fast)
  if (options.path) {
    record = lookupByPath(theApp, options.path, options.database);
    if (record) {
      const result = {};
      result["record"] = record;
      result["method"] = "path";
      return result;
    }
    const pathValue = options.path || "undefined";
    if (!error) error = "Path not found: " + pathValue;
  }
  
  // Try name search as fallback (slower)
  if (options.name && options.database) {
    record = lookupByName(theApp, options.name, options.database);
    if (record) {
      const result = {};
      result["record"] = record;
      result["method"] = "name";
      return result;
    }
    const nameValue = options.name || "undefined";
    if (!error) error = "Name not found: " + nameValue;
  }
  
  const errorResult = {};
  errorResult["record"] = null;
  errorResult["error"] = error || "No valid lookup parameters provided";
  return errorResult;
}`;

/**
 * Helper to validate if a record is a group
 */
export const isGroupHelper = `
function isGroup(record) {
  if (!record) return false;
  const type = record.recordType();
  return type === "group" || type === "smart group";
}`;

/**
 * Helper to get database by name or use current
 */
export const getDatabaseHelper = `
function getDatabase(theApp, databaseName) {
  if (!databaseName) {
    return theApp.currentDatabase();
  }
  
  const databases = theApp.databases();
  const found = databases.find(db => db.name() === databaseName);
  if (!found) {
    throw new Error("Database not found: " + databaseName);
  }
  return found;
}`;

/**
 * Helper to convert DEVONthink record objects to plain JavaScript objects
 */
export const convertDevonthinkRecordHelper = `
function convertDevonthinkRecord(record) {
  if (!record) return null;
  
  const converted = {};
  try {
    // Basic properties
    converted["id"] = record.id();
    converted["uuid"] = record.uuid();
    converted["name"] = record.name();
    converted["type"] = record.type();
    converted["recordType"] = record.recordType();
    converted["location"] = record.location();
    converted["path"] = record.path();
    
    // Dates
    converted["creationDate"] = record.creationDate();
    converted["modificationDate"] = record.modificationDate();
    converted["additionDate"] = record.additionDate();
    
    // Size and counts
    converted["size"] = record.size();
    converted["wordCount"] = record.wordCount();
    converted["characterCount"] = record.characterCount();
    
    // URLs and aliases
    converted["url"] = record.url();
    converted["referenceURL"] = record.referenceURL();
    converted["aliases"] = record.aliases();
    
    // Tags and metadata
    converted["tags"] = record.tags();
    converted["comment"] = record.comment();
    converted["rating"] = record.rating();
    converted["label"] = record.label();
    
    // State flags
    converted["flagged"] = record.flagged();
    converted["unread"] = record.unread();
    converted["locking"] = record.locking();
    
    // Database info
    const db = record.database();
    if (db) {
      converted["databaseName"] = db.name();
      converted["databaseUuid"] = db.uuid();
    }
  } catch (e) {
    // If any property fails, continue with what we have
  }
  
  return converted;
}`;

/**
 * Get all JXA helpers as a single string
 */
export function getJXAHelpers(): string {
	return `
    // JXA Helper Functions
    ${lookupByUuidHelper}
    ${lookupByIdHelper}
    ${lookupByPathHelper}
    ${lookupByNameHelper}
    ${getRecordHelper}
    ${isGroupHelper}
    ${getDatabaseHelper}
    ${convertDevonthinkRecordHelper}
  `;
}

/**
 * Get specific helpers
 */
export function getRecordLookupHelpers(): string {
	return `
    ${lookupByUuidHelper}
    ${lookupByIdHelper}
    ${lookupByPathHelper}
    ${lookupByNameHelper}
    ${getRecordHelper}
  `;
}

/**
 * Format lookup options for JXA
 */
export function formatLookupOptions(
	uuid?: string,
	id?: number,
	path?: string,
	name?: string,
	databaseName?: string,
): string {
	const options: string[] = [];

	if (uuid) options.push(`uuid: ${JSON.stringify(uuid)}`);
	if (id !== undefined) options.push(`id: ${id}`);
	if (path) options.push(`path: ${JSON.stringify(path)}`);
	if (name) options.push(`name: ${JSON.stringify(name)}`);
	if (databaseName) options.push(`databaseName: ${JSON.stringify(databaseName)}`);

	return `{ ${options.join(", ")} }`;
}
