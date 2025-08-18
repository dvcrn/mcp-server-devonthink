// Generated JXA Script Debug Output
// Tool: problematic_script
// Timestamp: 2025-08-18T09:13:17.721Z
// Size: 5276 bytes, 165 lines
// Functions: 0, Variables: 29
// Validation: FAILED

(function() {
  const theApp = Application("DEVONthink");
  theApp.includeStandardAdditions = true;
  // Variables
  const recordUuid = "123e4567-e89b-12d3-a456-426614174000";
  const analysisType = "concepts";

  // Functions
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
        return JSON.stringify({success: true, documents: uniqueDocuments.length});
  
  } catch (error) {
    const errorResult = {};
          errorResult["success"] = false;
          errorResult["error"] = error.toString();
          return JSON.stringify(errorResult);
  }
})();