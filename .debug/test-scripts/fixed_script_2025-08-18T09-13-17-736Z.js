// Generated JXA Script Debug Output
// Tool: fixed_script
// Timestamp: 2025-08-18T09:13:17.736Z
// Size: 8301 bytes, 280 lines
// Functions: 5, Variables: 42
// Validation: PASSED

(function() {
  const theApp = Application("DEVONthink");
  theApp.includeStandardAdditions = true;
  // Variables
  const recordUuid = "123e4567-e89b-12d3-a456-426614174000";
  const analysisType = "concepts";

  // Functions
  // helpers

    
  function lookupByUuid(theApp, uuid) {
    if (!uuid) return null;
    try {
      return theApp.getRecordWithUuid(uuid);
    } catch (e) {
      return null;
    }
  }
    
  function lookupById(theApp, id) {
    if (!id || typeof id !== "number") return null;
    try {
      return theApp.getRecordWithId(id);
    } catch (e) {
      return null;
    }
  }
    
  function lookupByPath(theApp, path) {
    if (!path) return null;
    try {
      return theApp.getRecordAt(path);
    } catch (e) {
      return null;
    }
  }
    
  function lookupByName(theApp, name, database) {
    if (!name || !database) return null;
    try {
      const searchOptions = {};
      searchOptions["in"] = database;
      const searchResults = theApp.search(name, searchOptions);
      if (!searchResults || searchResults.length === 0) return null;
    
      // Find exact name match
      const matches = searchResults.filter(function(r) { return r.name() === name; });
      return matches.length > 0 ? matches[0] : null;
    } catch (e) {
      return null;
    }
  }
    
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
      record = lookupByPath(theApp, options.path);
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
  }
  

  // documentCollection
  // Document collection function
  const collectTargetDocuments = function() {
    let targetDocuments = [];
  
    // Handle single document lookup
    if (recordUuid || recordId || recordPath) {
      const lookupOptions = {};
      lookupOptions["uuid"] = recordUuid;
      lookupOptions["id"] = recordId;
      lookupOptions["databaseName"] = databaseName;
      lookupOptions["path"] = recordPath;
    
      const lookupResult = getRecord(theApp, lookupOptions);
    
      if (!lookupResult.record) {
        let errorMsg = "Record not found";
        if (recordUuid) {
          errorMsg += " with UUID: " + recordUuid;
        } else if (recordId && databaseName) {
          errorMsg += " with ID " + recordId + " in database: " + databaseName;
        } else if (recordPath) {
          errorMsg += " at path: " + recordPath;
        }
        throw new Error(errorMsg);
      }
    
      const record = lookupResult.record;
      const recordType = record.recordType();
      if (recordType === "group" || recordType === "smart group") {
        throw new Error("Cannot analyze themes for groups directly. Use groupUuid to analyze documents within a group.");
      }
    
      targetDocuments.push(record);
    }
  
    // Handle multiple document UUIDs
    if (recordUuids && recordUuids.length > 0) {
      for (let i = 0; i < recordUuids.length; i++) {
        try {
          const record = theApp.getRecordWithUuid(recordUuids[i]);
          if (record) {
            const recordType = record.recordType();
            if (recordType !== "group" && recordType !== "smart group") {
              targetDocuments.push(record);
            }
          }
        } catch (recordError) {
          // Skip missing records silently
        }
      }
    }
  
    // Handle search query
    if (searchQuery) {
      try {
        const searchOptions = {};
        searchOptions["comparison"] = "phrase";
      
        const searchResults = theApp.search(searchQuery, searchOptions);
        if (searchResults && searchResults.length > 0) {
          const filteredResults = searchResults
            .filter(function(record) {
              const recordType = record.recordType();
              return recordType !== "group" && recordType !== "smart group";
            })
            .slice(0, Math.min(30, searchResults.length));
        
          // Use ES5 compatible array concatenation
          for (let i = 0; i < filteredResults.length; i++) {
            targetDocuments.push(filteredResults[i]);
          }
        }
      } catch (searchError) {
        // Search failures are non-fatal
      }
    }
  
    // Handle group-based analysis
    if (groupUuid) {
      try {
        const groupRecord = theApp.getRecordWithUuid(groupUuid);
        if (!groupRecord) {
          throw new Error("Group not found with UUID: " + groupUuid);
        }
      
        const groupType = groupRecord.recordType();
        if (groupType !== "group" && groupType !== "smart group") {
          throw new Error("UUID does not reference a group: " + groupUuid);
        }
      
        // Recursive document collection
        const getAllDocuments = function(group) {
          const documents = [];
          const children = group.children();
        
          for (let i = 0; i < children.length; i++) {
            const child = children[i];
            const childType = child.recordType();
          
            if (childType === "group" || childType === "smart group") {
              const childDocuments = getAllDocuments(child);
              for (let j = 0; j < childDocuments.length; j++) {
                documents.push(childDocuments[j]);
              }
            } else {
              documents.push(child);
            }
          }
        
          return documents;
        };
      
        const groupDocuments = getAllDocuments(groupRecord);
        for (let i = 0; i < groupDocuments.length; i++) {
          targetDocuments.push(groupDocuments[i]);
        }
      } catch (groupError) {
        throw new Error("Error accessing group: " + groupError.toString());
      }
    }
  
    // Remove duplicates and limit for performance
    const uniqueDocuments = [];
    const seenUuids = {};
  
    for (let i = 0; i < targetDocuments.length; i++) {
      const doc = targetDocuments[i];
      const docUuid = doc.uuid();
    
      if (!seenUuids[docUuid]) {
        seenUuids[docUuid] = true;
        uniqueDocuments.push(doc);
      }
    }
  
    // Limit to 50 documents for performance
    if (uniqueDocuments.length > 50) {
      uniqueDocuments.splice(50);
    }
  
    return uniqueDocuments;
  };

  // Main execution
  try {

        const uniqueDocuments = collectTargetDocuments();
        const result = {};
        result["success"] = true;
        result["documentCount"] = uniqueDocuments.length;
        return JSON.stringify(result);
  
  } catch (error) {
    const errorResult = {};
          errorResult["success"] = false;
          errorResult["error"] = error.toString();
          return JSON.stringify(errorResult);
  }
})();