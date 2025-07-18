# DEVONthink JavaScript for Automation Reference Guide

This document provides a reference to the JavaScript for Automation (JXA) interface for DEVONthink. For more detailed examples, see the AppleScript reference guide, as the function parameters are similar between the two interfaces.

## Getting Started

```javascript
(() => {
  const theApp = Application("DEVONthink");
  theApp.includeStandardAdditions = true;
  
  // Your code here
})();
```

## Commands Reference

This section provides a compact reference to all DEVONthink JXA commands, including required and optional parameters.

### Database Management

#### createDatabase(path, [encryptionKey], [size])
Creates a new database.
- `path`: String - POSIX file path of database (suffix: .dtBase2, .dtSparse, .dtArchive)
- `encryptionKey`: String (optional) - The encryption key
- `size`: Number (optional) - The maximal size of encrypted databases in MB
- Returns: Database object or null

#### openDatabase(path)
Opens an existing database.
- `path`: String - POSIX file path of database
- Returns: Database object or null

#### checkFileIntegrityOf({database})
Checks the file integrity of a database.
- `database`: Database - The database to check
- Returns: Number - Count of files with invalid content hash

#### optimize({database})
Backup & optimize a database.
- `database`: Database - The database to optimize
- Returns: Boolean - Success status

#### verify({database})
Verifies a database.
- `database`: Database - The database to verify
- Returns: Number - Total error count

#### compress({database, [password], to})
Compresses a database into a Zip archive.
- `database`: Database - The database to compress
- `password`: String (optional) - The password for encryption
- `to`: String - Destination path with .zip extension
- Returns: Boolean - Success status

### Record Management

#### createRecordWith(properties, [options])
Creates a new record.
- `properties`: Object - The record properties (must include 'type' or 'record type')
- `options`: Object (optional) - Additional options
  - `in`: Parent (optional) - The destination group
- Returns: Record object or null

#### delete({record, [in]})
Deletes record(s).
- `record`: Record or Array of Records - The record(s) to delete
- `in`: Parent (optional) - The parent group for specific instance
- Returns: Boolean - Success status

#### move({record, [from], to})
Moves record(s).
- `record`: Record or Array of Records - The record(s) to move
- `from`: Parent (optional) - The source group
- `to`: Parent - The destination group
- Returns: Record, Array of Records, or null

#### duplicate({record, to})
Duplicates record(s).
- `record`: Record or Array of Records - The record(s) to duplicate
- `to`: Parent - The destination group
- Returns: Record, Array of Records, or null

#### replicate({record, to})
Replicates record(s).
- `record`: Record or Array of Records - The record(s) to replicate
- `to`: Parent - The destination group
- Returns: Record, Array of Records, or null

#### convert({record, [to], [in]})
Converts record(s) to a different format.
- `record`: Content or Array of Content - The record(s) to convert
- `to`: String (optional) - The desired format (default: "simple")
- `in`: Parent (optional) - The destination group
- Returns: Content, Array of Content, or null

### Metadata Management

#### addCustomMetaData(value, {for, to, [as]})
Adds user-defined metadata to a record.
- `value`: Any - The value to add (text, number, date, boolean)
- `for`: String - The key for the user-defined value
- `to`: Record - The record to add metadata to
- `as`: String (optional) - The desired format ("text", "richtext", etc.)
- Returns: Boolean - Success status

#### getCustomMetaData({[defaultValue], for, from})
Gets user-defined metadata from a record.
- `defaultValue`: Any (optional) - Default value if metadata doesn't exist
- `for`: String - The key of the user-defined value
- `from`: Record - The record to get metadata from
- Returns: The metadata value or null

### Reminders

#### addReminder(properties, {to})
Adds a reminder to a record.
- `properties`: Object - Reminder properties (must include 'schedule' and 'due date')
  - `alarm`: String - The notification type
  - `alarm string`: String (optional) - Additional info based on alarm type
  - `schedule`: String - The frequency
  - `due date`: Date - When the reminder is due
  - And other properties
- `to`: Record - The record to add the reminder to
- Returns: Reminder object or null

### Search & Classification

#### search(query, [options])
Searches for records.
- `query`: String (optional) - The search string
- `options`: Object (optional)
  - `comparison`: String (optional) - The comparison type
  - `excludeSubgroups`: Boolean (optional) - Don't search in subgroups
  - `in`: Parent (optional) - The group to search in
- Returns: Array of Records or null

#### showSearch(query)
Performs search in frontmost window.
- `query`: String (optional) - The search string
- Returns: Boolean - Success status

#### classify({record, [in], [comparison], [tags]})
Gets classification proposals.
- `record`: Record - The record to classify
- `in`: Database (optional) - The database to search in
- `comparison`: String (optional) - The comparison type
- `tags`: Boolean (optional) - Propose tags instead of groups
- Returns: Array of Parents or null

#### compare({[record], [content], [to], [comparison]})
Gets similar records.
- `record`: Content (optional) - The record to compare
- `content`: String (optional) - The content to compare
- `to`: Database (optional) - The database to search in
- `comparison`: String (optional) - The comparison type
- Returns: Array of Content or null

### Lookup Records

#### lookupRecordsWithComment(comment, [options])
Finds records with specified comment.
- `comment`: String - The comment to search for
- `options`: Object (optional)
  - `in`: Database (optional) - The database to search in
- Returns: Array of Records or null

#### lookupRecordsWithContentHash(hash, [options])
Finds records with specified content hash.
- `hash`: String - The content hash to search for
- `options`: Object (optional)
  - `in`: Database (optional) - The database to search in
- Returns: Array of Records or null

#### lookupRecordsWithFile(filename, [options])
Finds records with specified filename.
- `filename`: String - The filename to search for
- `options`: Object (optional)
  - `in`: Database (optional) - The database to search in
- Returns: Array of Content or null

#### lookupRecordsWithPath(path, [options])
Finds records with specified path.
- `path`: String - The path to search for
- `options`: Object (optional)
  - `in`: Database (optional) - The database to search in
- Returns: Array of Records or null

#### lookupRecordsWithURL(url, [options])
Finds records with specified URL.
- `url`: String - The URL to search for
- `options`: Object (optional)
  - `in`: Database (optional) - The database to search in
- Returns: Array of Records or null

#### lookupRecordsWithTags(tags, [options])
Finds records with specified tags.
- `tags`: Array of String - The tags to search for
- `options`: Object (optional)
  - `any`: Boolean (optional) - Match any tag instead of all
  - `in`: Database (optional) - The database to search in
- Returns: Array of Records or null

### Web Content

#### createFormattedNoteFrom(url, [options])
Creates a formatted note from a web page.
- `url`: String - The URL to download
- `options`: Object (optional)
  - `agent`: String (optional) - User agent
  - `in`: Parent (optional) - Destination group
  - `name`: String (optional) - Name for the new record
  - `readability`: Boolean (optional) - Declutter page
  - `referrer`: String (optional) - HTTP referrer
  - `source`: String (optional) - HTML source
- Returns: Content or null

#### createMarkdownFrom(url, [options])
Creates a Markdown document from a web resource.
- `url`: String - The URL to download
- `options`: Object (optional) - Similar to createFormattedNoteFrom
- Returns: Content or null

#### createPDFDocumentFrom(url, [options])
Creates a PDF from a web resource.
- `url`: String - The URL to download
- `options`: Object (optional)
  - Similar to createFormattedNoteFrom plus:
  - `pagination`: Boolean (optional) - Paginate PDF
  - `width`: Number (optional) - Width for PDF in points
- Returns: Content or null

#### createWebDocumentFrom(url, [options])
Creates a record from a web resource.
- `url`: String - The URL to download
- `options`: Object (optional) - Similar to createFormattedNoteFrom
- Returns: Content or null

#### downloadURL(url, [options])
Downloads data from a URL.
- `url`: String - The URL to download
- `options`: Object (optional)
  - `agent`: String (optional) - User agent
  - `method`: String (optional) - HTTP method
  - `password`: String (optional) - Password for protected sites
  - `post`: Object (optional) - POST parameters
  - `referrer`: String (optional) - HTTP referrer
  - `user`: String (optional) - Username for protected sites
- Returns: Raw data or null

#### downloadMarkupFrom(url, [options])
Downloads HTML/XML content.
- `url`: String - The URL to download
- `options`: Object (optional) - Similar to downloadURL plus:
  - `encoding`: String (optional) - Text encoding
- Returns: String or null

#### downloadJSONFrom(url, [options])
Downloads a JSON object.
- `url`: String - The URL to download
- `options`: Object (optional) - Similar to downloadURL
- Returns: Object or null

#### convertFeedToHTML(feedText, [options])
Converts a feed to HTML.
- `feedText`: String - The feed content
- `options`: Object (optional)
  - `baseURL`: String (optional) - The feed URL
- Returns: String or null

### Importing & Exporting

#### importPath(path, [options])
Imports a file or folder.
- `path`: String - The file/folder path
- `options`: Object (optional)
  - `from`: String (optional) - Source application
  - `name`: String (optional) - Record name
  - `placeholders`: Object (optional) - Template placeholders
  - `to`: Parent (optional) - Destination group
- Returns: Record or null

#### importTemplate(path, [options])
Imports a template.
- `path`: String - The template path
- `options`: Object (optional)
  - `to`: Parent (optional) - Destination group
- Returns: Record or null

#### indexPath(path, [options])
Indexes a file or folder.
- `path`: String - The file/folder path
- `options`: Object (optional)
  - `to`: Parent (optional) - Destination group
- Returns: Record or null

#### export({record, to, [DEVONtech_Storage]})
Exports a record.
- `record`: Record - The record to export
- `to`: String - Destination directory path
- `DEVONtech_Storage`: Boolean (optional) - Export metadata
- Returns: String or null - The export path

#### exportWebsite({record, to, [options]})
Exports a record as a website.
- `record`: Record - The record to export
- `to`: String - Destination directory path
- `options`: Object (optional)
  - `template`: String (optional) - Template name or path
  - `indexPages`: Boolean (optional) - Create index pages
  - `encoding`: String (optional) - HTML encoding
  - `entities`: Boolean (optional) - Use HTML entities
- Returns: String or null - The export path

#### exportTagsOf({record})
Exports Finder tags of a record.
- `record`: Record - The record
- Returns: Boolean - Success status

### OCR

#### ocr({file, [options]})
Performs OCR on an image.
- `file`: String - File path
- `options`: Object (optional)
  - `attributes`: Object (optional) - PDF properties
  - `to`: Parent (optional) - Destination group
  - `fileType`: String (optional) - Output format
  - `waitingForReply`: Boolean (optional) - Wait for completion
- Returns: Content or null

#### convertImage({record, [options]})
Converts an image record with OCR.
- `record`: Content - Image record
- `options`: Object (optional) - Similar to ocr
- Returns: Content or null

### Imprinting

#### imprinterConfigurationNames()
Gets imprinter configuration names.
- Returns: Array of String or null

#### imprintConfiguration(name, {to, [waitingForReply]})
Imprints with a saved configuration.
- `name`: String - Configuration name
- `to`: Content - Record to imprint
- `waitingForReply`: Boolean (optional) - Wait for completion
- Returns: Boolean - Success status

#### imprint({record, [options]})
Imprints a record.
- `record`: Content - Record to imprint
- `options`: Object - Various formatting options:
  - `font`: String (required) - Font name
  - `position`: String (required) - Position on page
  - `size`: Number (required) - Font size
  - `text`: String (required) - Text to imprint
  - And many optional formatting parameters
- Returns: Boolean - Success status

### Windows and UI

#### openTabFor({[record], [URL], [referrer], [in]})
Opens a new tab.
- `record`: Record (optional) - Record to open
- `URL`: String (optional) - URL to open
- `referrer`: String (optional) - HTTP referrer
- `in`: ThinkWindow (optional) - Target window
- Returns: Tab or null

#### openWindowFor({record, [enforcement]})
Opens a window for a record.
- `record`: Record - Record to open
- `enforcement`: Boolean (optional) - Force new window
- Returns: ThinkWindow or null

#### displayGroupSelector([title], [options])
Displays group selector dialog.
- `title`: String (optional) - Dialog title
- `options`: Object (optional)
  - `buttons`: Array (optional) - Button labels
  - `for`: Database (optional) - Database to show
  - `name`: Boolean (optional) - Show name field
  - `tags`: Boolean (optional) - Show tags field
- Returns: Parent, GroupSelectorResult, or null

#### displayNameEditor([title], [options])
Displays name editor dialog.
- `title`: String (optional) - Dialog title
- `options`: Object (optional)
  - `defaultAnswer`: String (optional) - Default name
  - `info`: String (optional) - Info text
- Returns: String or null

#### displayDateEditor([title], [options])
Displays date editor dialog.
- `title`: String (optional) - Dialog title
- `options`: Object (optional)
  - `defaultDate`: Date (optional) - Default date
  - `info`: String (optional) - Info text
- Returns: Date or null

#### displayAuthenticationDialog([info])
Displays authentication dialog.
- `info`: String (optional) - Dialog info
- Returns: AuthenticationResult or null

#### doJavaScript(code, [options])
Executes JavaScript code.
- `code`: String - JavaScript code
- `options`: Object (optional)
  - `in`: ThinkWindow (optional) - Window context
- Returns: String or null

### Progress Indicators

#### showProgressIndicator(title, [options])
Shows progress indicator.
- `title`: String - Progress title
- `options`: Object (optional)
  - `cancelButton`: Boolean (optional) - Show cancel button
  - `steps`: Number (optional) - Number of steps
- Returns: Boolean - Success status

#### stepProgressIndicator([info])
Updates progress indicator.
- `info`: String (optional) - Step info
- Returns: Boolean - Success status

#### hideProgressIndicator()
Hides progress indicator.
- Returns: Boolean - Success status

### Versions

#### saveVersionOf({record})
Saves a version of a record.
- `record`: Record - Record to version
- Returns: Record or null - The saved version

#### getVersionsOf({record})
Gets versions of a record.
- `record`: Record - Record to get versions from
- Returns: Array of Record or null - The versions

#### restoreRecordWith({version})
Restores a record version.
- `version`: Record - Version to restore
- Returns: Boolean - Success status

### Workspace Management

#### saveWorkspace(name)
Saves a workspace.
- `name`: String - Workspace name
- Returns: Boolean - Success status

#### loadWorkspace(name)
Loads a workspace.
- `name`: String - Workspace name
- Returns: Boolean - Success status

#### deleteWorkspace(name)
Deletes a workspace.
- `name`: String - Workspace name
- Returns: Boolean - Success status

### Download Management

#### addDownload(url, [options])
Adds download to queue.
- `url`: String - URL to download
- `options`: Object (optional)
  - `automatic`: Boolean (optional) - Automatic download
  - `password`: String (optional) - Site password
  - `referrer`: String (optional) - HTTP referrer
  - `user`: String (optional) - Site username
- Returns: Boolean - Success status

#### startDownloads()
Starts download queue.
- Returns: Boolean - Success status

#### stopDownloads()
Stops download queue.
- Returns: Boolean - Success status

### AI and Content Analysis

#### getChatModelsForEngine(engine)
Gets available chat models.
- `engine`: String - The AI engine
- Returns: Array of String - Available models

#### getChatResponseForMessage(message, [options])
Gets AI chat response.
- `message`: String/Object - Prompt or message
- `options`: Object (optional)
  - `record`: Record/Array (optional) - Document(s) for context
  - `mode`: String (optional) - Content usage mode
  - `image`: RawData (optional) - Image for analysis
  - `url`: String (optional) - URL for analysis
  - `model`: String (optional) - AI model
  - `role`: String (optional) - Chat role
  - `engine`: String (optional) - AI engine
  - `temperature`: Number (optional) - Randomness (0-2)
  - `as`: String (optional) - Response format
- Returns: String/Object - The response

#### displayChatDialog(window, [options])
Shows chat dialog.
- `window`: Window - The context window
- `options`: Object (optional)
  - `name`: String (optional) - Dialog title
  - `role`: String (optional) - Chat role
  - `prompt`: String (optional) - Chat prompt
- Returns: String or null - Response text

#### summarizeContentsOf({[in], records, to, [as]})
Summarizes content.
- `in`: Parent (optional) - Destination group
- `records`: Array of Content - Records to summarize
- `to`: String - Output format
- `as`: String (optional) - Summary style
- Returns: Content or null - Summary record

#### summarizeHighlightsOf({[in], records, to})
Summarizes highlights.
- `in`: Parent (optional) - Destination group
- `records`: Array of Content - Records to summarize
- `to`: String - Output format
- Returns: Content or null - Summary record

#### summarizeMentionsOf({[in], records, to})
Summarizes mentions.
- `in`: Parent (optional) - Destination group
- `records`: Array of Content - Records to summarize
- `to`: String - Output format
- Returns: Content or null - Summary record

#### summarizeText(text, [options])
Summarizes text.
- `text`: String - Text to summarize
- `options`: Object (optional)
  - `as`: String (optional) - Summary style
- Returns: String or null - Summarized text

#### extractKeywordsFrom({record, [options]})
Extracts keywords.
- `record`: Record - Record to analyze
- `options`: Object (optional)
  - `barcodes`: Boolean (optional) - Include barcodes
  - `existingTags`: Boolean (optional) - Include existing tags
  - `hashTags`: Boolean (optional) - Include hash tags
  - `imageTags`: Boolean (optional) - Include image tags
- Returns: Array of String or null - Keywords

### Miscellaneous

#### addReadingList({[record], [URL], [title]})
Adds to reading list.
- `record`: Record (optional) - Record to add
- `URL`: String (optional) - URL to add
- `title`: String (optional) - Title for URL
- Returns: Boolean - Success status

#### logMessage([path], [options])
Logs to Window > Log panel.
- `path`: String (optional) - Path or action
- `options`: Object (optional)
  - `record`: Record (optional) - Associated record
  - `info`: String (optional) - Additional information
- Returns: Boolean - Success status

#### moveIntoDatabase({record})
Moves indexed record into database.
- `record`: Record - Record to move
- Returns: Boolean - Success status

#### moveToExternalFolder({record, [to]})
Moves record to external folder.
- `record`: Record - Record to move
- `to`: String (optional) - Destination folder
- Returns: Boolean - Success status

#### merge({[in], records})
Merges records.
- `in`: Parent (optional) - Destination group
- `records`: Array of Record - Records to merge
- Returns: Record or null - Merged record

#### pasteClipboard([options])
Creates record from clipboard.
- `options`: Object (optional)
  - `to`: Parent (optional) - Destination group
- Returns: Record or null - Created record

#### refresh({record})
Refreshes a record (feeds).
- `record`: Record - Record to refresh
- Returns: Boolean - Success status

#### synchronize({[record], [database]})
Synchronizes records or database.
- `record`: Record (optional) - Record to sync
- `database`: Database (optional) - Database to sync
- Returns: Boolean - Success status

#### createLocation(path, [options])
Creates a group hierarchy.
- `path`: String - Group path hierarchy
- `options`: Object (optional)
  - `in`: Database (optional) - Target database
- Returns: Parent or null - Created group

#### createThumbnail({for})
Creates/updates thumbnail.
- `for`: Record - Target record
- Returns: Boolean - Success status

#### updateThumbnail({of})
Updates thumbnail.
- `of`: Record - Target record
- Returns: Boolean - Success status

#### deleteThumbnail({of})
Deletes thumbnail.
- `of`: Record - Target record
- Returns: Boolean - Success status

#### performSmartRule([options])
Runs smart rules.
- `options`: Object (optional)
  - `name`: String (optional) - Rule name
  - `record`: Record (optional) - Target record
  - `trigger`: String (optional) - Trigger event
- Returns: Boolean - Success status

#### downloadImageForPrompt(prompt, [options])
Downloads AI-generated image.
- `prompt`: String - Image prompt
- `options`: Object (optional)
  - `engine`: String (optional) - AI engine
  - `quality`: String (optional) - Image quality
  - `size`: String (optional) - Image dimensions
  - `style`: String (optional) - Image style
- Returns: RawData or null - Image data

## Properties Reference

### Application Properties
- `batesNumber`: Number - Current bates number
- `cancelledProgress`: Boolean (read-only) - Progress canceled status
- `currentGroup`: Parent (read-only) - Current group
- `currentWorkspace`: String (read-only) - Current workspace name
- `currentDatabase`: Database (read-only) - Current database
- `contentRecord`: Content (read-only) - Visible document
- `inbox`: Database (read-only) - Global inbox
- `incomingGroup`: Parent (read-only) - Default group for new items
- `labelNames`: Array (read-only) - Label names
- `lastDownloadedResponse`: HTTPResponse (read-only) - Latest response
- `lastDownloadedURL`: String (read-only) - Latest download URL
- `preferredImportDestination`: Parent (read-only) - Default import location
- `readingList`: Array (read-only) - Reading list items
- `selection`: Array (read-only) - Current selection
- `strictDuplicateRecognition`: Boolean - Duplicate detection strictness
- `workspaces`: Array (read-only) - Available workspaces

### Database Properties
- `id`: Number (read-only) - Scripting identifier
- `uuid`: String (read-only) - Unique identifier
- `annotationsGroup`: Parent (read-only) - Annotations group
- `comment`: String - Database comment
- `currentGroup`: Parent (read-only) - Current group
- `incomingGroup`: Parent (read-only) - Default group
- `encrypted`: Boolean (read-only) - Encryption status
- `auditProof`: Boolean (read-only) - Audit trail status
- `readOnly`: Boolean (read-only) - Read-only status
- `spotlightIndexing`: Boolean - Spotlight indexing status
- `versioning`: Boolean - Versioning status
- `name`: String - Database name
- `filename`: String (read-only) - Database filename
- `path`: String (read-only) - Database path
- `root`: Parent (read-only) - Top level group
- `tagsGroup`: Parent (read-only) - Tags group
- `trashGroup`: Parent (read-only) - Trash group
- `versionsGroup`: Parent (read-only) - Versions group

### Record Properties
- `id`: Number (read-only) - Scripting identifier
- `mimeType`: String (read-only) - MIME type
- `uuid`: String (read-only) - Unique identifier
- `additionDate`: Date (read-only) - Addition date
- `aliases`: String - Wiki aliases
- `altitude`: Number - Altitude in meters
- `annotation`: Content - Record annotation
- `annotationCount`: Number (read-only) - Annotation count
- `webArchive`: RawData (read-only) - Web archive data
- `attachedScript`: String - Attached script path
- `attachmentCount`: Number (read-only) - Attachment count
- `attributesChangeDate`: Date - Attributes change date
- `batesNumber`: Number - Bates number
- `cells`: Array - Sheet cells data
- `characterCount`: Number (read-only) - Character count
- `color`: RGBColor - Record color
- `columns`: Array (read-only) - Sheet column names
- `comment`: String - Record comment
- `contentHash`: String (read-only) - Content hash
- `creationDate`: Date - Creation date
- `customMetaData`: Object - User-defined metadata
- `data`: RawData - File data
- `database`: Database (read-only) - Database
- `date`: Date - Record date
- `digitalObjectIdentifier`: String (read-only) - DOI
- `dimensions`: Array (read-only) - Width/height
- `documentAmount`: String (read-only) - Extracted amount
- `documentDate`: Date (read-only) - First extracted date
- `allDocumentDates`: Array (read-only) - All extracted dates
- `documentName`: String (read-only) - Extracted name
- `dpi`: Number (read-only) - Image resolution
- `duplicates`: Array (read-only) - Duplicate records
- `duration`: Number (read-only) - Media duration
- Various exclude properties (classification, search, tagging, Wiki linking)
- `filename`: String (read-only) - Current filename
- `geolocation`: String - Human-readable location
- `height`: Number (read-only) - Image/PDF height
- `image`: Any - Image/PDF content
- `indexed`: Boolean (read-only) - Index status
- `internationalStandardBookNumber`: String (read-only) - ISBN
- `interval`: Number - Feed refresh interval
- `encrypted`: Boolean (read-only) - Document encryption
- `pending`: Boolean (read-only) - Sync pending status
- `kind`: String (read-only) - Record kind
- `label`: Number - Label index (0-7)
- `latitude`: Number - Latitude
- `location`: String (read-only) - Database location path
- `locationGroup`: Parent (read-only) - Location group
- `locationWithName`: String (read-only) - Full location with name
- `locking`: Boolean - Lock status
- `longitude`: Number - Longitude
- `metaData`: Object (read-only) - Document metadata
- `modificationDate`: Date - Modification date
- `name`: String - Record name
- Various name properties (withoutDate, withoutExtension)
- Document date properties (newest, oldest)
- `numberOfDuplicates`: Number (read-only) - Duplicate count
- `numberOfHits`: Number - Hit count
- `numberOfReplicants`: Number (read-only) - Replicant count
- `openingDate`: Date (read-only) - Last opened date
- `pageCount`: Number (read-only) - Page count
- `paginatedPDF`: RawData (read-only) - Paginated PDF
- `path`: String - File path
- `plainText`: String - Plain text content
- `proposedFilename`: String (read-only) - Suggested filename
- `rating`: Number - Rating (0-5)
- `recordType`: String (read-only) - Record type
- `referenceURL`: String (read-only) - Reference URL
- `reminder`: Reminder - Record reminder
- `richText`: RichText - Rich text content
- `score`: Number (read-only) - Match score
- `size`: Number (read-only) - Size in bytes
- `source`: String - HTML/XML source
- `flag`: Boolean - Flag state
- `tagType`: String (read-only) - Tag type
- `tags`: Array - Record tags
- `thumbnail`: Any - Record thumbnail
- `unread`: Boolean - Unread status
- `url`: String - Record URL
- `width`: Number (read-only) - Width in pixels/points
- `wordCount`: Number (read-only) - Word count

### Reminder Properties
- `alarm`: String - Alarm type
- `alarmString`: String - Additional alarm information
- `dayOfWeek`: String - Scheduled day
- `dueDate`: Date - Due date
- `interval`: Number - Schedule interval
- `masc`: Number - Schedule bitmap
- `schedule`: String - Reminder frequency
- `weekOfMonth`: String - Scheduled week

## Data Types

### Record Types
- `group` - Container for other records
- `smart group` - Dynamic group based on search
- `feed` - RSS/RDF/Atom feed
- `bookmark` - Internet/filesystem location
- `formatted note` - Rich text note
- `HTML` - HTML document
- `webarchive` - Web archive
- `markdown` - Markdown document
- `txt` - Text document
- `RTF` - RTF document
- `RTFD` - RTFD document
- `picture` - Image
- `multimedia` - Audio/video file
- `PDF document` - PDF document
- `sheet` - Sheet
- `XML` - XML document
- `property list` - Property list
- `AppleScript file` - AppleScript file
- `unknown` - Unknown file type

### Enumeration Values

#### Comparison Types
- `data comparison` - Uses text & metadata
- `tags comparison` - Uses tags

#### Convert Types
- `bookmark`, `simple`, `rich`, `note`, `markdown`, `HTML`, `webarchive`, `PDF document`, `single page PDF document`, `PDF without annotations`, `PDF with annotations burnt in`

#### Reminder Alarms
- `no alarm`, `dock`, `sound`, `speak`, `notification`, `alert`, `open internally`, `open externally`, `launch`, `mail with item link`, `mail with attachment`, `add to reading list`, `embedded script`, `embedded JXA script`, `external script`

#### Reminder Schedules
- `never`, `once`, `hourly`, `daily`, `weekly`, `monthly`, `yearly`

#### Update Modes
- `replacing`, `appending`, `inserting`

#### Search Comparison
- `no case` - Case insensitive search
- `no umlauts` - Diacritics insensitive search
- `fuzzy` - Fuzzy search
- `related` - Related search

#### Summary Styles
- `list summary` - Bullet list summary
- `key points summary` - Key points summary
- `table summary` - Table summary
- `text summary` - Text summary
- `custom summary` - Custom summary

#### Border Styles
- `none` - No border
- `rectangle` - Rectangular border
- `rounded rectangle` - Rectangle with rounded corners
- `oval` - Oval border
- `left arrow` - Left arrow
- `right arrow` - Right arrow

#### Imprint Positions
- `top left`, `top center`, `top right`
- `center left`, `centered`, `center right`
- `bottom left`, `bottom center`, `bottom right`

#### Occurrence Types
- `every page` - Imprint every page
- `first page only` - Imprint first page only
- `even pages` - Imprint even pages only
- `odd pages` - Imprint odd pages only

#### Rule Events
- `no event`, `open event`, `open externally event`, `edit externally event`
- `launch event`, `creation event`, `import event`, `clipping event`
- `download event`, `rename event`, `move event`, `classify event`
- `replicate event`, `duplicate event`, `tagging event`, `flagging event`
- `labelling event`, `rating event`, `move into database event`
- `move to external folder event`, `commenting event`, `convert event`
- `OCR event`, `imprint event`, `trashing event`

#### Chat Engines
- `ChatGPT` - OpenAI's ChatGPT
- `Claude` - Anthropic's Claude
- `Mistral AI` - Mistral's AI
- `GPT4All` - Nomic's GPT4All
- `LM Studio` - Element Lab's LM Studio
- `Ollama` - Ollama
- `Gemini` - Google's Gemini

#### Image Engines
- `DallE2` - OpenAI's Dall-E 2
- `DallE3` - OpenAI's Dall-E 3
- `FluxSchnell` - Black Forest Labs' Flux Schnell
- `FluxPro` - Black Forest Labs' Flux Pro
- `FluxProUltra` - Black Forest Labs' Flux Pro Ultra
- `Recraft3` - Recraft AI's Recraft 3
- `StableDiffusion` - Stability AI's Stable Diffusion 3.5 Large

## Object Models

### ThinkWindow
A window object that can be either a document window or main window.
- Properties:
  - `pdf`: RawData (read-only) - PDF of visible document
  - `webArchive`: RawData (read-only) - Web archive
  - `currentLine`: Number (read-only) - Current line index
  - `currentMovieFrame`: RawData (read-only) - Current video frame
  - `currentTime`: Number - Current media time
  - `currentPage`: Number - Current PDF page
  - `currentTab`: Tab - Selected tab
  - `database`: Database (read-only) - Window's database
  - `contentRecord`: Content (read-only) - Visible document
  - `loading`: Boolean (read-only) - Web page loading status
  - `numberOfColumns`: Number (read-only) - Sheet column count
  - `numberOfRows`: Number (read-only) - Sheet row count
  - `paginatedPDF`: RawData (read-only) - Print-ready PDF
  - `referenceURL`: String (read-only) - Reference URL
  - `selectedColumn`: Number - Selected column index
  - `selectedColumns`: Array (read-only) - Selected column indices
  - `selectedRow`: Number - Selected row index
  - `selectedRows`: Array (read-only) - Selected row indices
  - `source`: String (read-only) - HTML source
  - `url`: String - Page URL
  - `selectedText`: String/RichText - Selected content
  - `plainText`: String (read-only) - Plain text content
  - `richText`: String/RichText - Rich text content
- Methods:
  - `close()`
  - `print()`
  - `save()`

### Tab
A tab within a ThinkWindow.
- Properties: Similar to ThinkWindow
- Methods: Similar to ThinkWindow

### DocumentWindow
A document window. Inherits from ThinkWindow.
- Properties:
  - `contentRecord`: Content - Visible document record

### MainWindow
A main window. Inherits from ThinkWindow.
- Properties:
  - `searchResults`: Array - Search results
  - `root`: Parent - Top level group
  - `searchQuery`: String - Search query
  - `selection`: Array - Selected records

### AuthenticationResult
Result from an authentication dialog.
- Properties:
  - `user`: String - Username
  - `password`: String - Password

### GroupSelectorResult
Result from a group selector dialog.
- Properties:
  - `name`: String - Name field value
  - `selectedGroup`: Parent - Selected group
  - `tags`: Array - Tags field value

### ReadingListItem
An item in the reading list.
- Properties:
  - `url`: String - Item URL
  - `title`: String - Item title
  - `unread`: Boolean - Unread status
  - `date`: Date - Item date

### HTTPResponse
Header fields of an HTTP(S) response.
- Properties:
  - `httpStatus`: Number - Status code
  - `lastModified`: Date - Last modification date
  - `contentType`: String - Content type
  - `contentLength`: Number - Content length
  - `charset`: String - Character set

### FeedItem
An item from a feed.
- Properties:
  - `title`: String - Item title
  - `description`: String - Item description
  - `author`: String - Item author
  - `url`: String - Item URL
  - `textContent`: String - Item content
  - `source`: String - HTML source
  - `guid`: String - Unique identifier
  - `lastModified`: String - Modification date
  - `tags`: Array - Item tags
  - `enclosures`: Array - Item enclosures

### PDFProperties
Properties for a PDF document.
- Properties:
  - `author`: String - Document author
  - `title`: String - Document title
  - `subject`: String - Document subject
  - `keywords`: String - Document keywords

## Tips & Best Practices

1. **Initialization Pattern**
   - Use the IIFE pattern to encapsulate your code and avoid global variables
   - Always assign the application to a constant at the start

```javascript
(() => {
  const theApp = Application("DEVONthink");
  theApp.includeStandardAdditions = true;
  
  // Your code here
})();
```

2. **Error Handling**
   - Always wrap your code in try-catch blocks for robust error handling

```javascript
try {
  // Your code here
} catch(error) {
  console.log("Error: " + error);
}
```

3. **Object Manipulation**
   - Use JavaScript's object and array methods when working with collections
   - The `forEach` method is particularly useful for processing records

```javascript
theApp.selectedRecords().forEach(record => {
  // Process each record
});
```

4. **Asynchronous Operations**
   - For long-running tasks, show progress indicators
   - Use `waitingForReply: false` for background operations

5. **File Paths**
   - Always use POSIX paths or file URLs
   - For paths with spaces, consider using path variables

6. **Performance**
   - Process records in batches when dealing with large databases
   - Consider memory usage when handling large files

7. **Version Control**
   - Save versions before making significant changes to records
   - Use progress indicators for batch operations

8. **Workspace Management**
   - Save workspaces for different tasks
   - Load workspaces at the beginning of scripts for consistent environments

9. **Security**
   - Be careful with passwords in scripts
   - Don't hardcode sensitive information

10. **Documentation**
    - Comment your code
    - Document parameter requirements

## Common Issues and Solutions

1. **Timeout Issues**
   - For long-running operations, use `waitingForReply: false` and monitor progress separately

2. **Memory Issues**
   - Process records in smaller batches
   - Use `null` for variables that are no longer needed

3. **Encoding Problems**
   - Specify encoding when downloading content
   - Use `encodeURIComponent()` for URLs with special characters

4. **Path Problems**
   - Ensure paths are in POSIX format (use forward slashes)
   - Use `File` objects when dealing with paths that contain spaces

5. **Selection Issues**
   - Always check if `selectedRecords()` returns any records before processing
   - Use `currentGroup()` to get the context when no selection exists

## Resources

- DEVONthink Manual: For detailed information about DEVONthink features
- JavaScript for Automation documentation: For JXA-specific details
- DEVONtechnologies Forum: For community support
# DEVONthink JavaScript for Automation Reference Guide

This document provides a comprehensive reference to the JavaScript for Automation (JXA) interface for DEVONthink, allowing automation of tasks and integration with your workflows.

## Getting Started

To initialize the application and enable standard additions:

```javascript
(() => {
  const theApp = Application("DEVONthink");
  theApp.includeStandardAdditions = true;
  
  // Your code here
})();
```

## Common Patterns

### Process Selection
```javascript
(() => {
  const theApp = Application("DEVONthink");
  // Process selection
  let theSelection = theApp.selectedRecords();
  theSelection.forEach(r => {
    // Do something with each record
  });
})();
```

### Process Markdown Documents
```javascript
(() => {
  const theApp = Application("DEVONthink");
  // Process Markdown documents of current database
  let theDocs = theApp.currentDatabase.contents.whose({ _match: [ObjectSpecifier().recordType, "markdown"] })();
  theDocs.forEach(r => {
    // Do something with each Markdown document
  });
})();
```

## Core Commands

### Database Management

#### Create Database
```javascript
(() => {
  const theApp = Application("DEVONthink");
  const newDB = theApp.createDatabase("/path/to/MyDatabase.dtBase2");
})();
```

#### Open Database
```javascript
(() => {
  const theApp = Application("DEVONthink");
  const db = theApp.openDatabase("/path/to/MyDatabase.dtBase2");
})();
```

#### Check Database Integrity
```javascript
(() => {
  const theApp = Application("DEVONthink");
  const errorCount = theApp.checkFileIntegrityOf({database: theApp.currentDatabase()});
})();
```

#### Optimize Database
```javascript
(() => {
  const theApp = Application("DEVONthink");
  theApp.optimize({database: theApp.currentDatabase()});
})();
```

#### Verify Database
```javascript
(() => {
  const theApp = Application("DEVONthink");
  const totalErrors = theApp.verify({database: theApp.currentDatabase()});
})();
```

#### Compress Database
```javascript
(() => {
  const theApp = Application("DEVONthink");
  theApp.compress({database: theApp.currentDatabase(), to: "/path/to/archive.zip"});
})();
```

### Record Management

#### Create Record
```javascript
(() => {
  const theApp = Application("DEVONthink");
  const theGroup = theApp.currentGroup();
  
  let theBookmark = theApp.createRecordWith({
    name: "DEVONtechnologies", 
    'record type': "bookmark", 
    URL: "https://www.devon-technologies.com"
  }, {in: theGroup});
  
  let theNote = theApp.createRecordWith({
    'name': "Note", 
    type: "markdown", 
    content: "# Headline\n\nType your notes here."
  }, {in: theGroup});
})();
```

#### Delete Record
```javascript
(() => {
  const theApp = Application("DEVONthink");
  theApp.delete({record: theRecord});
})();
```

#### Move Record
```javascript
(() => {
  const theApp = Application("DEVONthink");
  theApp.move({record: theRecord, to: theDestinationGroup});
})();
```

#### Duplicate Record
```javascript
(() => {
  const theApp = Application("DEVONthink");
  theApp.duplicate({record: theRecord, to: theDestinationGroup});
})();
```

#### Replicate Record
```javascript
(() => {
  const theApp = Application("DEVONthink");
  theApp.replicate({record: theRecord, to: theDestinationGroup});
})();
```

#### Convert Record
```javascript
(() => {
  const theApp = Application("DEVONthink");
  const convertedRecord = theApp.convert({record: theRecord, to: "rich"}); // possible formats: simple, rich, note, markdown, HTML, webarchive, PDF document
})();
```

### Metadata Management

#### Adding Custom Metadata
```javascript
(() => {
  const theApp = Application("DEVONthink");
  const theRecords = theApp.selectedRecords();
  const theDate = new Date();
  
  theRecords.forEach(r => {
    theApp.addCustomMetaData("Me", {for: 'author', to: r});
    theApp.addCustomMetaData(theDate, {for: 'date', to: r});
    theApp.addCustomMetaData(3.14, {for: 'price', to: r});
  });
})();
```

#### Getting Custom Metadata
```javascript
(() => {
  const theApp = Application("DEVONthink");
  const authorValue = theApp.getCustomMetaData({for: 'author', from: theRecord});
})();
```

#### Working with Tags
```javascript
(() => {
  const theApp = Application("DEVONthink");
  const theTags = theRecord.tags();
  theRecord.tags = ["tag1", "tag2", "tag3"];
})();
```

### Reminders

#### Adding Reminders
```javascript
(() => {
  const theApp = Application('DEVONthink');
  const theRecords = theApp.selectedRecords();
  const due_date = new Date(new Date().getTime() + 3600 * 24 * 1000); // add one day
  
  theRecords.forEach(r => {
    let reminder = theApp.addReminder({
      schedule: 'once', 
      alarm: 'alert', 
      'alarm string': 'Test', 
      'due date': due_date
    }, {to: r});
  });
})();
```

### Search & Classification

#### Searching
```javascript
(() => {
  const theApp = Application("DEVONthink");
  const foundRecords = theApp.search("your search term", {in: theApp.currentDatabase()});
})();
```

#### Classification
```javascript
(() => {
  const theApp = Application("DEVONthink");
  const proposedGroups = theApp.classify({record: theRecord});
})();
```

#### Find Similar Records
```javascript
(() => {
  const theApp = Application("DEVONthink");
  const similarRecords = theApp.compare({record: theRecord});
})();
```

### Sheet Operations

#### Add Row
```javascript
(() => {
  const theApp = Application("DEVONthink");
  const theWindow = theApp.thinkWindows()[0];
  theApp.addRow(theWindow, {cells: ["Value1", "Value2", "Value3"]});
})();
```

#### Delete Row
```javascript
(() => {
  const theApp = Application("DEVONthink");
  const theWindow = theApp.thinkWindows()[0];
  theApp.deleteRowAt(theWindow, {position: 1});
})();
```

#### Get Cell Value
```javascript
(() => {
  const theApp = Application("DEVONthink");
  const theWindow = theApp.thinkWindows()[0];
  let theValue = theApp.getCellAt(theWindow, {column: 1, row: 1});
})();
```

#### Set Cell Value
```javascript
(() => {
  const theApp = Application("DEVONthink");
  const theWindow = theApp.thinkWindows()[0];
  let theValue = theApp.setCellAt(theWindow, {column: 1, row: 1, to: "New Value"});
})();
```

### Web Content

#### Create from Web
```javascript
(() => {
  const theApp = Application("DEVONthink");
  
  // Create formatted note
  const theNote = theApp.createFormattedNoteFrom("https://www.example.com", {in: theApp.currentGroup()});
  
  // Create markdown
  const theMarkdown = theApp.createMarkdownFrom("https://www.example.com", {in: theApp.currentGroup()});
  
  // Create PDF
  const thePDF = theApp.createPDFDocumentFrom("https://www.example.com", {in: theApp.currentGroup()});
  
  // Create web document (auto-determine format)
  const theWeb = theApp.createWebDocumentFrom("https://www.example.com", {in: theApp.currentGroup()});
})();
```

#### Download Content
```javascript
(() => {
  const theApp = Application("DEVONthink");
  const theURL = "https://www.example.com";
  
  // Download HTML
  const theHTML = theApp.downloadMarkupFrom(theURL);
  
  // Download JSON
  const theJSON = theApp.downloadJSONFrom(theURL);
  
  // Download raw data
  const theData = theApp.downloadURL(theURL);
})();
```

### Importing & Exporting

#### Import Files
```javascript
(() => {
  const theApp = Application("DEVONthink");
  
  // Import a file
  const newRecord = theApp.importPath("/path/to/file.pdf", {to: theApp.currentGroup()});
  
  // Import a folder and its contents
  const newRecord = theApp.importPath("/path/to/folder", {to: theApp.currentGroup()});
  
  // Index (reference) a file or folder
  const newRecord = theApp.indexPath("/path/to/file.pdf", {to: theApp.currentGroup()});
})();
```

#### Export Records
```javascript
(() => {
  const theApp = Application("DEVONthink");
  
  // Export a record
  const exportPath = theApp.export({record: theRecord, to: "/path/to/export/folder"});
  
  // Export as website
  const exportPath = theApp.exportWebsite({record: theRecord, to: "/path/to/export/folder"});
})();
```

### OCR

```javascript
(() => {
  const theApp = Application("DEVONthink");
  
  // OCR an image file and add to current group
  theApp.ocr({file: "/path/to/image.jpg", to: theApp.currentGroup()});
})();
```

### Imprinting

```javascript
(() => {
  const theApp = Application("DEVONthink");
  const theRecord = theApp.selectedRecords()[0];
  const theText = "Confidential";
  
  theApp.imprint({
    font: "Times New Roman Bold",
    position: "centered",
    record: theRecord,
    size: 36,
    text: theText,
    borderColor: [65535, 0, 0],
    borderWidth: 2
  });
})();
```

## Windows and UI Operations

### Open Windows
```javascript
(() => {
  const theApp = Application("DEVONthink");
  
  // Open a new tab
  const newTab = theApp.openTabFor({record: theRecord});
  
  // Open a new window
  const newWindow = theApp.openWindowFor({record: theRecord});
})();
```

### Display Dialogs
```javascript
(() => {
  const theApp = Application("DEVONthink");
  
  // Display group selector
  const selectedGroup = theApp.displayGroupSelector("Select Destination");
  
  // Display name editor
  const newName = theApp.displayNameEditor("Enter Name", {defaultAnswer: "Default Name"});
  
  // Display date editor
  const newDate = theApp.displayDateEditor("Enter Date");
})();
```

### JavaScript Execution
```javascript
(() => {
  const theApp = Application("DEVONthink");
  const jsResult = theApp.doJavaScript("return 2 + 2;");
})();
```

## Working with Versions

```javascript
(() => {
  const theApp = Application("DEVONthink");
  
  // Save current version
  theApp.saveVersionOf({record: theRecord});
  
  // Get all versions
  const allVersions = theApp.getVersionsOf({record: theRecord});
  
  // Restore a version
  theApp.restoreRecordWith({version: theVersion});
})();
```

## Workspace Management

```javascript
(() => {
  const theApp = Application("DEVONthink");
  
  // Save workspace
  theApp.saveWorkspace("MyWorkspace");
  
  // Load workspace
  theApp.loadWorkspace("MyWorkspace");
  
  // Delete workspace
  theApp.deleteWorkspace("MyWorkspace");
})();
```

## Progress Indicators

```javascript
(() => {
  const theApp = Application("DEVONthink");
  
  // Show progress indicator
  theApp.showProgressIndicator("Processing...", {steps: 10});
  
  // Update progress
  for (let i = 1; i <= 10; i++) {
    theApp.stepProgressIndicator("Processing item " + i);
    // Simulate work
    delay(0.5);
  }
  
  // Hide progress when done
  theApp.hideProgressIndicator();
})();
```

## Download Management

```javascript
(() => {
  const theApp = Application("DEVONthink");
  
  // Add URL to download manager
  theApp.addDownload("https://www.example.com/file.pdf");
  
  // Start downloads
  theApp.startDownloads();
  
  // Stop downloads
  theApp.stopDownloads();
})();
```

## AI and Content Analysis

### Summarize Content

```javascript
(() => {
  const theApp = Application("DEVONthink");
  
  // Summarize contents
  const summary = theApp.summarizeContentsOf({
    records: [record1, record2], 
    to: "rich", 
    as: "text summary"
  });
  
  // Summarize highlights
  const summary = theApp.summarizeHighlightsOf({
    records: [record1, record2], 
    to: "rich"
  });
  
  // Summarize text
  const summaryText = theApp.summarizeText("Long text to summarize...", {
    as: "key points summary"
  });
})();
```

### Chat Integration

```javascript
(() => {
  const theApp = Application("DEVONthink");
  
  // Get chat response for selection
  const thePrompt = "Summarize this content";
  const response = theApp.getChatResponseForMessage(thePrompt, {
    'record': theApp.selectedRecords(),
    'temperature': 0
  });
  
  // Get chat response for image
  const imageResponse = theApp.getChatResponseForMessage("Describe this image", {
    'url': "https://example.com/image.jpg"
  });
})();
```

## Event Triggers

DEVONthink supports the following event triggers for smart rules:

- `no event`
- `open event`
- `open externally event`
- `edit externally event`
- `launch event`
- `creation event`
- `import event`
- `clipping event`
- `download event`
- `rename event`
- `move event`
- `classify event`
- `replicate event`
- `duplicate event`
- `tagging event`
- `flagging event`
- `labelling event`
- `rating event`
- `move into database event`
- `move to external folder event`
- `commenting event`
- `convert event`
- `OCR event`
- `imprint event`
- `trashing event`

## Properties and Objects

### Main Application Properties

- `currentDatabase`
- `currentGroup`
- `selectedRecords`
- `incomingGroup`
- `labelNames`
- `workspaces`
- `strictDuplicateRecognition`

### Database Properties

- `id`
- `uuid`
- `name`
- `comment`
- `path`
- `root`
- `encrypted`
- `auditProof`
- `readOnly`
- `spotlightIndexing`
- `versioning`
- `tagsGroup`
- `trashGroup`

### Record Properties

- `id`
- `uuid`
- `name`
- `comment`
- `aliases`
- `URL`
- `path`
- `location`
- `creationDate`
- `modificationDate`
- `additionDate`
- `flag` (or `state`)
- `unread`
- `locking` (or `locked`)
- `label`
- `rating`
- `tags`
- `size`
- `kind`
- `recordType`
- `plainText`
- `richText` (or `text`)
- `source`
- `content`
- `data`
- `thumbnail`
- `referenceURL`

## Common Data Types

- `group` - A container that can hold other records
- `smart group` - A group that dynamically updates based on search criteria
- `feed` - RSS, RDF, or Atom feed
- `bookmark` - Internet or filesystem location
- `formatted note` - Rich text note
- `HTML` - HTML document
- `webarchive` - Web Archive
- `markdown` - Markdown document
- `txt` - Text document
- `RTF` - RTF document
- `RTFD` - RTFD document
- `picture` - Picture
- `multimedia` - Audio or video file
- `PDF document` - PDF document
- `sheet` - Sheet
- `XML` - XML document
- `property list` - Property list
- `AppleScript file` - AppleScript file
- `unknown` - Unknown file type

## Error Handling

```javascript
(() => {
  const theApp = Application("DEVONthink");
  try {
    // Perform some operations
  } catch(error) {
    console.log("Error: " + error);
    // or use dialog
    theApp.displayAlert("Error", {message: error.toString()});
  }
})();
```

## Working with Constructors

### Creating New JavaScript Objects

```javascript
(() => {
  const theApp = Application("DEVONthink");
  
  // Create a new record properties object
  const recordProps = {
    name: "New Document",
    type: "markdown",
    content: "# Hello World\n\nThis is a new document."
  };
  
  // Create a new record with those properties
  const newRecord = theApp.createRecordWith(recordProps, {in: theApp.currentGroup()});
})();
```

### JSON Handling

```javascript
(() => {
  const theApp = Application("DEVONthink");
  
  // Download JSON data
  const jsonData = theApp.downloadJSONFrom("https://api.example.com/data.json");
  
  // Process the JSON data
  for (const item of jsonData.items) {
    const recordProps = {
      name: item.title,
      content: item.description,
      type: "markdown"
    };
    theApp.createRecordWith(recordProps, {in: theApp.currentGroup()});
  }
})();
```

## Utility Functions

### Delays and Timers

```javascript
(() => {
  const theApp = Application("DEVONthink");
  
  // Add a delay (in seconds)
  function delay(seconds) {
    const now = new Date();
    const exitTime = now.getTime() + (seconds * 1000);
    while (new Date().getTime() < exitTime) { /* wait */ }
  }
  
  // Use in a loop
  for (let i = 0; i < 5; i++) {
    // Do something
    console.log("Processing step " + i);
    delay(1); // Wait 1 second
  }
})();
```

### Path Manipulation

```javascript
(() => {
  const theApp = Application("DEVONthink");
  
  // Get the POSIX path
  function getPOSIXPath(filePath) {
    // Convert file:// URLs to POSIX path
    if (filePath.startsWith("file://")) {
      return decodeURIComponent(filePath.substring(7));
    }
    return filePath;
  }
  
  // Get the filename from a path
  function getFilename(filePath) {
    return filePath.substring(filePath.lastIndexOf("/") + 1);
  }
  
  // Example usage
  const path = "/Users/username/Documents/file.txt";
  console.log(getFilename(path)); // "file.txt"
})();
```

## Working with Dates

```javascript
(() => {
  const theApp = Application("DEVONthink");
  
  // Current date
  const now = new Date();
  
  // Add one day
  const tomorrow = new Date(now.getTime() + (24 * 60 * 60 * 1000));
  
  // Format date for display
  function formatDate(date) {
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
  }
  
  // Create a record with the current date
  const newRecord = theApp.createRecordWith({
    name: "Date Test: " + formatDate(now),
    type: "markdown",
    content: "Created: " + formatDate(now) + "\nDue: " + formatDate(tomorrow)
  }, {in: theApp.currentGroup()});
  
  // Add a reminder with the due date
  theApp.addReminder({
    schedule: "once",
    "due date": tomorrow,
    alarm: "notification"
  }, {to: newRecord});
})();
```

## Mass Operations and Batch Processing

```javascript
(() => {
  const theApp = Application("DEVONthink");
  
  // Get all PDFs in current database
  const pdfs = theApp.currentDatabase().contents.whose({
    _match: [ObjectSpecifier().recordType, "PDF document"]
  })();
  
  // Process in batches to avoid memory issues
  const batchSize = 20;
  
  // Show progress indicator
  theApp.showProgressIndicator("Processing PDFs...", {steps: pdfs.length});
  
  for (let i = 0; i < pdfs.length; i++) {
    // Process each PDF
    const pdf = pdfs[i];
    
    // Do your operations here
    console.log("Processing: " + pdf.name());
    
    // Add OCR if needed
    /*
    if (pdf.plainText() === "" || pdf.plainText() === null) {
      theApp.ocr({file: pdf.path(), to: pdf.parent()});
    }
    */
    
    // Step the progress indicator
    theApp.stepProgressIndicator("Processing: " + pdf.name());
    
    // Add a small delay every batch to prevent overloading
    if (i % batchSize === 0 && i > 0) {
      delay(0.5);
    }
  }
  
  // Hide progress indicator when done
  theApp.hideProgressIndicator();
})();
```

## Integration with macOS

### Running Shell Commands

```javascript
(() => {
  const theApp = Application("DEVONthink");
  theApp.includeStandardAdditions = true;
  
  // Run a shell command
  function runShellCommand(command) {
    try {
      return theApp.doShellScript(command);
    } catch (error) {
      console.log("Error running command: " + error);
      return null;
    }
  }
  
  // Example: Get list of files in a directory
  const result = runShellCommand("ls -la ~/Documents");
  console.log(result);
})();
```

### System Events

```javascript
(() => {
  const theApp = Application("DEVONthink");
  const sysEvents = Application("System Events");
  
  // Check if a file exists
  function fileExists(filePath) {
    return sysEvents.files[filePath].exists();
  }
  
  // Check before trying to import
  if (fileExists("/path/to/file.pdf")) {
    theApp.importPath("/path/to/file.pdf", {to: theApp.currentGroup()});
  }
})();
```

## Tips & Best Practices

1. **Use IIFE Pattern**: Wrap your code in Immediately Invoked Function Expressions `(() => { ... })();` to avoid variable conflicts.

2. **Error Handling**: Always include error handling in your scripts, especially for file operations and network requests.

3. **Resource Management**: Close windows and tabs that you open when you're done with them.

4. **Progress Indicators**: Use progress indicators for long-running operations to provide feedback to the user.

5. **Batching**: When processing large numbers of records, process them in smaller batches to avoid memory issues.

6. **Versioning**: Save versions of records before modifying them to allow for recovery.

7. **Validation**: Check that records exist and have the expected properties before operating on them.

8. **Logging**: Use console.log for debugging or the log message command for persistent logging.

9. **Organization**: Structure your code with functions and meaningful variable names.

10. **Performance**: Be mindful of performance, especially when working with large databases or complex operations.

## Useful JavaScript Libraries

DEVONthink's JavaScript for Automation environment allows you to use some built-in JavaScript libraries:

1. **ObjectSpecifier**: For creating complex queries against the database.

2. **Path**: For working with file paths and URLs.

3. **ObjC Bridge**: For accessing Objective-C APIs from JavaScript (advanced).

Remember that JavaScript for Automation in DEVONthink runs in a sandboxed environment, so some browser APIs and Node.js modules are not available.