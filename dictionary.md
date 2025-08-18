APPLESCRIPT TYPES
AppleScript TypesBuilt-in AppleScript value types.
DESCRIPTION
This information, about the native built-in AppleScript datatypes, is not part of the dictionary you are viewing; a dictionary does not need to define these types, because they are built in to AppleScript! Rather, it has been provided, as a public service, by this program.

CLASSES
date
date (noun), pl datesA date-time value.
DESCRIPTION
A date is a date-time, stored internally as a number of seconds since some fixed initial reference date. A date can be mutated in place, and is one of the classes for which set and copy behave differently.

A literal date is an object string specifier. In constructing a date, you may use any string value that can be interpreted as a date, a time, or a date-time. AppleScript supplies missing values such as today’s date (if you give only a time) or midnight (if you give only a date). To form a date object for the current date-time, use the current date scripting addition command.

PROPERTIES
Property
Access
Type
Description
date string	get	text	The date portion of a date, as text.
day	get	integer	The day of the month of a date.
month	get	month	The month of a date. A constant (not a string or a number); however, this constant can be coerced to a string or a number, and can be set using a number.
short date string	get	text	The date portion of a date, as text (in a more abbreviated format than the date string).
time	get	integer	The number of seconds since midnight of a date-time’s day.
time string	get	text	The time portion of a date, as text.
weekday	get	weekday	The day of a week of a date. A constant (not a string or number); however, this constant can be coerced to a string or a number.
year	get	integer	The year of a date.
WHERE USED
The date class is used in the following ways:
direct parameter to the add custom meta data command/event
result of display date editor command
result of get custom meta data command
addition date property of the record class/record
all document dates property of the record class/record
attributes change date property of the record class/record
creation date property of the record class/record
date property of the reading list item class/record
date property of the record class/record
default date parameter of the display date editor command/event
default value parameter of the get custom meta data command/event
document date property of the record class/record
due date property of the reminder class/record
last modified property of the HTTP response class/record
modification date property of the record class/record
newest document date property of the record class/record
oldest document date property of the record class/record
opening date property of the record class/record
requested print time property of the print settings class/record
file
file (noun), pl files[synonyms: file specification]A reference to a file or a folder on disk.
DESCRIPTION
A file object is a reference to a file or folder on disk. To construct one, use an object string specifier, the word file followed by a pathname string value:

file "MyDisk:Users:myself:"
If you try to assign a file object specifier to a variable, or return it as a value, you’ll get a runtime error. Instead, you must generate a reference to the file object, like this:

set x to a reference to file "MyDisk:Users:myself:"
You can also construct, and sometimes applications or scripting addition commands (such as choose file name) will return, a file specified by its POSIX path:

POSIX file "/Users/myself/"
Such a specifier is actually of a different class, «class furl» (a file URL). This class can be difficult to distinguish from the basic file object type, but it is in fact different, and it can be assigned to a variable.

At runtime, when a file specifier is handed to some command, either the item must exist, or, if the command proposes to create it, everything in the path must exist except for the last element, the name of the item you’re about to create. Thus a file specifer can be used to create a file or folder; an alias can’t be used to do that, and this is a major difference between the two types.

PROPERTIES
Property
Access
Type
Description
POSIX path	get	text	The POSIX path of the file.
WHERE USED
The file class is used in the following ways:
file name property of the attachment class/record
month
month (noun), pl monthsA calendar month.
WHERE USED
The month class is used in the following ways:
month property of the date class/record
weekday
weekday (noun), pl weekdaysA weekday.
WHERE USED
The weekday class is used in the following ways:
weekday property of the date class/record
TYPES
any
any (type)Anything.
DESCRIPTION
The any datatype is used as a wildcard type in a dictionary, usually because the creators of the dictionary have found it impractical to list explicitly the actual possible types of a value. It isn’t used in AppleScript programming.

WHERE USED
The any type is used in the following ways:
direct parameter to the exists command/event
contents property of the selection-object class/record
image property of the record class/record
rest property of the list class/record
reverse property of the list class/record
thumbnail property of the record class/record
with data parameter of the make command/event
boolean
boolean (type)A true or false value.
DESCRIPTION
A boolean is a datatype consisting of exactly two possible values, true and false, and is typically used wherever this kind of binary value possibility is appropriate. It results from comparisons, and is used in conditions. The integers 1 and 0 can be coerced to a boolean, and vice versa. The strings "true" and "false" can be coerced to a boolean, and vice versa.

class of true -- boolean
class of (1 < 2) -- boolean
WHERE USED
The boolean type is used in the following ways:
result of exists command
result of move into database command
result of move to external folder command
result of log message command
result of load workspace command
result of imprint configuration command
result of imprint command
result of optimize command
result of perform smart rule command
result of refresh command
result of restore record with command
result of save workspace command
result of set cell at command
result of show progress indicator command
result of show search command
result of start downloads command
result of step progress indicator command
result of stop downloads command
result of synchronize command
result of update command
result of update thumbnail command
result of add custom meta data command
direct parameter to the add custom meta data command/event
result of add download command
result of add reading list command
result of add row command
result of compress command
result of create thumbnail command
result of delete command
result of delete row at command
result of delete thumbnail command
result of delete workspace command
result of exists record at command
result of exists record with comment command
result of exists record with content hash command
result of exists record with file command
result of exists record with path command
result of exists record with URL command
result of export tags of command
result of get custom meta data command
result of hide progress indicator command
any parameter of the lookup records with tags command/event
automatic parameter of the add download command/event
barcodes parameter of the extract keywords from command/event
cancel button parameter of the show progress indicator command/event
cancelled progress property of the application class/record
closeable property of the window class/record
collating property of the print settings class/record
default value parameter of the get custom meta data command/event
DEVONtech_Storage parameter of the export command/event
encrypted property of the database class/record
encrypted property of the record class/record
enforcement parameter of the open window for command/event
entities parameter of the export website command/event
exclude from chat property of the record class/record
exclude from classification property of the record class/record
exclude from search property of the record class/record
exclude from see also property of the record class/record
exclude from tagging property of the record class/record
exclude from Wiki linking property of the record class/record
exclude subgroups parameter of the search command/event
exclude subgroups parameter of the show search command/event
exclude subgroups property of the smart parent class/record
existing tags parameter of the extract keywords from command/event
flag property of the record class/record
frontmost property of the application class/record
hash tags parameter of the extract keywords from command/event
highlight occurrences property of the smart parent class/record
image tags parameter of the extract keywords from command/event
index pages parameter of the export website command/event
indexed property of the record class/record
loading property of the think window class/record
loading property of the tab class/record
locking property of the record class/record
miniaturizable property of the window class/record
miniaturized property of the window class/record
name parameter of the display group selector command/event
outlined parameter of the imprint command/event
pagination parameter of the create PDF document from command/event
pending property of the record class/record
print dialog parameter of the print command/event
read only property of the database class/record
readability parameter of the create formatted note from command/event
readability parameter of the create Markdown from command/event
readability parameter of the create PDF document from command/event
readability parameter of the create web document from command/event
resizable property of the window class/record
Spotlight indexing property of the database class/record
strict duplicate recognition property of the application class/record
strike through parameter of the imprint command/event
tags parameter of the classify command/event
tags parameter of the display group selector command/event
thinking parameter of the get chat response for message command/event
timestamps parameter of the transcribe command/event
tool calls parameter of the get chat response for message command/event
underlined parameter of the imprint command/event
underlined property of the rich text class/record
underlined property of the attribute run class/record
underlined property of the character class/record
underlined property of the paragraph class/record
underlined property of the word class/record
unread property of the reading list item class/record
unread property of the record class/record
versioning property of the database class/record
visible property of the window class/record
waiting for reply parameter of the convert image command/event
waiting for reply parameter of the ocr command/event
waiting for reply parameter of the imprint configuration command/event
waiting for reply parameter of the imprint command/event
zoomable property of the window class/record
zoomed property of the window class/record
integer
integer (type)An integer value.
DESCRIPTION
The integer datatype is one of the two basic number types; the other is real. An integer is a whole number, without a decimal point. It must lie between 536870911 and –536870912 inclusive.

WHERE USED
The integer type is used in the following ways:
result of count command
result of verify command
direct parameter to the add custom meta data command/event
result of check file integrity of command
result of get custom meta data command
direct parameter to the get database with id command/event
direct parameter to the get record with id command/event
annotation count property of the record class/record
attachment count property of the record class/record
bates number property of the application class/record
bates number property of the record class/record
border width parameter of the imprint command/event
character count property of the record class/record
column parameter of the set cell at command/event
column parameter of the get cell at command/event
content length property of the HTTP response class/record
copies property of the print settings class/record
current line property of the think window class/record
current line property of the tab class/record
current page property of the think window class/record
current page property of the tab class/record
day property of the date class/record
default value parameter of the get custom meta data command/event
dimensions property of the record class/record
ending page property of the print settings class/record
HTTP status property of the HTTP response class/record
id property of the window class/record
id property of the database class/record
id property of the record class/record
id property of the tab class/record
index property of the window class/record
interval property of the reminder class/record
label property of the record class/record
length property of the list class/record
masc property of the reminder class/record
number of columns property of the think window class/record
number of columns property of the tab class/record
number of duplicates property of the record class/record
number of hits property of the record class/record
number of replicants property of the record class/record
number of rows property of the think window class/record
number of rows property of the tab class/record
page count property of the record class/record
pages across property of the print settings class/record
pages down property of the print settings class/record
position parameter of the delete row at command/event
rating property of the record class/record
rotate by parameter of the convert image command/event
rotate by parameter of the ocr command/event
rotation parameter of the imprint command/event
row parameter of the set cell at command/event
row parameter of the get cell at command/event
seed parameter of the download image for prompt command/event
selected column property of the think window class/record
selected column property of the tab class/record
selected columns property of the think window class/record
selected columns property of the tab class/record
selected row property of the think window class/record
selected row property of the tab class/record
selected rows property of the think window class/record
selected rows property of the tab class/record
size parameter of the imprint command/event
size property of the record class/record
size parameter of the create database command/event
starting page property of the print settings class/record
superscript property of the rich text class/record
superscript property of the character class/record
superscript property of the attribute run class/record
superscript property of the word class/record
superscript property of the paragraph class/record
time property of the date class/record
word count property of the record class/record
x offset parameter of the imprint command/event
y offset parameter of the imprint command/event
year property of the date class/record
number
number (type)A floating point or integer number.
DESCRIPTION
The number datatype is a catch-all numeric type designed for coercions. For example, a string that looks like an integer or a real can be coerced to a number; the result is that it is coerced to an integer or a real, whichever is appropriate, without your having to worry about which is appropriate.

WHERE USED
The number type is used in the following ways:
direct parameter to the add custom meta data command/event
result of get custom meta data command
default value parameter of the get custom meta data command/event
dpi property of the record class/record
height property of the record class/record
size property of the rich text class/record
size property of the character class/record
size property of the attribute run class/record
size property of the paragraph class/record
size property of the word class/record
steps parameter of the show progress indicator command/event
width property of the record class/record
width parameter of the create PDF document from command/event
real
real (type)A real number.
DESCRIPTION
The real datatype is one of the two basic number types; the other is integer. A literal real has a decimal point. A large real will be expressed in scientific notation. (Examples: 100.0, 1.0E+26.)

WHERE USED
The real type is used in the following ways:
direct parameter to the add custom meta data command/event
result of get custom meta data command
altitude property of the record class/record
baseline offset property of the rich text class/record
baseline offset property of the attribute run class/record
baseline offset property of the paragraph class/record
baseline offset property of the word class/record
baseline offset property of the character class/record
current time property of the think window class/record
current time property of the tab class/record
default value parameter of the get custom meta data command/event
duration property of the record class/record
first line head indent property of the rich text class/record
first line head indent property of the attribute run class/record
first line head indent property of the paragraph class/record
first line head indent property of the word class/record
first line head indent property of the character class/record
head indent property of the rich text class/record
head indent property of the attribute run class/record
head indent property of the character class/record
head indent property of the paragraph class/record
head indent property of the word class/record
interval property of the record class/record
latitude property of the record class/record
line spacing property of the rich text class/record
line spacing property of the attribute run class/record
line spacing property of the character class/record
line spacing property of the paragraph class/record
line spacing property of the word class/record
longitude property of the record class/record
maximum line height property of the rich text class/record
maximum line height property of the character class/record
maximum line height property of the paragraph class/record
maximum line height property of the attribute run class/record
maximum line height property of the word class/record
minimum line height property of the rich text class/record
minimum line height property of the character class/record
minimum line height property of the paragraph class/record
minimum line height property of the word class/record
minimum line height property of the attribute run class/record
multiple line height property of the rich text class/record
multiple line height property of the character class/record
multiple line height property of the paragraph class/record
multiple line height property of the attribute run class/record
multiple line height property of the word class/record
paragraph spacing property of the rich text class/record
paragraph spacing property of the character class/record
paragraph spacing property of the paragraph class/record
paragraph spacing property of the word class/record
paragraph spacing property of the attribute run class/record
prompt strength parameter of the download image for prompt command/event
score property of the record class/record
tail indent property of the rich text class/record
tail indent property of the character class/record
tail indent property of the attribute run class/record
tail indent property of the word class/record
tail indent property of the paragraph class/record
temperature parameter of the display chat dialog command/event
temperature parameter of the get chat response for message command/event
rectangle
rectangle (type)A list of four numbers, designating a rectangle in the plane.
DESCRIPTION
There are various standards for using four numbers to designate a rectangle. The old way is to specify the x and y coordinates of the origin corner, and the x and y coordinates of the opposite corner, of the rectangle. But the origin corner might be the top left (traditional) or the bottom left (newer), and the Cocoa standard is to use the third and fourth numbers for the width and height of the rectangle.

WHERE USED
The rectangle type is used in the following ways:
bounds property of the window class/record
reference
reference (type)[synonyms: object, specifier]A reference to an element in a collection of objects.
DESCRIPTION
The reference (or specifier, or object) datatype is used in a dictionary as a wild-card type, to indicate that a value will be a reference to an element, of some unspecified class, within the application.

WHERE USED
The reference type is used in the following ways:
direct parameter to the save command/event
direct parameter to the print command/event
direct parameter to the count command/event
result of make command
direct parameter to the close command/event
direct parameter to the set cell at command/event
direct parameter to the bold command/event
direct parameter to the italicize command/event
direct parameter to the plain command/event
direct parameter to the reformat command/event
direct parameter to the scroll to visible command/event
direct parameter to the strike command/event
direct parameter to the unbold command/event
direct parameter to the underline command/event
direct parameter to the unitalicize command/event
direct parameter to the unstrike command/event
direct parameter to the ununderline command/event
direct parameter to the add row command/event
direct parameter to the delete row at command/event
direct parameter to the display chat dialog command/event
direct parameter to the get cell at command/event
text
text (type)A plain text string value.
DESCRIPTION
The text or string datatype is the basic text string type. It is Unicode, so it can include any character. However, the read and write scripting addition commands interpret as text or as string (or nothing) to mean MacRoman; to get UTF-16, say as Unicode text, and to get UTF-8, say as «class utf8».

A literal text string is delimited by quotation marks, with the empty string symbolized by "".

set s to "howdy"
class of s -- text
The following are the properties of a text string. They are read-only.

length
The number of characters of the text string. You can get this same information by sending the count message to the string.
quoted form
A rendering of the text string suitable for handing to the shell as an argument to a command. The text string is wrapped in single quotation marks and internal quotation marks are escaped.
id
The codepoints of the Unicode characters constituting the text string: an integer or list of integers. The reverse operation, from a list of integers to text, is through the string id specifier.
The following are the elements of a text string. They cannot be set, because a text string cannot be mutated in place.

character
A text string representing a single character of the text string.
word
A text string representing a single word of the text string. It has no spaces or other word-boundary punctuation.
paragraph
A text string representing a single paragraph (or line) of the text string. It has no line breaks. AppleScript treats a return, a newline, or both together (CRLF) as a line break.
text
A run of text. Its purpose is to let you obtain a single continuous text string using a range element specifier:
words 1 thru 3 of "Now is the winter" -- {"Now", "is", "the"}
text from word 1 to word 3 of "Now is the winter" -- "Now is the"
text item
A “field” of text, where the field delimiter is AppleScript’s text item delimiters property (or, if text item delimiters is a list, any item of that list).
WHERE USED
The text type is used in the following ways:
direct parameter to the lookup records with content hash command/event
direct parameter to the import template command/event
direct parameter to the load workspace command/event
direct parameter to the lookup records with comment command/event
direct parameter to the index path command/event
direct parameter to the lookup records with URL command/event
direct parameter to the lookup records with file command/event
direct parameter to the log message command/event
direct parameter to the lookup records with path command/event
direct parameter to the lookup records with tags command/event
result of imprinter configuration names command
direct parameter to the imprint configuration command/event
direct parameter to the open database command/event
direct parameter to the save workspace command/event
direct parameter to the search command/event
direct parameter to the show progress indicator command/event
direct parameter to the show search command/event
direct parameter to the step progress indicator command/event
result of summarize text command
direct parameter to the summarize text command/event
result of transcribe command
direct parameter to the add custom meta data command/event
direct parameter to the add download command/event
result of convert feed to HTML command
direct parameter to the convert feed to HTML command/event
direct parameter to the create database command/event
direct parameter to the create formatted note from command/event
direct parameter to the create location command/event
direct parameter to the create Markdown from command/event
direct parameter to the create PDF document from command/event
direct parameter to the create web document from command/event
direct parameter to the delete workspace command/event
result of do JavaScript command
direct parameter to the do JavaScript command/event
direct parameter to the download image for prompt command/event
direct parameter to the download JSON from command/event
result of download markup from command
direct parameter to the download markup from command/event
direct parameter to the download URL command/event
direct parameter to the display authentication dialog command/event
result of display chat dialog command
direct parameter to the display date editor command/event
direct parameter to the display group selector command/event
result of display name editor command
direct parameter to the display name editor command/event
direct parameter to the exists record at command/event
direct parameter to the exists record with comment command/event
direct parameter to the exists record with content hash command/event
direct parameter to the exists record with file command/event
direct parameter to the exists record with path command/event
direct parameter to the exists record with URL command/event
result of export command
result of export website command
result of extract keywords from command
direct parameter to the get cached data for URL command/event
result of get cell at command
result of get chat models for engine command
result of get chat response for message command
direct parameter to the get chat response for message command/event
result of get concordance of command
result of get custom meta data command
direct parameter to the get database with uuid command/event
result of get embedded images of command
direct parameter to the get embedded images of command/event
result of get embedded objects of command
direct parameter to the get embedded objects of command/event
result of get embedded sheets and scripts of command
direct parameter to the get embedded sheets and scripts of command/event
result of get favicon of command
direct parameter to the get favicon of command/event
direct parameter to the get feed items of command/event
result of get frames of command
direct parameter to the get frames of command/event
direct parameter to the get items of feed command/event
result of get links of command
direct parameter to the get links of command/event
direct parameter to the get metadata of command/event
direct parameter to the get record at command/event
direct parameter to the get record with uuid command/event
direct parameter to the get rich text of command/event
result of get text of command
direct parameter to the get text of command/event
result of get title of command
direct parameter to the get title of command/event
direct parameter to the import path command/event
agent parameter of the create formatted note from command/event
agent parameter of the create Markdown from command/event
agent parameter of the create PDF document from command/event
agent parameter of the create web document from command/event
agent parameter of the download JSON from command/event
agent parameter of the download markup from command/event
agent parameter of the download URL command/event
alarm string property of the reminder class/record
aliases property of the record class/record
as parameter of the add custom meta data command/event
as parameter of the get chat response for message command/event
attached script property of the record class/record
author property of the feed item class/record
author property of the PDF properties class/record
base URL parameter of the convert feed to HTML command/event
base URL parameter of the get embedded images of command/event
base URL parameter of the get embedded objects of command/event
base URL parameter of the get embedded sheets and scripts of command/event
base URL parameter of the get favicon of command/event
base URL parameter of the get feed items of command/event
base URL parameter of the get frames of command/event
base URL parameter of the get items of feed command/event
base URL parameter of the get links of command/event
base URL parameter of the get metadata of command/event
base URL parameter of the get rich text of command/event
buttons parameter of the display group selector command/event
cells parameter of the add row command/event
charset property of the HTTP response class/record
column parameter of the set cell at command/event
column parameter of the get cell at command/event
columns property of the record class/record
comment property of the database class/record
comment property of the record class/record
containing parameter of the get links of command/event
content parameter of the compare command/event
content hash property of the record class/record
content type property of the HTTP response class/record
current workspace property of the application class/record
date string property of the date class/record
default answer parameter of the display name editor command/event
default value parameter of the get custom meta data command/event
description property of the feed item class/record
digital object identifier property of the record class/record
document amount property of the record class/record
document name property of the record class/record
encoding parameter of the download markup from command/event
encoding parameter of the export website command/event
encryption key parameter of the create database command/event
fax number property of the print settings class/record
file parameter of the ocr command/event
file type parameter of the get embedded images of command/event
file type parameter of the get embedded objects of command/event
file type parameter of the get embedded sheets and scripts of command/event
file type parameter of the get links of command/event
filename property of the database class/record
filename property of the record class/record
font parameter of the imprint command/event
font property of the rich text class/record
font property of the attribute run class/record
font property of the character class/record
font property of the paragraph class/record
font property of the word class/record
for parameter of the add custom meta data command/event
for parameter of the get custom meta data command/event
from parameter of the import path command/event
geolocation property of the record class/record
guid property of the feed item class/record
image parameter of the download image for prompt command/event
info parameter of the log message command/event
info parameter of the display date editor command/event
info parameter of the display name editor command/event
international standard book number property of the record class/record
keywords property of the PDF properties class/record
kind property of the record class/record
label names property of the application class/record
language parameter of the transcribe command/event
last downloaded URL property of the application class/record
last modified property of the feed item class/record
location property of the record class/record
location with name property of the record class/record
markdown parameter of the get metadata of command/event
method parameter of the download JSON from command/event
method parameter of the download markup from command/event
method parameter of the download URL command/event
MIME type property of the record class/record
mode parameter of the get chat response for message command/event
model parameter of the display chat dialog command/event
model parameter of the get chat response for message command/event
name property of the application class/record
name property of the window class/record
name property of the group selector result class/record
name parameter of the perform smart rule command/event
name property of the database class/record
name property of the record class/record
name parameter of the create formatted note from command/event
name parameter of the create Markdown from command/event
name parameter of the create PDF document from command/event
name parameter of the create web document from command/event
name parameter of the display chat dialog command/event
name parameter of the import path command/event
name without date property of the record class/record
name without extension property of the record class/record
original name property of the record class/record
password property of the authentication result class/record
password parameter of the add download command/event
password parameter of the compress command/event
password parameter of the download JSON from command/event
password parameter of the download markup from command/event
password parameter of the download URL command/event
path property of the database class/record
path property of the record class/record
plain text property of the tab class/record
plain text property of the think window class/record
plain text property of the record class/record
POSIX path property of the alias class/record
POSIX path property of the file class/record
prompt parameter of the display chat dialog command/event
proposed filename property of the record class/record
quality parameter of the download image for prompt command/event
reference URL property of the think window class/record
reference URL property of the record class/record
reference URL property of the tab class/record
referrer parameter of the open tab for command/event
referrer parameter of the add download command/event
referrer parameter of the create formatted note from command/event
referrer parameter of the create Markdown from command/event
referrer parameter of the create PDF document from command/event
referrer parameter of the create web document from command/event
referrer parameter of the download JSON from command/event
referrer parameter of the download markup from command/event
referrer parameter of the download URL command/event
rich text property of the tab class/record
rich text property of the think window class/record
role parameter of the display chat dialog command/event
role parameter of the get chat response for message command/event
search predicates property of the smart parent class/record
search query property of the main window class/record
selected text property of the tab class/record
selected text property of the think window class/record
short date string property of the date class/record
size parameter of the download image for prompt command/event
source property of the think window class/record
source property of the feed item class/record
source property of the record class/record
source property of the tab class/record
source parameter of the create formatted note from command/event
style parameter of the download image for prompt command/event
subject property of the PDF properties class/record
tags property of the group selector result class/record
target printer property of the print settings class/record
template parameter of the export website command/event
text parameter of the imprint command/event
text content property of the feed item class/record
text content property of the rich text class/record
text content property of the attribute run class/record
text content property of the character class/record
text content property of the word class/record
text content property of the paragraph class/record
time string property of the date class/record
title property of the reading list item class/record
title property of the feed item class/record
title property of the PDF properties class/record
title parameter of the add reading list command/event
to parameter of the move to external folder command/event
to parameter of the set cell at command/event
to parameter of the compress command/event
to parameter of the export command/event
to parameter of the export website command/event
URL property of the think window class/record
URL property of the reading list item class/record
URL property of the feed item class/record
URL parameter of the open tab for command/event
URL parameter of the update command/event
URL property of the record class/record
URL property of the tab class/record
URL property of the rich text class/record
URL property of the character class/record
URL property of the word class/record
URL parameter of the add reading list command/event
URL parameter of the get chat response for message command/event
URL property of the paragraph class/record
URL property of the attribute run class/record
user property of the authentication result class/record
user parameter of the add download command/event
user parameter of the download JSON from command/event
user parameter of the download markup from command/event
user parameter of the download URL command/event
uuid property of the database class/record
uuid property of the record class/record
version property of the application class/record
with text parameter of the update command/event
workspaces property of the application class/record
type class
type class (type)[synonyms: type]A class value.
DESCRIPTION
The type class datatype (or class, or type) is the value type of a value type. For example, when you ask AppleScript for the class of a value, and AppleScript tells you that it is an integer or a real or a folder or whatever, this value must itself be of some class, and this is it. There are times when it is necessary to pass a class to a command; for example, the make command needs to know what class of object to create.

WHERE USED
The type class type is used in the following ways:
each parameter of the count command/event
new parameter of the make command/event
DEVONTHINK SUITE
DEVONthink SuiteClasses and commands for the DEVONthink application
DESCRIPTION
AppleScript:

-- It's recommended to use the id instead of the application's name or bundle identifier to make the script compatible to future versions.
tell application id "DNtp"
	-- Process selection
	repeat with theRecord in selected records
	end repeat

	-- Process Markdown documents of current database
	repeat with theRecord in (contents of current database whose record type is markdown)
	end repeat

	-- Execute JavaScript in AppleScript
	set theJavaScript to "var app = Application.currentApplication();
		app.includeStandardAdditions = true;
		app.displayDialog(\"JavaScript Code\");"
	run script theJavaScript in "JavaScript"
end tell
JavaScript:

(() => {
	const theApp = Application("DEVONthink");
	theApp.includeStandardAdditions = true;

	// Process selection
	let theSelection = theApp.selectedRecords();
	theSelection.forEach (r => {
	})

	// Process Markdown documents of current database
	let theDocs = theApp.currentDatabase.contents.whose({ _match: [ObjectSpecifier().recordType, "markdown"] })();
	theDocs.forEach (r => {
	})

	// Execute AppleScript in JavaScript
	const theAppleScript = 'display dialog "AppleScript Code"';
	var app = Application.currentApplication();
	app.includeStandardAdditions = true;
	app.runScript(theAppleScript, { 'in': "AppleScript" });
})();
		
COMMANDS
add custom meta data
add custom meta data (verb)[synonyms: add custom metadata]Add user-defined metadata to a record or updates already existing metadata of a record. Setting a value for an unknown key automatically adds a definition to Settings > Data. (from DEVONthink Suite)
DESCRIPTION
AppleScript:

tell application id "DNtp"
	set theDate to current date
	repeat with theRecord in selected records
		add custom meta data "Me" for "author" to theRecord
		add custom meta data theDate for "date" to theRecord
		add custom meta data 3.14 for "price" to theRecord
	end repeat
end tell
			
JavaScript:

(() => {
	const theApp = Application("DEVONthink");
	const theRecords = theApp.selectedRecords();
	const theDate = new Date();
	theRecords.forEach (r => {
		theApp.addCustomMetaData("Me",{for: 'author', to:r});
		theApp.addCustomMetaData(theDate,{for: 'date', to:r});
		theApp.addCustomMetaData(3.14,{for: 'price', to:r});
	})
})();
			
FUNCTION SYNTAX
set theResult to add custom meta data rich text, text, number, integer, real, boolean or date ¬
     for text ¬
     to record ¬
     as text or missing value
RESULT
booleanTrue if adding was successful, false if not.
PARAMETERS
Parameter
Required
Type
Description
direct parameter	required	rich text, text, number, integer, real, boolean or date	The value to add.
as	optional	text or missing value	The desired format. Either 'text' (default), 'richtext', 'string', 'uuid', 'url', 'crosslink', 'date', 'real', 'int', 'bool', 'set', 'countries' or 'languages'.
for	required	text	The key for the user-defined value.
to	required	record	The record.
SEE ALSO
get custom meta data				
add download
add download (verb)Add a URL to the download manager. (from DEVONthink Suite)
FUNCTION SYNTAX
set theResult to add download text ¬
     automatic boolean ¬
     password text or missing value ¬
     referrer text or missing value ¬
     user text or missing value
RESULT
booleanTrue if adding was successful, false if not.
PARAMETERS
Parameter
Required
Type
Description
direct parameter	required	text	The URL to add.
automatic	optional	boolean	Automatic or user (default) download.
password	optional	text or missing value	The password for protected websites.
referrer	optional	text or missing value	The HTTP referrer.
user	optional	text or missing value	The user name for protected websites.
CLASSES
The following classes respond to the add download command:
application				
add reading list
add reading list (verb)Add record or URL to reading list. (from DEVONthink Suite)
FUNCTION SYNTAX
set theResult to add reading list record record or missing value ¬
     URL text or missing value ¬
     title text or missing value
RESULT
booleanTrue if adding was successful, false if not.
PARAMETERS
Parameter
Required
Type
Description
record	optional	record or missing value	The record. Only documents are supported.
title	optional	text or missing value	The title of the webpage.
URL	optional	text or missing value	The URL of the webpage.
CLASSES
The following classes respond to the add reading list command:
application				
add reminder
add reminder (verb)Add a new reminder to a record. (from DEVONthink Suite)
DESCRIPTION
Properties:

alarm, alarm string, day of week, due date, interval, masc, schedule, week of month
			
AppleScript:

tell application id "DNtp"
	set due_date to current date
	set due_date to due_date + 3600 * 24
	repeat with theRecord in selected records
		add reminder {schedule:once, alarm:alert, alarm string:"Test", due date:due_date} to theRecord
	end repeat
end tell
			
JavaScript:

(() => {
	const theApp = Application('DEVONthink');
	const theRecords = theApp.selectedRecords();
	const due_date = new Date(new Date().getTime() + 3600 * 24 * 1000);
	theRecords.forEach (r => {
		let reminder = theApp.addReminder({schedule: 'once', alarm: 'alert', 'alarm string': 'Test', 'due date': due_date},{to:r});
	})
})();
			
FUNCTION SYNTAX
set theResult to add reminder dictionary ¬
     to record
RESULT
reminder or missing valueThe added reminder.
PARAMETERS
Parameter
Required
Type
Description
direct parameter	required	dictionary	The properties of the reminder. At least 'schedule' and 'due date' are required.
to	required	record	The record.
CLASSES
The following classes respond to the add reminder command:
application				
add row
add row (verb)Add new row to current sheet. (from DEVONthink Suite)
DESCRIPTION
AppleScript:

tell application id "DNtp"
	tell think window 1
		add row cells {"Dummy"}
	end tell
end tell
			
JavaScript:

(() => {
	const theApp = Application("DEVONthink");
	const theWindow = theApp.thinkWindows()[0];
	theApp.addRow(theWindow,{cells:"Dummy"});
})();
			
FUNCTION SYNTAX
set theResult to add row reference ¬
     cells list of text
RESULT
booleanTrue if adding was successful, false if not.
PARAMETERS
Parameter
Required
Type
Description
direct parameter	required	reference	The tab or window.
cells	required	list of text	Cells of new row.
CLASSES
The following classes respond to the add row command:
think window	document window	main window	tab	
SEE ALSO
delete row at				
check file integrity of
check file integrity of (verb)Check file integrity of database. (from DEVONthink Suite)
FUNCTION SYNTAX
set theResult to check file integrity of database database
RESULT
integerNumber of files having an invalid content hash.
PARAMETERS
Parameter
Required
Type
Description
database	required	database	The database to check.
CLASSES
The following classes respond to the check file integrity of command:
application				
SEE ALSO
optimize	verify			
classify
classify (verb)Get a list of classification proposals. (from DEVONthink Suite)
FUNCTION SYNTAX
set theResult to classify record record ¬
     in database or missing value ¬
     comparison comparison type ¬
     tags boolean
RESULT
list of parent or missing valueThe proposed groups or tags.
PARAMETERS
Parameter
Required
Type
Description
comparison	optional	comparison type	The comparison to use (default is data comparison).
in	optional	database or missing value	The database. Uses all databases if not specified.
record	required	record	The record to classify.
tags	optional	boolean	Propose ordinary tags instead of groups (off by default).
CLASSES
The following classes respond to the classify command:
application				
SEE ALSO
compare				
compare
compare (verb)Get a list of similar records, either by specifying a record or a content. (from DEVONthink Suite)
FUNCTION SYNTAX
set theResult to compare record content or missing value ¬
     content text or missing value ¬
     to database or missing value ¬
     comparison comparison type
RESULT
list of content or missing valueThe similar records.
PARAMETERS
Parameter
Required
Type
Description
comparison	optional	comparison type	The comparison to use (default is data comparison).
content	optional	text or missing value	The content to compare.
record	optional	content or missing value	The record to compare.
to	optional	database or missing value	The database. Uses all databases if not specified.
CLASSES
The following classes respond to the compare command:
application				
SEE ALSO
classify				
compress
compress (verb)Compress a database into a Zip archive. (from DEVONthink Suite)
FUNCTION SYNTAX
set theResult to compress database database ¬
     password text or missing value ¬
     to text
RESULT
booleanTrue if compressing was successful, false if not.
PARAMETERS
Parameter
Required
Type
Description
database	required	database	The database to compress.
password	optional	text or missing value	The required password for encrypted or audit-proof databases.
to	required	text	POSIX path or file URL of Zip archive. The path extension '.zip' is required.
CLASSES
The following classes respond to the compress command:
application				
convert
convert (verb)Convert a record to plain or rich text, formatted note or HTML and create a new record afterwards. (from DEVONthink Suite)
FUNCTION SYNTAX
set theResult to convert record content or list of content ¬
     to convert type ¬
     in parent or missing value
RESULT
content, list of content or missing valueThe converted records.
PARAMETERS
Parameter
Required
Type
Description
in	optional	parent or missing value	The destination group for the converted record. Parents of the record to convert are used if not specified.
record	required	content or list of content	The record(s) to convert.
to	optional	convert type	The desired format (default simple).
CLASSES
The following classes respond to the convert command:
application				
convert feed to HTML
convert feed to HTML (verb)Convert a RSS, RDF, JSON or Atom feed to HTML. (from DEVONthink Suite)
FUNCTION SYNTAX
set theResult to convert feed to HTML text ¬
     base URL text or missing value
RESULT
text or missing valueThe converted HTML.
PARAMETERS
Parameter
Required
Type
Description
direct parameter	required	text	The source code of the feed.
base URL	optional	text or missing value	The URL of the feed.
CLASSES
The following classes respond to the convert feed to HTML command:
application				
create database
create database (verb)Create a new database. (from DEVONthink Suite)
FUNCTION SYNTAX
set theResult to create database text ¬
     encryption key text or missing value ¬
     size integer
RESULT
database or missing valueThe created database.
PARAMETERS
Parameter
Required
Type
Description
direct parameter	required	text	POSIX file path of database. Suffix has to be either .dtBase2, .dtSparse (encrypted) or .dtArchive (encrypted & audit-proof).
encryption key	optional	text or missing value	The encryption key.
size	optional	integer	The maximal size of encrypted databases in MB.
CLASSES
The following classes respond to the create database command:
application				
create formatted note from
create formatted note from (verb)Create a new formatted note from a web page. (from DEVONthink Suite)
FUNCTION SYNTAX
set theResult to create formatted note from text ¬
     agent text or missing value ¬
     in parent or missing value ¬
     name text or missing value ¬
     readability boolean ¬
     referrer text or missing value ¬
     source text or missing value
RESULT
content or missing valueThe created record.
PARAMETERS
Parameter
Required
Type
Description
direct parameter	required	text	The URL to download.
agent	optional	text or missing value	The user agent.
in	optional	parent or missing value	The destination group for the new record. Uses incoming group or group selector if not specified.
name	optional	text or missing value	The name for the new record.
readability	optional	boolean	Declutter page layout.
referrer	optional	text or missing value	The HTTP referrer.
source	optional	text or missing value	The HTML source.
CLASSES
The following classes respond to the create formatted note from command:
application				
create location
create location (verb)Create a hierarchy of groups if necessary. (from DEVONthink Suite)
FUNCTION SYNTAX
set theResult to create location text ¬
     in database, parent or missing value
RESULT
parent or missing valueThe existing or created group.
PARAMETERS
Parameter
Required
Type
Description
direct parameter	required	text	The hierarchy as a POSIX path (/ in names has to be replaced with \/, see location property).
in	optional	database, parent or missing value	The destination database or group. Uses current database if not specified.
CLASSES
The following classes respond to the create location command:
application				
SEE ALSO
exists record at	get record at			
create Markdown from
create Markdown from (verb)Create a Markdown document from a web resource. (from DEVONthink Suite)
FUNCTION SYNTAX
set theResult to create Markdown from text ¬
     agent text or missing value ¬
     in parent or missing value ¬
     name text or missing value ¬
     readability boolean ¬
     referrer text or missing value
RESULT
content or missing valueThe created record.
PARAMETERS
Parameter
Required
Type
Description
direct parameter	required	text	The URL to download.
agent	optional	text or missing value	The user agent.
in	optional	parent or missing value	The destination group for the new record. Uses incoming group or group selector if not specified.
name	optional	text or missing value	The name for the new record.
readability	optional	boolean	Declutter page layout.
referrer	optional	text or missing value	The HTTP referrer.
CLASSES
The following classes respond to the create Markdown from command:
application				
create PDF document from
create PDF document from (verb)Create a new PDF document with or without pagination from a web resource. (from DEVONthink Suite)
FUNCTION SYNTAX
set theResult to create PDF document from text ¬
     agent text or missing value ¬
     in parent or missing value ¬
     name text or missing value ¬
     pagination boolean ¬
     readability boolean ¬
     referrer text or missing value ¬
     width number
RESULT
content or missing valueThe clipped record.
PARAMETERS
Parameter
Required
Type
Description
direct parameter	required	text	The URL to download.
agent	optional	text or missing value	The user agent.
in	optional	parent or missing value	The destination group for the new record. Uses incoming group or group selector if not specified.
name	optional	text or missing value	The name for the new record.
pagination	optional	boolean	Paginate PDF document or not.
readability	optional	boolean	Declutter page layout.
referrer	optional	text or missing value	The HTTP referrer.
width	optional	number	The preferred width for the PDF document in points.
CLASSES
The following classes respond to the create PDF document from command:
application				
create record with
create record with (verb)[synonyms: create record with properties]Create a new record. (from DEVONthink Suite)
DESCRIPTION
Supported properties:

Generic:	name, type, record type, comment, aliases, path, URL, creation date, modification date, date, tags, thumbnail
Exclusions:	exclude from chat, exclude from classification, exclude from search, exclude from see also, exclude from tagging, exclude from Wiki linking
Documents:	plain text, rich text, source, data, content, image, columns, cells
Smart groups:	exclude subgroups, highlight occurrences, search group, search predicates
			
AppleScript:

tell application id "DNtp"
	set theGroup to current group
	set theBookmark to create record with {name:"DEVONtechnologies", type:bookmark, URL:"https://www.devon-technologies.com", comment:"Our website.", tags:"DEVONtechnologies,DEVONthink,DEVONagent"} in theGroup
	set theNote to create record with {name:"Note", |type|:"markdown", content:"# Headline" & return & return & "Type your notes here."} in theGroup
	set theDocument to create record with {name:"Demo", aliases:"Demos", record type:txt, plain text:"Dummy", date:(current date), tags:"A,B,C"} in theGroup
	set theSmartGroup to create record with {name:"All documents", record type:smart group, search predicates:"kind:any"} in theGroup
	set theSheet to create record with {name:"Sheet", record type:sheet, columns:{"Name#text", "ID#uuid", "Num#int"}, cells:{{"First", "1", "1.23"}, {"Second", "2", "4.56"}}} in theGroup
end tell
			
JavaScript:

(() => {
	const theApp = Application("DEVONthink");
	const theGroup = theApp.currentGroup();
	let theBookmark  = theApp.createRecordWith({name:"DEVONtechnologies", 'record type':"bookmark", URL:"https://www.devon-technologies.com", comment:"Our website.", tags:"DEVONtechnologies,DEVONthink,DEVONagent"},{in:theGroup});
	let theNote  = theApp.createRecordWith({'name':"Note", type:"markdown", content:"# Headline\n\nType your notes here."},{in:theGroup});
	let theSheet = theApp.createRecordWith({'name': "Sheet", type: "sheet", columns:['Name#text','ID#uuid','Num#int'],cells:[['First','1','1.23'],['Second','2','4.56']]},{in:theGroup});
})();
			
FUNCTION SYNTAX
set theResult to create record with dictionary ¬
     in parent or missing value
RESULT
record or missing valueThe created record.
PARAMETERS
Parameter
Required
Type
Description
direct parameter	required	dictionary	The properties of the record. At least 'type' or 'record type' is required, its value can be also specified as a string.
in	optional	parent or missing value	The destination group for the new record. Uses incoming group or group selector if not specified.
CLASSES
The following classes respond to the create record with command:
application				
SEE ALSO
delete				
create thumbnail
create thumbnail (verb)Create or update existing thumbnail of a record. Thumbnailing is performed asynchronously in the background. (from DEVONthink Suite)
FUNCTION SYNTAX
set theResult to create thumbnail for record
RESULT
booleanTrue if thumbnailing was successful, false if not.
PARAMETERS
Parameter
Required
Type
Description
for	required	record	The record.
CLASSES
The following classes respond to the create thumbnail command:
application				
SEE ALSO
delete thumbnail	update thumbnail			
create web document from
create web document from (verb)Create a new record (picture, PDF or web archive) from a web resource. (from DEVONthink Suite)
FUNCTION SYNTAX
set theResult to create web document from text ¬
     agent text or missing value ¬
     in parent or missing value ¬
     name text or missing value ¬
     readability boolean ¬
     referrer text or missing value
RESULT
content or missing valueThe clipped record.
PARAMETERS
Parameter
Required
Type
Description
direct parameter	required	text	The URL to download.
agent	optional	text or missing value	The user agent.
in	optional	parent or missing value	The destination group for the new record. Uses incoming group or group selector if not specified.
name	optional	text or missing value	The name for the new record.
readability	optional	boolean	Declutter page layout.
referrer	optional	text or missing value	The HTTP referrer.
CLASSES
The following classes respond to the create web document from command:
application				
delete
delete (verb)Delete all instances of a record from the database or one instance from the specified group. (from DEVONthink Suite)
FUNCTION SYNTAX
set theResult to delete record record or list of record ¬
     in parent or missing value
RESULT
booleanTrue if deleting was successful, false if not.
PARAMETERS
Parameter
Required
Type
Description
in	optional	parent or missing value	The parent group of this instance.
record	required	record or list of record	The record(s) to delete.
CLASSES
The following classes respond to the delete command:
application				
SEE ALSO
create record with				
delete row at
delete row at (verb)Remove row at specified position from current sheet. (from DEVONthink Suite)
DESCRIPTION
AppleScript:

tell application id "DNtp"
	tell current tab of think window 1
		delete row at position 1
	end tell
end tell
			
JavaScript:

(() => {
	const theApp = Application("DEVONthink");
	const theWindow = theApp.thinkWindows()[0];
	theApp.deleteRowAt(theWindow,{position:1});
})();
			
FUNCTION SYNTAX
set theResult to delete row at reference ¬
     position integer
RESULT
booleanTrue if deleting was successful, false if not.
PARAMETERS
Parameter
Required
Type
Description
direct parameter	required	reference	The tab or window.
position	required	integer	Position of row (1...n).
CLASSES
The following classes respond to the delete row at command:
think window	document window	main window	tab	
SEE ALSO
add row				
delete thumbnail
delete thumbnail (verb)Delete existing thumbnail of a record. (from DEVONthink Suite)
FUNCTION SYNTAX
set theResult to delete thumbnail of record
RESULT
booleanTrue if deleting was successful, false if not.
PARAMETERS
Parameter
Required
Type
Description
of	required	record	The record.
CLASSES
The following classes respond to the delete thumbnail command:
application				
SEE ALSO
create thumbnail	update thumbnail			
delete workspace
delete workspace (verb)Delete a workspace. (from DEVONthink Suite)
FUNCTION SYNTAX
set theResult to delete workspace text
RESULT
booleanTrue if deleting was successful, false if not.
PARAMETERS
Parameter
Required
Type
Description
direct parameter	required	text	The name of the workspace.
CLASSES
The following classes respond to the delete workspace command:
application				
SEE ALSO
load workspace	save workspace			
display authentication dialog
display authentication dialog (verb)Display a dialog to enter a username and its password. (from DEVONthink Suite)
FUNCTION SYNTAX
set theResult to display authentication dialog text or missing value
RESULT
authentication result or missing valueThe authentication result.
PARAMETERS
Parameter
Required
Type
Description
direct parameter	optional	text or missing value	The info for the dialog.
CLASSES
The following classes respond to the display authentication dialog command:
application				
display chat dialog
display chat dialog (verb)Display a dialog to show the response for a chat prompt for the current document. Either the selected text or the complete document is used. (from DEVONthink Suite)
FUNCTION SYNTAX
set theResult to display chat dialog reference ¬
     name text or missing value ¬
     role text or missing value ¬
     prompt text or missing value
RESULT
text or missing valueThe text content of the response.
PARAMETERS
Parameter
Required
Type
Description
direct parameter	required	reference	The tab or window.
name	optional	text or missing value	The title of the dialog.
prompt	required	text or missing value	The desired prompt.
role	optional	text or missing value	The desired role for the chat.
CLASSES
The following classes respond to the display chat dialog command:
think window	document window	main window	tab	
SEE ALSO
get chat models for engine	get chat response for message			
display date editor
display date editor (verb)Display a dialog to enter a date. (from DEVONthink Suite)
FUNCTION SYNTAX
set theResult to display date editor text or missing value ¬
     default date date or missing value ¬
     info text or missing value
RESULT
date or missing valueThe entered date.
PARAMETERS
Parameter
Required
Type
Description
direct parameter	optional	text or missing value	The title of the dialog. By default the application name.
default date	optional	date or missing value	The default date.
info	optional	text or missing value	The info for the dialog.
CLASSES
The following classes respond to the display date editor command:
application				
display group selector
display group selector (verb)Display a dialog to select a (destination) group. (from DEVONthink Suite)
FUNCTION SYNTAX
set theResult to display group selector text or missing value ¬
     buttons list of text or missing value ¬
     for database or missing value ¬
     name boolean ¬
     tags boolean
RESULT
parent, group selector result or missing valueThe selected group (without 'name' and 'tags' parameters) due to compatibility to older versions or a group selector result (with 'name' and/or 'tags' parameters).
PARAMETERS
Parameter
Required
Type
Description
direct parameter	optional	text or missing value	The title of the dialog.
buttons	optional	list of text or missing value	The labels for the cancel and select buttons.
for	optional	database or missing value	The database. All open databases are used if not specified.
name	optional	boolean	Show field to enter a name (off by default)
tags	optional	boolean	Show field to enter tags (off by default)
CLASSES
The following classes respond to the display group selector command:
application				
display name editor
display name editor (verb)Display a dialog to enter a name. (from DEVONthink Suite)
FUNCTION SYNTAX
set theResult to display name editor text or missing value ¬
     default answer text or missing value ¬
     info text or missing value
RESULT
text or missing valueThe entered name.
PARAMETERS
Parameter
Required
Type
Description
direct parameter	optional	text or missing value	The title of the dialog. By default the application name.
default answer	optional	text or missing value	The default editable name.
info	optional	text or missing value	The info for the dialog.
CLASSES
The following classes respond to the display name editor command:
application				
do JavaScript
do JavaScript (verb)Executes a string of JavaScript code (optionally in the web view of a think window). (from DEVONthink Suite)
FUNCTION SYNTAX
set theResult to do JavaScript text ¬
     in think window or missing value
RESULT
text or missing valueThe result returned by the JavaScript code.
PARAMETERS
Parameter
Required
Type
Description
direct parameter	required	text	The code.
in	optional	think window or missing value	The think window that the JavaScript should be executed in.
CLASSES
The following classes respond to the do JavaScript command:
application				
download image for prompt
download image for prompt (verb)Download image for a prompt. (from DEVONthink Suite)
DESCRIPTION
Sizes:

Dall-E 3         1024x1024, 1792x1024, 1024x1792
GPT-Image-1      1024x1024, 1536x1024, 1024x1536
Flux Schnell/Pro 1024x1024, 1344x768, 768x1344
Flux Pro Ultra   2048x2048, 2752x1536, 1536x2752
Stable Diffusion 1024x1024, 1344x768, 768x1344
Recraft 3        1024x1024, 1820x1024, 1024x1820
Imagen           1024x1024, 1408x768, 768x1408
Styles:

Dall-E 3         natural, vivid
Flux Pro         creative, raw
Flux Pro Ultra   processed, raw
Recraft 3        any, realistic_image, digital_illustration
AppleScript:

tell application id "DNtp"
	set thePrompt to "A 1934 canary-yellow Ford sitting at a stop light next to a red Ford Fusion. High noon on a small town main street."
	set theImageData to download image for prompt thePrompt engine FluxPro size "1344x768"
	set theRecord to create record with {name:"Fords", type:picture, data:theImageData} in current group
end tell
			
JavaScript:

(() => {
	const theApp = Application("DEVONthink");
	const thePrompt = "A 1934 canary-yellow Ford sitting at a stop light next to a red Ford Fusion. High noon on a small town main street.";
	let theImageData = theApp.downloadImageForPrompt(thePrompt,{'engine':"FluxPro",'size':"1344x768"});
	let theRecord = theApp.createRecordWith({name:"Fords", 'type':"picture", 'data':theImageData},{in:theApp.currentGroup()});
})();
			
FUNCTION SYNTAX
set theResult to download image for prompt text ¬
     prompt strength real ¬
     image raw data, text or missing value ¬
     engine image engine ¬
     quality text ¬
     size text ¬
     style text ¬
     seed integer
RESULT
raw data or missing valueThe received image data.
PARAMETERS
Parameter
Required
Type
Description
direct parameter	required	text	The prompt to send.
engine	optional	image engine	The desired engine, default depends on settings.
image	optional	raw data, text or missing value	Optional image data or image URL to send. Only supported by Flux Pro/Pro Ultra, GPT-Image-1 and Stable Diffusion Large/Turbo.
prompt strength	optional	real	Prompt strength (0.0-1.0) when using 'image' parameter. 1.0 uses only the text prompt, 0.0 only the image, default is 0.15. Only supported by Flux Pro Ultra and Stable Diffusion.
quality	optional	text	The quality of the image. Either 'standard' (default) or 'hd'. Only supported by Dall-E 3, GPT-Image-1, Flux Schnell/Pro & Stable Diffusion. Default quality depends on settings.
seed	optional	integer	Set for reproducible generation, otherwise random seed. Only supported by Flux and Stable Diffusion.
size	optional	text	The size of the image. Size is automatically choosen in case of image data if not specified, otherwise default size depends on settings.
style	optional	text	The style of the image. Default style depends on settings.
CLASSES
The following classes respond to the download image for prompt command:
application				
SEE ALSO
display chat dialog	get chat response for message			
download JSON from
download JSON from (verb)Download a JSON object. (from DEVONthink Suite)
FUNCTION SYNTAX
set theResult to download JSON from text ¬
     agent text or missing value ¬
     method text or missing value ¬
     password text or missing value ¬
     post dictionary or missing value ¬
     referrer text or missing value ¬
     user text or missing value
RESULT
dictionary or missing valueThe downloaded JSON object.
PARAMETERS
Parameter
Required
Type
Description
direct parameter	required	text	The URL of the JSON object to download.
agent	optional	text or missing value	The user agent.
method	optional	text or missing value	The HTTP method ('GET' by default)
password	optional	text or missing value	The password for protected websites.
post	optional	dictionary or missing value	A dictionary containing key-value pairs for HTTP POST actions.
referrer	optional	text or missing value	The HTTP referrer.
user	optional	text or missing value	The user name for protected websites.
CLASSES
The following classes respond to the download JSON from command:
application				
download markup from
download markup from (verb)Download an HTML or XML page (including RSS, RDF or Atom feeds). (from DEVONthink Suite)
FUNCTION SYNTAX
set theResult to download markup from text ¬
     agent text or missing value ¬
     encoding text or missing value ¬
     method text or missing value ¬
     password text or missing value ¬
     post dictionary or missing value ¬
     referrer text or missing value ¬
     user text or missing value
RESULT
text or missing valueThe downloaded XML/HTML.
PARAMETERS
Parameter
Required
Type
Description
direct parameter	required	text	The URL of the HTML or XML page to download.
agent	optional	text or missing value	The user agent.
encoding	optional	text or missing value	The encoding of the page (default UTF-8).
method	optional	text or missing value	The HTTP method ('GET' by default)
password	optional	text or missing value	The password for protected websites.
post	optional	dictionary or missing value	A dictionary containing key-value pairs for HTTP POST actions.
referrer	optional	text or missing value	The HTTP referrer.
user	optional	text or missing value	The user name for protected websites.
CLASSES
The following classes respond to the download markup from command:
application				
download URL
download URL (verb)Download a URL. (from DEVONthink Suite)
DESCRIPTION
AppleScript:

tell application "DEVONthink"
	set theURL to "https://www.devontechnologies.com/assets/images/appicons/300900000.png"
	set theData to download URL theURL
	set theRecord to create record with {name:"Test", URL:theURL, type:picture, content:theData} in current group
end tell
			
JavaScript:

(() => {
	const theApp = Application("DEVONthink");
	theApp.includeStandardAdditions = true;

	let theURL = "https://www.devontechnologies.com/assets/images/appicons/300900000.png";
	let theData = theApp.downloadURL(theURL);
	let theRecord = theApp.createRecordWith({"name":"Test", "URL":theURL, "type":"picture", "data":theData},{in:theApp.currentGroup});
})();
			
FUNCTION SYNTAX
set theResult to download URL text ¬
     agent text or missing value ¬
     method text or missing value ¬
     password text or missing value ¬
     post dictionary or missing value ¬
     referrer text or missing value ¬
     user text or missing value
RESULT
raw data or missing valueThe downloaded data.
PARAMETERS
Parameter
Required
Type
Description
direct parameter	required	text	The URL to download.
agent	optional	text or missing value	The user agent.
method	optional	text or missing value	The HTTP method ('GET' by default)
password	optional	text or missing value	The password for protected websites.
post	optional	dictionary or missing value	A dictionary containing key-value pairs for HTTP POST actions.
referrer	optional	text or missing value	The HTTP referrer.
user	optional	text or missing value	The user name for protected websites.
CLASSES
The following classes respond to the download URL command:
application				
duplicate
duplicate (verb)Duplicate a record. (from DEVONthink Suite)
FUNCTION SYNTAX
set theResult to duplicate record record or list of record ¬
     to parent
RESULT
record, list of record or missing valueThe duplicated record(s).
PARAMETERS
Parameter
Required
Type
Description
record	required	record or list of record	The record(s) to duplicate. Indexed items are not supported by audit-proof databases.
to	required	parent	The destination group which doesn't have to be in the same database.
CLASSES
The following classes respond to the duplicate command:
application				
SEE ALSO
move	replicate			
exists record at
exists record at (verb)Check if at least one record exists at the specified location. (from DEVONthink Suite)
FUNCTION SYNTAX
set theResult to exists record at text ¬
     in database, parent or missing value
RESULT
booleanTrue if records exists, false if not.
PARAMETERS
Parameter
Required
Type
Description
direct parameter	required	text	The location of the record as a POSIX path (/ in names has to be replaced with \/, see location property).
in	optional	database, parent or missing value	The base database or group. Uses current database if not specified.
CLASSES
The following classes respond to the exists record at command:
application				
SEE ALSO
create location	get record at			
exists record with comment
exists record with comment (verb)Check if at least one record with the specified comment exists. (from DEVONthink Suite)
FUNCTION SYNTAX
set theResult to exists record with comment text ¬
     in database or missing value
RESULT
booleanTrue if records exists, false if not.
PARAMETERS
Parameter
Required
Type
Description
direct parameter	required	text	The comment.
in	optional	database or missing value	The database. Uses current database if not specified
CLASSES
The following classes respond to the exists record with comment command:
application				
SEE ALSO
lookup records with comment				
exists record with content hash
exists record with content hash (verb)Check if at least one record with the specified content hash exists. (from DEVONthink Suite)
FUNCTION SYNTAX
set theResult to exists record with content hash text ¬
     in database or missing value
RESULT
booleanTrue if records exists, false if not.
PARAMETERS
Parameter
Required
Type
Description
direct parameter	required	text	The content hash.
in	optional	database or missing value	The database. Uses current database if not specified
CLASSES
The following classes respond to the exists record with content hash command:
application				
SEE ALSO
lookup records with content hash				
exists record with file
exists record with file (verb)Check if at least one record with the specified last path component exists. (from DEVONthink Suite)
FUNCTION SYNTAX
set theResult to exists record with file text ¬
     in database or missing value
RESULT
booleanTrue if records exists, false if not.
PARAMETERS
Parameter
Required
Type
Description
direct parameter	required	text	The filename.
in	optional	database or missing value	The database. Uses current database if not specified
CLASSES
The following classes respond to the exists record with file command:
application				
SEE ALSO
lookup records with file				
exists record with path
exists record with path (verb)Check if at least one record with the specified path exists. (from DEVONthink Suite)
FUNCTION SYNTAX
set theResult to exists record with path text ¬
     in database or missing value
RESULT
booleanTrue if records exists, false if not.
PARAMETERS
Parameter
Required
Type
Description
direct parameter	required	text	The path.
in	optional	database or missing value	The database. Uses current database if not specified.
CLASSES
The following classes respond to the exists record with path command:
application				
SEE ALSO
lookup records with path				
exists record with URL
exists record with URL (verb)Check if at least one record with the specified URL exists. (from DEVONthink Suite)
FUNCTION SYNTAX
set theResult to exists record with URL text ¬
     in database or missing value
RESULT
booleanTrue if records exists, false if not.
PARAMETERS
Parameter
Required
Type
Description
direct parameter	required	text	The URL (or path).
in	optional	database or missing value	The database. Uses current database if not specified.
CLASSES
The following classes respond to the exists record with URL command:
application				
SEE ALSO
lookup records with URL				
export
export (verb)Export a record (and its children). (from DEVONthink Suite)
FUNCTION SYNTAX
set theResult to export record record ¬
     to text ¬
     DEVONtech_Storage boolean
RESULT
text or missing valueThe path of the exported record.
PARAMETERS
Parameter
Required
Type
Description
DEVONtech_Storage	optional	boolean	Export 'DEVONtech_Storage' files which include all metadata (e.g. flag, label, locking, aliases, comments, exclusions, custom metadata etc.) for importing. On by default.
record	required	record	The record to export.
to	required	text	The destination directory as a POSIX path or file URL. DEVONthink creates the destination if necessary.
CLASSES
The following classes respond to the export command:
application				
export tags of
export tags of (verb)Export Finder tags of a record. (from DEVONthink Suite)
FUNCTION SYNTAX
set theResult to export tags of record record
RESULT
booleanTrue if exporting was successful, false if not.
PARAMETERS
Parameter
Required
Type
Description
record	required	record	The record.
CLASSES
The following classes respond to the export tags of command:
application				
export website
export website (verb)Export a record (and its children) as a website. (from DEVONthink Suite)
FUNCTION SYNTAX
set theResult to export website record record ¬
     to text ¬
     template text or missing value ¬
     index pages boolean ¬
     encoding text or missing value ¬
     entities boolean
RESULT
text or missing valueThe path of the exported record.
PARAMETERS
Parameter
Required
Type
Description
encoding	optional	text or missing value	The encoding of the exported HTML pages (default UTF-8).
entities	optional	boolean	Use HTML entities. Off by default.
index pages	optional	boolean	Create index pages. Off by default.
record	required	record	The record to export.
template	optional	text or missing value	Name of built-in template or full POSIX path of template. Uses Default template if not specified.
to	required	text	The destination directory as a POSIX path or file URL. DEVONthink creates the destination if necessary.
CLASSES
The following classes respond to the export website command:
application				
extract keywords from
extract keywords from (verb)Extract list of keywords from a record. The list is sorted by number of occurrences. (from DEVONthink Suite)
FUNCTION SYNTAX
set theResult to extract keywords from record record ¬
     barcodes boolean ¬
     existing tags boolean ¬
     hash tags boolean ¬
     image tags boolean
RESULT
list of text or missing valueThe extracted keywords.
PARAMETERS
Parameter
Required
Type
Description
barcodes	optional	boolean	Include scanned barcodes.
existing tags	optional	boolean	Include existing tags (and their aliases) found in the title, comment or text of the record.
hash tags	optional	boolean	Include hash tags found in the title or text of the record.
image tags	optional	boolean	Include suggested image tags.
record	required	record	The record.
CLASSES
The following classes respond to the extract keywords from command:
application				
get cached data for URL
get cached data for URL (verb)Get cached data for URL of a resource which is part of a loaded webpage and its DOM tree, rendered in a think tab/window. (from DEVONthink Suite)
FUNCTION SYNTAX
set theResult to get cached data for URL text ¬
     from tab or missing value
RESULT
raw data or missing valueThe cached data.
PARAMETERS
Parameter
Required
Type
Description
direct parameter	required	text	The URL.
from	optional	tab or missing value	The source think tab. Uses current tab of frontmost think window otherwise.
CLASSES
The following classes respond to the get cached data for URL command:
application				
get cell at
get cell at (verb)Get content of cell at specified position of current sheet. (from DEVONthink Suite)
DESCRIPTION
AppleScript:

tell application id "DNtp"
	tell think window 1
		set theValue to get cell at column 1 row 1
	end tell
end tell
			
JavaScript:

(() => {
	const theApp = Application("DEVONthink");
	const theWindow = theApp.thinkWindows()[0];
	let theValue = theApp.getCellAt(theWindow,{column:1,row:1});
})();
			
FUNCTION SYNTAX
set theResult to get cell at reference ¬
     column integer or text ¬
     row integer
RESULT
text or missing valueThe value of the cell.
PARAMETERS
Parameter
Required
Type
Description
direct parameter	required	reference	The tab or window.
column	required	integer or text	Either the index (1...n) or the name of the column of the cell.
row	required	integer	The row (1...n) of the cell.
CLASSES
The following classes respond to the get cell at command:
think window	document window	main window	tab	
SEE ALSO
set cell at				
get chat models for engine
get chat models for engine (verb)Retrieve list of supported models of a chat engine. (from DEVONthink Suite)
FUNCTION SYNTAX
set theResult to get chat models for engine chat engine
RESULT
list of textThe retrieved list of models.
PARAMETERS
Parameter
Required
Type
Description
direct parameter	required	chat engine	The engine.
CLASSES
The following classes respond to the get chat models for engine command:
application				
SEE ALSO
display chat dialog	get chat response for message			
get chat response for message
get chat response for message (verb)Retrieve the response for a chat message. The chat might perform a web, Wikipedia or PubMed search if necessary depending on the parameters and the settings. (from DEVONthink Suite)
DESCRIPTION
NOTE:

Images are only supported by ChatGPT, Claude, Gemini, Mistral and Ollama or LM Studio (requires e.g. Gemma 3, Mistral Small 3.2 or LLaVA-based model)

AppleScript:

tell application id "DNtp"
	-- Process the selection at once. Alternatively use a loop and process each record on its own. This is slower but each record benefits of the complete context window.
	set theSelectionPrompt to "Create one detailed summary table combining data comprehensively from all selected documents. The Markdown table should have entries for brief narrative summary of each chapter, 3-bullet point summary of each chapter, pages, document name, and reference links as working hyperlinks."
	set theSelectionResponse to get chat response for message theSelectionPrompt record (selected records) temperature 0

	-- Process online images & web pages
	set theImageResponse to get chat response for message "Summarize this image" URL "https://www.devontechnologies.com/assets/images/appicons/300900000.png"
	set theWebResponse to get chat response for message "Summarize this web page" URL "https://www.devontechnologies.com/blog"
end tell
			
JavaScript:

(() => {
	const theApp = Application("DEVONthink");
	
	// Process the selection at once. Alternatively use a loop and process each record on its own. This is slower but each record benefits of the complete context window.
	let theSelectionPrompt = "Create one detailed summary table combining data comprehensively from all selected documents. The Markdown table should have entries for brief narrative summary of each chapter, 3-bullet point summary of each chapter, pages, document name, and reference links as working hyperlinks.";
	let theSelectionResponse = theApp.getChatResponseForMessage(theSelectionPrompt,{'record':theApp.selectedRecords(),'temperature':0});

	let theImageResponse = theApp.getChatResponseForMessage("Describe this image",{'url':"https://www.devontechnologies.com/assets/images/appicons/300900000.png"});
	let theWebResponse = theApp.getChatResponseForMessage("Summarize this web page",{'url':"https://www.devontechnologies.com/blog"});
})();
			
FUNCTION SYNTAX
set theResult to get chat response for message text, dictionary or list of dictionary ¬
     record record, list of record or missing value ¬
     mode text or missing value ¬
     image raw data or missing value ¬
     URL text or missing value ¬
     model text or missing value ¬
     role text or missing value ¬
     engine chat engine ¬
     temperature real ¬
     thinking boolean ¬
     tool calls boolean ¬
     as text or missing value
RESULT
text, array, dictionary or missing valueThe received text, JSON object or raw message.
PARAMETERS
Parameter
Required
Type
Description
direct parameter	required	text, dictionary or list of dictionary	The prompt or message(s) to send.
as	optional	text or missing value	The response format to use. Either 'text' (default), 'JSON', 'HTML', 'message' or 'raw'.
engine	optional	chat engine	The desired engine.
image	optional	raw data or missing value	Optional image data to send, a text prompt is required. NOTE: Web, Wikipedia and PubMed search isn't available.
mode	optional	text or missing value	The record's contents to use. Either 'auto' (default), 'text' or 'vision'.
model	optional	text or missing value	The desired model.
record	optional	record, list of record or missing value	Optional text- or image-based document(s) or bookmark(s), a text prompt is required. NOTE: 'image' & 'URL' parameters are ignored.
role	optional	text or missing value	The desired role for the chat.
temperature	optional	real	The desired temperature (0-2). Higher values like 0.8 will make the output more random, while lower values like 0.2 will make it more focused and deterministic. Not used in case of tool usage.
thinking	optional	boolean	Allow (default) or disallow optional thinking ("reasoning"). Without thinking the response might be faster and require less tokens. Only fully supported by Claude 3.7 Sonnet, Claude 4 Sonnet/Opus and Gemini 2.5 Flash/Pro. In case of O1, O3 and O4 the minimum effort is used if disallowed.
tool calls	optional	boolean	Allow (default) or disallow usage of tool calls (depending on the used engine and model). Without tool calls the response might be faster and require less tokens but advanced features like searching aren't possible. Useful e.g. for JSON response format.
URL	optional	text or missing value	Optional path or URL of a web page, a PDF document or an image to send, a text prompt is required. NOTE: Web, Wikipedia and PubMed search isn't available.
CLASSES
The following classes respond to the get chat response for message command:
application				
SEE ALSO
display chat dialog	download image for prompt	get chat models for engine		
get concordance of
get concordance of (verb)Get list of words of a record. Supports both documents and groups/feeds. (from DEVONthink Suite)
FUNCTION SYNTAX
set theResult to get concordance of record content ¬
     sorted by concordance sorting
RESULT
list of text or missing valueThe words.
PARAMETERS
Parameter
Required
Type
Description
record	required	content	The record.
sorted by	optional	concordance sorting	Sorting of words (default is weight).
CLASSES
The following classes respond to the get concordance of command:
application				
get custom meta data
get custom meta data (verb)[synonyms: get custom metadata]Get user-defined metadata from a record. (from DEVONthink Suite)
FUNCTION SYNTAX
set theResult to get custom meta data default value rich text, text, number, integer, real, boolean, date or missing value ¬
     for text ¬
     from record
RESULT
date, rich text, text, number, integer, real, boolean or missing valueThe custom metadata value.
PARAMETERS
Parameter
Required
Type
Description
default value	optional	rich text, text, number, integer, real, boolean, date or missing value	Default value if user-defined metadata does not yet exist, otherwise a missing value is returned.
for	required	text	The key of the user-defined value.
from	required	record	The record.
CLASSES
The following classes respond to the get custom meta data command:
application				
SEE ALSO
add custom meta data				
get database with id
get database with id (verb)Get database with the specified id. (from DEVONthink Suite)
FUNCTION SYNTAX
set theResult to get database with id integer
RESULT
database or missing valueThe database with the specified id.
PARAMETERS
Parameter
Required
Type
Description
direct parameter	required	integer	The scripting identifier.
CLASSES
The following classes respond to the get database with id command:
application				
get database with uuid
get database with uuid (verb)Get database with the specified uuid. (from DEVONthink Suite)
FUNCTION SYNTAX
set theResult to get database with uuid text
RESULT
database or missing valueThe database with the specified UUID.
PARAMETERS
Parameter
Required
Type
Description
direct parameter	required	text	The unique identifier.
CLASSES
The following classes respond to the get database with uuid command:
application				
get embedded images of
get embedded images of (verb)Get the URLs of all embedded images of an HTML page. (from DEVONthink Suite)
FUNCTION SYNTAX
set theResult to get embedded images of text ¬
     base URL text or missing value ¬
     file type text or missing value
RESULT
list of text or missing valueThe URLs of the images.
PARAMETERS
Parameter
Required
Type
Description
direct parameter	required	text	The source code of the HTML page.
base URL	optional	text or missing value	The URL of the HTML page containing the images.
file type
[synonyms: type]	optional	text or missing value	The desired type of the images (e.g. JPG, GIF, PNG, ...).
CLASSES
The following classes respond to the get embedded images of command:
application				
get embedded objects of
get embedded objects of (verb)Get the URLs of all embedded objects of an HTML page. (from DEVONthink Suite)
FUNCTION SYNTAX
set theResult to get embedded objects of text ¬
     base URL text or missing value ¬
     file type text or missing value
RESULT
list of text or missing valueThe URLs of the objects.
PARAMETERS
Parameter
Required
Type
Description
direct parameter	required	text	The source code of the HTML page.
base URL	optional	text or missing value	The URL of the HTML page containing the embedded objects
file type
[synonyms: type]	optional	text or missing value	The desired type of the objects (e.g. MOV).
CLASSES
The following classes respond to the get embedded objects of command:
application				
get embedded sheets and scripts of
get embedded sheets and scripts of (verb)Get the URLs of all embedded style sheets and scripts of an HTML page. (from DEVONthink Suite)
FUNCTION SYNTAX
set theResult to get embedded sheets and scripts of text ¬
     base URL text or missing value ¬
     file type text or missing value
RESULT
list of text or missing valueThe URLs of the sheets and scripts.
PARAMETERS
Parameter
Required
Type
Description
direct parameter	required	text	The source code of the HTML page.
base URL	optional	text or missing value	The URL of the HTML page containing the style sheets and scripts.
file type
[synonyms: type]	optional	text or missing value	The desired type of the sheets/scripts (e.g. CSS).
CLASSES
The following classes respond to the get embedded sheets and scripts of command:
application				
get favicon of
get favicon of (verb)Get the favicon of an HTML page. (from DEVONthink Suite)
FUNCTION SYNTAX
set theResult to get favicon of text ¬
     base URL text or missing value
RESULT
text or missing valueThe URL of the favicon.
PARAMETERS
Parameter
Required
Type
Description
direct parameter	required	text	The source code of the HTML page.
base URL	optional	text or missing value	The URL of the HTML page containing the favicon.
CLASSES
The following classes respond to the get favicon of command:
application				
get feed items of
get feed items of (verb)Get the feed items of a RSS, RDF, JSON or Atom feed. (from DEVONthink Suite)
FUNCTION SYNTAX
set theResult to get feed items of text ¬
     base URL text or missing value
RESULT
list of feed item or missing valueThe items of the feed.
PARAMETERS
Parameter
Required
Type
Description
direct parameter	required	text	The source code of the feed.
base URL	optional	text or missing value	The URL of the feed.
CLASSES
The following classes respond to the get feed items of command:
application				
get frames of
get frames of (verb)Get the URLs of all frames of an HTML page. (from DEVONthink Suite)
FUNCTION SYNTAX
set theResult to get frames of text ¬
     base URL text or missing value
RESULT
list of text or missing valueThe URLs of the frames.
PARAMETERS
Parameter
Required
Type
Description
direct parameter	required	text	The source code of the HTML page.
base URL	optional	text or missing value	The URL of the HTML page containing the frames.
CLASSES
The following classes respond to the get frames of command:
application				
get items of feed
get items of feed (verb)Get the items of a RSS, RDF, JSON or Atom feed as dictionaries. 'get feed items of' is recommended for new scripts. (from DEVONthink Suite)
FUNCTION SYNTAX
set theResult to get items of feed text ¬
     base URL text or missing value
RESULT
list of dictionary or missing valueThe items of the feed.
PARAMETERS
Parameter
Required
Type
Description
direct parameter	required	text	The source code of the feed.
base URL	optional	text or missing value	The URL of the feed.
CLASSES
The following classes respond to the get items of feed command:
application				
SEE ALSO
get feed items of				
get links of
get links of (verb)Get the URLs of all links of an HTML page. (from DEVONthink Suite)
FUNCTION SYNTAX
set theResult to get links of text ¬
     base URL text or missing value ¬
     containing text or missing value ¬
     file type text or missing value
RESULT
list of text or missing valueThe URLs of the links.
PARAMETERS
Parameter
Required
Type
Description
direct parameter	required	text	The source code of the HTML page.
base URL	optional	text or missing value	The URL of the HTML page containing the links.
containing	optional	text or missing value	The case sensitive string matched against the description of links.
file type
[synonyms: type]	optional	text or missing value	The desired type of the links (e.g. HTML, PHP, JPG, ...).
CLASSES
The following classes respond to the get links of command:
application				
get metadata of
get metadata of (verb)Get the metadata of an HTML page or of a Markdown document. (from DEVONthink Suite)
FUNCTION SYNTAX
set theResult to get metadata of text ¬
     base URL text or missing value ¬
     markdown text or missing value
RESULT
dictionary or missing valueThe metadata.
PARAMETERS
Parameter
Required
Type
Description
direct parameter	optional	text	The source code of the HTML page.
base URL	optional	text or missing value	The URL of the HTML page.
markdown	optional	text or missing value	The source of the Markdown document.
CLASSES
The following classes respond to the get metadata of command:
application				
get record at
get record at (verb)Search for record at the specified location. (from DEVONthink Suite)
FUNCTION SYNTAX
set theResult to get record at text ¬
     in database, parent or missing value
RESULT
record or missing valueThe record at the specified location.
PARAMETERS
Parameter
Required
Type
Description
direct parameter	required	text	The location of the record as a POSIX path (/ in names has to be replaced with \/, see location property).
in	optional	database, parent or missing value	The base database or group. Uses current database if not specified.
CLASSES
The following classes respond to the get record at command:
application				
SEE ALSO
create location	exists record at			
get record with id
get record with id (verb)Get record with the specified id. (from DEVONthink Suite)
FUNCTION SYNTAX
set theResult to get record with id integer ¬
     in database or missing value
RESULT
record or missing valueThe record with the specified id.
PARAMETERS
Parameter
Required
Type
Description
direct parameter	required	integer	The scripting identifier.
in	optional	database or missing value	The database. Uses current database if not specified.
CLASSES
The following classes respond to the get record with id command:
application				
get record with uuid
get record with uuid (verb)Get record with the specified uuid or item link. (from DEVONthink Suite)
FUNCTION SYNTAX
set theResult to get record with uuid text ¬
     in database or missing value
RESULT
record or missing valueThe record with the specified UUID.
PARAMETERS
Parameter
Required
Type
Description
direct parameter	required	text	The unique identifier or item link.
in	optional	database or missing value	The database. Uses all databases if not specified.
CLASSES
The following classes respond to the get record with uuid command:
application				
get rich text of
get rich text of (verb)Get the rich text of an HTML page. (from DEVONthink Suite)
FUNCTION SYNTAX
set theResult to get rich text of text ¬
     base URL text or missing value
RESULT
rich text or missing valueThe HTML page converted to rich text.
PARAMETERS
Parameter
Required
Type
Description
direct parameter	required	text	The source code of the HTML page.
base URL	optional	text or missing value	The URL of the HTML page
CLASSES
The following classes respond to the get rich text of command:
application				
get text of
get text of (verb)Get the text of an HTML page. (from DEVONthink Suite)
FUNCTION SYNTAX
set theResult to get text of text
RESULT
text or missing valueThe plain text of the HTML page.
PARAMETERS
Parameter
Required
Type
Description
direct parameter	required	text	The source code of the HTML page.
CLASSES
The following classes respond to the get text of command:
application				
get title of
get title of (verb)Get the title of an HTML page. (from DEVONthink Suite)
FUNCTION SYNTAX
set theResult to get title of text
RESULT
text or missing valueThe title of the HTML page.
PARAMETERS
Parameter
Required
Type
Description
direct parameter	required	text	The source code of the HTML page.
CLASSES
The following classes respond to the get title of command:
application				
get versions of
get versions of (verb)Get saved versions of a record. (from DEVONthink Suite)
FUNCTION SYNTAX
set theResult to get versions of record record
RESULT
list of record or missing valueThe list of saved versions sorted by date (oldest one at beginning).
PARAMETERS
Parameter
Required
Type
Description
record	required	record	The record.
CLASSES
The following classes respond to the get versions of command:
application				
SEE ALSO
restore record with	save version of			
hide progress indicator
hide progress indicator (verb)Hide a visible progress indicator. (from DEVONthink Suite)
FUNCTION SYNTAX
set theResult to hide progress indicator
RESULT
booleanTrue if hiding was successful, false if not.
CLASSES
The following classes respond to the hide progress indicator command:
application				
SEE ALSO
show progress indicator	step progress indicator			
import attachments of
import attachments of (verb)Import attachments of an email. (from DEVONthink Suite)
FUNCTION SYNTAX
set theResult to import attachments of record record ¬
     to parent or missing value
RESULT
list of record or missing valueThe imported attachment records. The creation and modification date of the email is retained.
PARAMETERS
Parameter
Required
Type
Description
record	required	record	The record of an email.
to	optional	parent or missing value	The destination group. Uses incoming group or group selector if not specified.
CLASSES
The following classes respond to the import attachments of command:
application				
SEE ALSO
import path	import template			
import path
import path (verb)[synonyms: import]Import a file or folder (including its subfolders). (from DEVONthink Suite)
FUNCTION SYNTAX
set theResult to import path text ¬
     from text or missing value ¬
     name text or missing value ¬
     placeholders dictionary or missing value ¬
     to parent or missing value
RESULT
record or missing valueThe imported record.
PARAMETERS
Parameter
Required
Type
Description
direct parameter	required	text	The POSIX path or file URL of the file or folder.
from	optional	text or missing value	The name of the source application.
name	optional	text or missing value	The name for the imported record.
placeholders	optional	dictionary or missing value	Optional placeholders as key-value-pairs for text, RTF/RTFD & HTML/XML templates and filenames. NOTE: The standard placeholders of .dtTemplate packages are also supported if this parameter is specified.
to	optional	parent or missing value	The destination group. Uses incoming group or group selector if not specified.
CLASSES
The following classes respond to the import path command:
application				
SEE ALSO
import attachments of	import template	index path		
import template
import template (verb)Import a template. Template scripts are not supported and audit-proof databases do not support any templates at all. (from DEVONthink Suite)
FUNCTION SYNTAX
set theResult to import template text ¬
     to parent or missing value
RESULT
record or missing valueThe imported record.
PARAMETERS
Parameter
Required
Type
Description
direct parameter	required	text	The POSIX path or file URL of the template.
to	optional	parent or missing value	The destination group. Uses incoming group or group selector if not specified.
CLASSES
The following classes respond to the import template command:
application				
SEE ALSO
import attachments of	import path			
index path
index path (verb)[synonyms: indicate]Index a file or folder (including its subfolders). Not supported by audit-proof databases. (from DEVONthink Suite)
FUNCTION SYNTAX
set theResult to index path text ¬
     to parent or missing value
RESULT
record or missing valueThe indexed record.
PARAMETERS
Parameter
Required
Type
Description
direct parameter	required	text	The POSIX path or file URL of the file or folder.
to	optional	parent or missing value	The destination group. Uses incoming group or group selector if not specified.
CLASSES
The following classes respond to the index path command:
application				
SEE ALSO
import path				
load workspace
load workspace (verb)Load a workspace. (from DEVONthink Suite)
FUNCTION SYNTAX
set theResult to load workspace text
RESULT
booleanTrue if loading was successful, false if not.
PARAMETERS
Parameter
Required
Type
Description
direct parameter	required	text	The name of the workspace.
CLASSES
The following classes respond to the load workspace command:
application				
SEE ALSO
delete workspace	save workspace			
log message
log message (verb)Log info for a record, file or action to the Window > Log panel (from DEVONthink Suite)
FUNCTION SYNTAX
set theResult to log message text or missing value ¬
     record record or missing value ¬
     info text or missing value
RESULT
booleanTrue if logging was successful, false if not.
PARAMETERS
Parameter
Required
Type
Description
direct parameter	optional	text or missing value	The optional POSIX path or action.
info	optional	text or missing value	Additional information.
record	optional	record or missing value	The record. Requires either the direct or the 'info' parameter.
CLASSES
The following classes respond to the log message command:
application				
lookup records with comment
lookup records with comment (verb)Lookup records with specified comment. (from DEVONthink Suite)
FUNCTION SYNTAX
set theResult to lookup records with comment text ¬
     in database or missing value
RESULT
list of record or missing valueThe records with the specified comment.
PARAMETERS
Parameter
Required
Type
Description
direct parameter	required	text	The comment.
in	optional	database or missing value	The database. Uses current database if not specified
CLASSES
The following classes respond to the lookup records with comment command:
application				
SEE ALSO
exists record with comment				
lookup records with content hash
lookup records with content hash (verb)Lookup records with specified content hash. (from DEVONthink Suite)
FUNCTION SYNTAX
set theResult to lookup records with content hash text ¬
     in database or missing value
RESULT
list of record or missing valueThe records with the specified content hash.
PARAMETERS
Parameter
Required
Type
Description
direct parameter	required	text	The content hash.
in	optional	database or missing value	The database. Uses current database if not specified
CLASSES
The following classes respond to the lookup records with content hash command:
application				
SEE ALSO
exists record with content hash				
lookup records with file
lookup records with file (verb)Lookup records whose last path component is the specified file. (from DEVONthink Suite)
FUNCTION SYNTAX
set theResult to lookup records with file text ¬
     in database or missing value
RESULT
list of content or missing valueThe records with the specified file.
PARAMETERS
Parameter
Required
Type
Description
direct parameter	required	text	The filename.
in	optional	database or missing value	The database. Uses current database if not specified
CLASSES
The following classes respond to the lookup records with file command:
application				
SEE ALSO
exists record with file				
lookup records with path
lookup records with path (verb)Lookup records with specified path. (from DEVONthink Suite)
FUNCTION SYNTAX
set theResult to lookup records with path text ¬
     in database or missing value
RESULT
list of record or missing valueThe records with the specified path.
PARAMETERS
Parameter
Required
Type
Description
direct parameter	required	text	The path.
in	optional	database or missing value	The database. Uses current database if not specified.
CLASSES
The following classes respond to the lookup records with path command:
application				
SEE ALSO
exists record with path				
lookup records with tags
lookup records with tags (verb)Lookup records with all or any of the specified tags. (from DEVONthink Suite)
FUNCTION SYNTAX
set theResult to lookup records with tags list of text ¬
     any boolean ¬
     in database or missing value
RESULT
list of record or missing valueThe found records.
PARAMETERS
Parameter
Required
Type
Description
direct parameter	required	list of text	The tags.
any	optional	boolean	Lookup any or all (default) tags.
in	optional	database or missing value	The database. Uses current database if not specified.
CLASSES
The following classes respond to the lookup records with tags command:
application				
lookup records with URL
lookup records with URL (verb)Lookup records with specified URL. (from DEVONthink Suite)
FUNCTION SYNTAX
set theResult to lookup records with URL text ¬
     in database or missing value
RESULT
list of record or missing valueThe records with the specified URL.
PARAMETERS
Parameter
Required
Type
Description
direct parameter	required	text	The URL (or path).
in	optional	database or missing value	The database. Uses current database if not specified.
CLASSES
The following classes respond to the lookup records with URL command:
application				
SEE ALSO
exists record with URL				
merge
merge (verb)Merge either a list of records as an RTF(D)/a PDF document or merge a list of not indexed groups/tags. (from DEVONthink Suite)
DESCRIPTION
AppleScript:

tell application id "DNtp"
	merge records selected records in current group
end tell
			
JavaScript:

(() => {
	const theApp = Application("DEVONthink");
	theApp.merge({records:theApp.selectedRecords(),group:theApp.currentGroup()});
})();
			
FUNCTION SYNTAX
set theResult to merge in parent or missing value ¬
     records list of record
RESULT
record or missing valueThe merged record.
PARAMETERS
Parameter
Required
Type
Description
in	optional	parent or missing value	The destination group for the merged record. The root of the database is used if not specified.
records	required	list of record	The records to merge.
CLASSES
The following classes respond to the merge command:
application				
move
move (verb)Move all instances of a record to a different group. Specify the 'from' group to move a single instance to a different group. (from DEVONthink Suite)
FUNCTION SYNTAX
set theResult to move record record or list of record ¬
     from parent or missing value ¬
     to parent
RESULT
record, list of record or missing valueThe moved record(s).
PARAMETERS
Parameter
Required
Type
Description
from	optional	parent or missing value	The source group. Only applicable if record and destination group are in the same database
record	required	record or list of record	The record(s) to move. Indexed items are not supported by audit-proof databases.
to	required	parent	The destination group which doesn't have to be in the same database.
CLASSES
The following classes respond to the move command:
application				
SEE ALSO
duplicate	replicate			
move into database
move into database (verb)[synonyms: consolidate]Move an external/indexed record (and its children) into the database. Not supported by audit-proof databases. (from DEVONthink Suite)
FUNCTION SYNTAX
set theResult to move into database record record
RESULT
booleanTrue if moving was successful, false if not.
PARAMETERS
Parameter
Required
Type
Description
record	required	record	The record to move.
CLASSES
The following classes respond to the move into database command:
application				
SEE ALSO
move to external folder				
move to external folder
move to external folder (verb)[synonyms: deconsolidate]Move an internal/imported record (and its children) to the enclosing external folder in the filesystem. Creation/Modification dates, Spotlight comments and OpenMeta tags are immediately updated. Not supported by audit-proof databases. (from DEVONthink Suite)
FUNCTION SYNTAX
set theResult to move to external folder record record ¬
     to text or missing value
RESULT
booleanTrue if moving was successful, false if not.
PARAMETERS
Parameter
Required
Type
Description
record	required	record	The record to move.
to	optional	text or missing value	The POSIX path or file URL of the destination folder. Only supported by documents.
CLASSES
The following classes respond to the move to external folder command:
application				
SEE ALSO
move into database				
open database
open database (verb)Open an existing database. (from DEVONthink Suite)
FUNCTION SYNTAX
set theResult to open database text
RESULT
database or missing valueThe opened database.
PARAMETERS
Parameter
Required
Type
Description
direct parameter	required	text	POSIX file path of database.
CLASSES
The following classes respond to the open database command:
application				
SEE ALSO
close				
open tab for
open tab for (verb)Open a new tab for the specified URL or record in a think window. (from DEVONthink Suite)
FUNCTION SYNTAX
set theResult to open tab for record record or missing value ¬
     URL text or missing value ¬
     referrer text or missing value ¬
     in think window or missing value
RESULT
tab or missing valueThe opened tab.
PARAMETERS
Parameter
Required
Type
Description
in	optional	think window or missing value	The optional think window that should open a new tab. A new window is used otherwise.
record	optional	record or missing value	The record to open.
referrer	optional	text or missing value	The HTTP referrer.
URL	optional	text or missing value	The URL to open.
CLASSES
The following classes respond to the open tab for command:
application				
SEE ALSO
close	open window for			
open window for
open window for (verb)Open a (new) viewer or document window for the specified record. Only recommended for main windows, use 'open tab for' for document windows. (from DEVONthink Suite)
FUNCTION SYNTAX
set theResult to open window for record record ¬
     enforcement boolean
RESULT
think window or missing valueThe opened window.
PARAMETERS
Parameter
Required
Type
Description
enforcement
[synonyms: force]	optional	boolean	Enforce DEVONthink to always open a new window, even if the record is already opened in one. Off by default.
record	required	record	The record to open.
CLASSES
The following classes respond to the open window for command:
application				
SEE ALSO
close	open tab for			
optimize
optimize (verb)Backup & optimize a database. (from DEVONthink Suite)
FUNCTION SYNTAX
set theResult to optimize database database
RESULT
booleanTrue if optimizing was successful, false if not.
PARAMETERS
Parameter
Required
Type
Description
database	required	database	The database to optimize.
CLASSES
The following classes respond to the optimize command:
application				
SEE ALSO
check file integrity of	verify			
paste clipboard
paste clipboard (verb)Create a new record with the contents of the clipboard. (from DEVONthink Suite)
FUNCTION SYNTAX
set theResult to paste clipboard to parent or missing value
RESULT
record or missing valueThe pasted record.
PARAMETERS
Parameter
Required
Type
Description
to	optional	parent or missing value	The destination group for the new record. Uses incoming group or group selector if not specified.
CLASSES
The following classes respond to the paste clipboard command:
application				
perform smart rule
perform smart rule (verb)Perform one or all smart rules. (from DEVONthink Suite)
FUNCTION SYNTAX
set theResult to perform smart rule name text or missing value ¬
     record record or missing value ¬
     trigger rule event
RESULT
booleanTrue if performing was successful, false if not.
PARAMETERS
Parameter
Required
Type
Description
name	optional	text or missing value	The name of the smart rule. All smart rules are used if not specified.
record	optional	record or missing value	The record. All records matching the smart rule(s) conditions are used if no record is specified.
trigger	optional	rule event	The optional event to trigger smart rules.
CLASSES
The following classes respond to the perform smart rule command:
application				
refresh
refresh (verb)Refresh a record. Currently only supported by feeds but not by audit-proof databases. (from DEVONthink Suite)
FUNCTION SYNTAX
set theResult to refresh record record
RESULT
booleanTrue if refreshing was successful, false if not.
PARAMETERS
Parameter
Required
Type
Description
record	required	record	The record to refresh.
CLASSES
The following classes respond to the refresh command:
application				
replicate
replicate (verb)Replicate a record. (from DEVONthink Suite)
FUNCTION SYNTAX
set theResult to replicate record record or list of record ¬
     to parent
RESULT
record, list of record or missing valueThe replicated record(s).
PARAMETERS
Parameter
Required
Type
Description
record	required	record or list of record	The record(s) to replicate.
to	required	parent	The destination group which must be in the same database.
CLASSES
The following classes respond to the replicate command:
application				
SEE ALSO
duplicate	move			
restore record with
restore record with (verb)Restore saved version of a record. (from DEVONthink Suite)
FUNCTION SYNTAX
set theResult to restore record with version record
RESULT
booleanTrue if restoring was successful, false otherwise.
PARAMETERS
Parameter
Required
Type
Description
version	required	record	The saved version. The record of the version is automatically retrieved.
CLASSES
The following classes respond to the restore record with command:
application				
SEE ALSO
get versions of	save version of			
save version of
save version of (verb)Save version of current record. NOTE: Use this command right before editing the contents, not afterwards, as duplicates are automatically removed. (from DEVONthink Suite)
DESCRIPTION
AppleScript:

tell application id "DNtp"
	set theRecord to create record with {name:"Test", type:txt, content:"Content"} in (current group)
	save version of record theRecord
	set plain text of theRecord to "Modified"
	return get versions of record theRecord
end tell
			
JavaScript:

(() => {
	const theApp = Application("DEVONthink");
	let theRecord = theApp.createRecordWith({name:"Test", 'type':"txt", 'content':"Content"},{in:theApp.currentGroup()});
	theApp.saveVersionOf({'record':theRecord});
	theRecord.plainText = "Modified";
	return theApp.getVersionsOf({'record':theRecord});
})();
			
FUNCTION SYNTAX
set theResult to save version of record record
RESULT
record or missing valueThe saved version.
PARAMETERS
Parameter
Required
Type
Description
record	required	record	The record.
CLASSES
The following classes respond to the save version of command:
application				
SEE ALSO
delete	get versions of	restore record with		
save workspace
save workspace (verb)Save a workspace. (from DEVONthink Suite)
FUNCTION SYNTAX
set theResult to save workspace text
RESULT
booleanTrue if saving was successful, false if not.
PARAMETERS
Parameter
Required
Type
Description
direct parameter	required	text	The name of the workspace.
CLASSES
The following classes respond to the save workspace command:
application				
SEE ALSO
delete workspace	load workspace			
search
search (verb)Search for records in specified group or all databases. (from DEVONthink Suite)
FUNCTION SYNTAX
set theResult to search text or missing value ¬
     comparison search comparison ¬
     exclude subgroups boolean ¬
     in parent or missing value
RESULT
list of record or missing valueThe found records.
PARAMETERS
Parameter
Required
Type
Description
direct parameter	optional	text or missing value	The search string. Supports keys, operators and wildcards.
comparison	optional	search comparison	The comparison to use (default no case).
exclude subgroups	optional	boolean	Don't search in subgroups of the specified group. Off by default.
in	optional	parent or missing value	The group to search in. Searches in all databases if not specified.
CLASSES
The following classes respond to the search command:
application				
SEE ALSO
show search				
set cell at
set cell at (verb)Set cell at specified position of current sheet. (from DEVONthink Suite)
DESCRIPTION
AppleScript:

tell application id "DNtp"
	tell current tab of think window 1
		set cell at column 1 row 1 to "1"
	end tell
end tell
			
JavaScript:

(() => {
	const theApp = Application("DEVONthink");
	const theWindow = theApp.thinkWindows()[0];
	let theValue = theApp.setCellAt(theWindow,{column:1,row:1,to:"1"});
})();
			
FUNCTION SYNTAX
set theResult to set cell at reference ¬
     column integer or text ¬
     row integer ¬
     to text
RESULT
booleanTrue if setting was successful, false if not.
PARAMETERS
Parameter
Required
Type
Description
direct parameter	required	reference	The tab or window.
column	required	integer or text	Either the index (1...n) or the name of the column of the cell.
row	required	integer	The row (1...n) of the cell.
to	required	text	The content of the cell.
CLASSES
The following classes respond to the set cell at command:
think window	document window	main window	tab	
SEE ALSO
get cell at				
show progress indicator
show progress indicator (verb)Show a progress indicator or update an already visible indicator. You have to ensure that the indicator is hidden again via 'hide progress indicator' when the script ends or if an error occurs. (from DEVONthink Suite)
FUNCTION SYNTAX
set theResult to show progress indicator text ¬
     cancel button boolean ¬
     steps number
RESULT
booleanTrue if showing was successful, false if not.
PARAMETERS
Parameter
Required
Type
Description
direct parameter	required	text	The title of the progress.
cancel button	optional	boolean	Display a button to cancel the process.
steps	optional	number	The number of steps of the progress or a negative value for an indeterminate number.
CLASSES
The following classes respond to the show progress indicator command:
application				
SEE ALSO
hide progress indicator	step progress indicator			
show search
show search (verb)Perform search in frontmost main window. Opens a new main window if there's none. (from DEVONthink Suite)
FUNCTION SYNTAX
set theResult to show search text or missing value
RESULT
booleanTrue if the search was performed, false if not.
PARAMETERS
Parameter
Required
Type
Description
direct parameter	optional	text or missing value	The search string. Supports keys, operators and wildcards.
CLASSES
The following classes respond to the show search command:
application				
SEE ALSO
search				
start downloads
start downloads (verb)Start queue of download manager. (from DEVONthink Suite)
FUNCTION SYNTAX
set theResult to start downloads
RESULT
booleanTrue if starting was successful, false if not.
CLASSES
The following classes respond to the start downloads command:
application				
step progress indicator
step progress indicator (verb)Go to next step of a progress. (from DEVONthink Suite)
FUNCTION SYNTAX
set theResult to step progress indicator text or missing value
RESULT
booleanTrue if stepping was successful, false if not.
PARAMETERS
Parameter
Required
Type
Description
direct parameter	optional	text or missing value	The info for the current step.
CLASSES
The following classes respond to the step progress indicator command:
application				
SEE ALSO
hide progress indicator	show progress indicator			
stop downloads
stop downloads (verb)Stop queue of download manager. (from DEVONthink Suite)
FUNCTION SYNTAX
set theResult to stop downloads
RESULT
booleanTrue if stopping was successful, false if not.
CLASSES
The following classes respond to the stop downloads command:
application				
summarize annotations of
summarize annotations of (verb)[synonyms: summarize highlights of]Summarize highlights & annotations of records. PDF, RTF(D), Markdown and web documents are currently supported. (from DEVONthink Suite)
FUNCTION SYNTAX
set theResult to summarize annotations of in parent or missing value ¬
     records list of content ¬
     to summary type
RESULT
content or missing valueThe created record.
PARAMETERS
Parameter
Required
Type
Description
in	optional	parent or missing value	The destination group for the summary. The current group of the database is used if not specified.
records	required	list of content	The records to summarize.
to	required	summary type	The desired format. Only 'markdown', 'rich' and 'sheet' are currently supported.
CLASSES
The following classes respond to the summarize annotations of command:
application				
SEE ALSO
summarize contents of	summarize mentions of	summarize text		
summarize contents of
summarize contents of (verb)Summarize content of records. (from DEVONthink Suite)
FUNCTION SYNTAX
set theResult to summarize contents of in parent or missing value ¬
     records list of content ¬
     to summary type ¬
     as summary style
RESULT
content or missing valueThe created record.
PARAMETERS
Parameter
Required
Type
Description
as	optional	summary style	The desired summary style. If no value is specified the settings default is used.
in	optional	parent or missing value	The destination group for the summary. The current group of the database is used if not specified.
records	required	list of content	The records to summarize.
to	required	summary type	The desired format. Only 'markdown', 'simple' and 'rich' are currently supported.
CLASSES
The following classes respond to the summarize contents of command:
application				
SEE ALSO
summarize annotations of	summarize mentions of	summarize text		
summarize mentions of
summarize mentions of (verb)Summarize mentions of records. (from DEVONthink Suite)
FUNCTION SYNTAX
set theResult to summarize mentions of in parent or missing value ¬
     records list of content ¬
     to summary type
RESULT
content or missing valueThe created record.
PARAMETERS
Parameter
Required
Type
Description
in	optional	parent or missing value	The destination group for the summary. The current group of the database is used if not specified.
records	required	list of content	The records to summarize.
to	required	summary type	The desired format. Only 'markdown' and 'rich' are currently supported.
CLASSES
The following classes respond to the summarize mentions of command:
application				
SEE ALSO
summarize annotations of	summarize contents of	summarize text		
summarize text
summarize text (verb)Summarizes text. (from DEVONthink Suite)
FUNCTION SYNTAX
set theResult to summarize text text ¬
     as summary style
RESULT
text or missing valueThe summarized text.
PARAMETERS
Parameter
Required
Type
Description
direct parameter	required	text	The text to summarize.
as	optional	summary style	The desired summary style. If no value is specified the settings default is used.
CLASSES
The following classes respond to the summarize text command:
application				
SEE ALSO
summarize annotations of	summarize contents of	summarize mentions of		
synchronize
synchronize (verb)Synchronizes records with the filesystem or databases with their sync locations. Only one of both operations is supported. (from DEVONthink Suite)
FUNCTION SYNTAX
set theResult to synchronize record record or missing value ¬
     database database or missing value
RESULT
booleanTrue if synchronizing was successful, false if not.
PARAMETERS
Parameter
Required
Type
Description
database	optional	database or missing value	The database to synchronize via its sync locations.
record	optional	record or missing value	The (external) record to update. New items are added, updated ones indexed and obsolete ones removed. NOTE: This is rarely necessary as databases are usually automatically updated by filesystem events. In addition, audit-proof databases do not support this.
CLASSES
The following classes respond to the synchronize command:
application				
transcribe
transcribe (verb)Transcribes speech, text or notes of a record. (from DEVONthink Suite)
FUNCTION SYNTAX
set theResult to transcribe record content ¬
     language text ¬
     timestamps boolean
RESULT
text or missing valueThe transcribed text if successful.
PARAMETERS
Parameter
Required
Type
Description
language	optional	text	ISO language code, e.g. 'en' or 'de'. If no value is specified the settings default is used.
record	required	content	An audio record, a video record containing an audio track, a PDF document or an image.
timestamps	optional	boolean	Transcription should include timestamps or not. If no value is specified the settings default is used.
CLASSES
The following classes respond to the transcribe command:
application				
update
update (verb)Update text of a plain/rich text, Markdown document, formatted note or HTML page. Not supported by audit-proof databases. (from DEVONthink Suite)
DESCRIPTION
Conversions:

Plain text: Both plain text and rich text is accepted and inserted, appended or replacing without any conversions.
Rich text: Plain text, rich text and Markdown & HTML source is accepted and either appended to the document, inserted after the metadata or replacing the document.
Markdown documents: Markdown source or rich text is accepted and either appended to the document, inserted after the metadata or replacing the document.
HTML pages & formatted notes: HTML source, Markdown source or rich text is accepted which is either inserted into/appended to the body or replacing the inner body of the document.
AppleScript:

tell application id "DNtp"
	set theMergedNote to missing value
	repeat with theRecord in selected records
		if theMergedNote is missing value then
			set theMergedNote to convert record theRecord to note
		else if (record type of theRecord is in {RTF, RTFD}) then
			update record theMergedNote with text (rich text of theRecord) mode appending
		else
			update record theMergedNote with text (source of theRecord) mode appending
		end if
	end repeat
end tell
JavaScript:

(() => {
	const theApp = Application("DEVONthink");
	let theRecords = theApp.selectedRecords(), theMergedNote = null;
	theRecords.forEach (r => {
		if (theMergedNote==null)
			theMergedNote = theApp.convert({record:r,to:"note"});
		else
			theApp.update({record:theMergedNote, withText:r.source(), mode:"appending"});
	})
})();
FUNCTION SYNTAX
set theResult to update record record ¬
     with text text or rich text ¬
     mode update mode ¬
     URL text or missing value
RESULT
booleanTrue if updating was successful, false if not.
PARAMETERS
Parameter
Required
Type
Description
mode	required	update mode	The desired mode.
record	required	record	The record to update.
URL	optional	text or missing value	The URL of the text.
with text	required	text or rich text	The text which should be updated/set, inserted or appended.
CLASSES
The following classes respond to the update command:
application				
update thumbnail
update thumbnail (verb)Update existing thumbnail of a record. Thumbnailing is performed asynchronously in the background. (from DEVONthink Suite)
FUNCTION SYNTAX
set theResult to update thumbnail of record
RESULT
booleanTrue if updating was successful, false if not.
PARAMETERS
Parameter
Required
Type
Description
of	required	record	The record.
CLASSES
The following classes respond to the update thumbnail command:
application				
SEE ALSO
create thumbnail	delete thumbnail			
verify
verify (verb)Verify a database. (from DEVONthink Suite)
FUNCTION SYNTAX
set theResult to verify database database
RESULT
integerTotal number of errors, invalid filenames and missing files.
PARAMETERS
Parameter
Required
Type
Description
database	required	database	The database to verify.
CLASSES
The following classes respond to the verify command:
application				
SEE ALSO
check file integrity of	optimize			
CLASSES
child
child (noun), pl childrenA child record of a group.
PROPERTIES
Property
Access
Type
Description
addition date	get	date or missing value	Date when the record was added to the database.
record
aliases	get/set	text or missing value	Wiki aliases (separated by commas or semicolons) of a record.
record
all document dates	get	list of date or missing value	All dates extracted from text of document, e.g. a scan.
record
altitude	get/set	real	The altitude in metres of a record.
record
annotation	get/set	content or missing value	Annotation of a record. Only plain & rich text and Markdown documents are supported. Read-only in case of audit-proof databases.
record
annotation count	get	integer	The number of annotations. Supported by HTML pages, formatted notes, web archives, PDF, rich text & Markdown documents.
record
attached script	get/set	text or missing value	POSIX path of script attached to a record.
record
attachment count	get	integer	The number of attachments. Currently only supported for RTFD documents and emails.
record
attributes change date	get/set	date or missing value	The change date of the record's attributes.
record
bates number	get/set	integer	Bates number.
record
cells	get/set	list of array	The cells of a sheet. This is a list of rows, each row contains a list of string values for the various colums. Read-only in case of audit-proof databases.
record
character count	get	integer	The character count of a record.
record
color	get/set	RGB color or missing value	The color of a record. Currently only supported by tags & groups.
record
columns	get	list of text or missing value	The column names of a sheet.
record
comment	get/set	text or missing value	The comment of a record.
record
content hash	get	text or missing value	Stored SHA1 hash of files and document packages.
record
creation date	get/set	date or missing value	The creation date of a record. Read-only in case of audit-proof databases.
record
custom meta data
[synonyms: custom metadata]	get/set	dictionary or missing value	User-defined metadata of a record as a dictionary containing key-value pairs. Setting a value for an unknown key automatically adds a definition to Settings > Data.
record
data	get/set	raw data or missing value	The file data of a record. Currently only supported by PDF documents, images, rich text documents and web archives. Read-only in case of audit-proof databases.
record
database	get	database or missing value	The database of the record.
record
date	get/set	date or missing value	The (creation/modification) date of a record. Read-only in case of audit-proof databases.
record
digital object identifier	get	text or missing value	Digital object identifier (DOI) extracted from text of document, e.g. a scanned receipt, or from the title.
record
dimensions	get	list of integer	The width and height of an image or PDF document in pixels or points.
record
document amount	get	text or missing value	Amount extracted from text of document, e.g. a scanned receipt.
record
document date	get	date or missing value	First date extracted from text of document, e.g. a scan.
record
document name	get	text or missing value	Name based on text or properties of document
record
dpi	get	number	The resultion of an image in dpi.
record
duplicates	get	list of record or missing value	The duplicates of a record (only other instances, not including the record).
record
duration	get	real	The duration of audio and video files.
record
encrypted	get	boolean	Specifies if a document is encrypted or not. Currently only supported by PDF documents.
record
exclude from chat	get/set	boolean	Exclude group or record from chat.
record
exclude from classification	get/set	boolean	Exclude group or record from classifying.
record
exclude from search	get/set	boolean	Exclude group or record from searching.
record
exclude from see also	get/set	boolean	Exclude record from see also.
record
exclude from tagging	get/set	boolean	Exclude group from tagging.
record
exclude from Wiki linking	get/set	boolean	Exclude record from automatic Wiki linking.
record
filename	get	text or missing value	The current filename of a record.
record
flag
[synonyms: flagged, state]	get/set	boolean	The flag of a record.
record
geolocation	get/set	text or missing value	The human readable geogr. location of a record.
record
height	get	number	The height of an image or PDF document in pixels or points.
record
id	get	integer	The scripting identifier of a record. Optimizing or closing a database might modify this identifier.
record
image	get/set	any or missing value	The image or PDF document of a record. Setting supports both raw data and strings containing paths or URLs. Read-only in case of audit-proof databases.
record
indexed	get	boolean	Indexed or imported record.
record
international standard book number	get	text or missing value	International standard book number (ISBN) extracted from text of document, e.g. a scanned receipt, or from the title.
record
interval	get/set	real	Refresh interval of a feed. Currently overriden by settings.
record
kind	get	text or missing value	The human readable and localized kind of a record. WARNING: Don't use this to check the type of a record, otherwise your script might fail depending on the version and the localization.
record
label	get/set	integer	Index of label (0-7) of a record.
record
latitude	get/set	real	The latitude in degrees of a record.
record
location	get	text or missing value	The primary location of the record in the database as a POSIX path (/ in names is replaced with \/).
record
location group	get	parent or missing value	The group of the record's primary location. This is identical to the first parent group.
record
location with name	get	text or missing value	The full primary location of the record including its name (/ in names is replaced with \/).
record
locking
[synonyms: locked]	get/set	boolean	The locking of a record. Read-only in case of audit-proof databases.
record
longitude	get/set	real	The longitude in degrees of a record.
record
meta data
[synonyms: metadata]	get	dictionary or missing value	Document metadata (e.g. of PDF & RTF documents, web pages or emails) of a record as a dictionary containing key-value pairs.
Keys:

kMDItemTitle (string) : Title of document.
kMDItemHeadline (string) : Headline of document.
kMDItemSubject (string) : Subject of document, e.g. an email.
kMDItemDescription (string) : Description of document, e.g. a web page.
kMDItemCopyright (string) : Copyright of document, e.g. a web page.
kMDItemComment (string) : Comment of document, e.g. a rich text.
kMDItemURL (string) : URL of document.
kMDItemCreator (string) : Creator of document, e.g. a PDF.
kMDItemProducer (string) : Producer of document, e.g. a PDF.
kMDItemComposer (string) : Composer of document, e.g. an MP file3.
kMDItemAlbum (string) : Album of document, e.g. an MP file3.
kMDItemKeywords (comma-separated string) : Keywords of document.
kMDItemOrganizations (comma-separated string) : Organizations of document.
kMDItemContributors (comma-separated string) : Contributors of document.
kMDItemEditors (comma-separated string) : Editors of documen.
kMDItemPublishers (comma-separated string) : Publishers of document.
kMDItemAuthors (comma-separated string) : Authors of document, e.g. sender of an email.
kMDItemAuthorEmailAddresses (comma-separated string) : Email addresses of authors of document, e.g. sender of an email.
kMDItemRecipients (comma-separated string) : Recipients of document, e.g. an email.
kMDItemRecipientEmailAddresses (comma-separated string) : Email addresses of recipients of document, e.g. an email.
kMDItemEmailAddresses (comma-separated string) : Email addresses of document.

record
MIME type	get	text or missing value	The (proposed) MIME type of a record.
record
modification date	get/set	date or missing value	The modification date of a record. Read-only in case of audit-proof databases.
record
name	get/set	text	The name of a record.
record
name without date	get	text or missing value	The name of a record without any dates.
record
name without extension	get	text or missing value	The name of a record without a file extension (independent of settings).
record
newest document date	get	date or missing value	Newest date extracted from text of document, e.g. a scan.
record
number of duplicates	get	integer	The number of duplicates of a record.
record
number of hits	get/set	integer	The number of hits of a record.
record
number of replicants	get	integer	The number of replicants of a record.
record
oldest document date	get	date or missing value	Oldest date extracted from text of document, e.g. a scan.
record
opening date	get	date or missing value	Date when a content was opened the last time or when a feed was refreshed the last time.
record
original name	get	text	The original name of a record.
record
page count	get	integer	The page count of a record. Currently only supported by PDF documents.
record
paginated PDF	get	raw data or missing value	A printed/converted PDF of the record.
record
path	get/set	text or missing value	The POSIX file path of a record. Only the path of external records can be changed. Not accessible at all in case of audit-proof databases.
record
pending	get	boolean	Flag whether the (latest) contents of a record haven't been downloaded from a sync location yet.
record
plain text	get/set	text or missing value	The plain text of a record. Read-only in case of audit-proof databases.
record
proposed filename	get	text or missing value	The proposed filename for a record.
record
rating	get/set	integer	Rating (0-5) of a record.
record
record type
[synonyms: type]	get	data type	The type of a record. WARNING: Don't use string conversions of this type for comparisons, this might fail due to known scripting issues of macOS.
record
reference URL	get	text or missing value	The URL (x-devonthink-item://...) to reference/link back to a record.
Optional parameters:

app: Used in conjunction with the openexternally parameter, specify the name of the app to open the referenced file with, e.g., x-devonthink-item://UUID?openexternally=1&app=Preview.
length: Specify the number of characters from the start parameter. Used in selection links.
line: Directly jumps to the specified paragraph/line in a plain/rich text or Markdown document. Usage: line=<integer>.
openexternally: Opens the referenced item in the system default application, e.g., opening a PDF in Preview. Used with a value of 1, e.g., openexternally=1.
page:  Opens a PDF to the specified page. Usage: page=<integer>.
reveal:  Reveals an item in the item list instead of opening it in a new window. Usage: reveal=1.
row: Directly jumps to the specified row in a sheet. Usage: row=<integer>.
search:  Directly jumps to the first occurrence of the search string in the specified document. Usage: search=<string>.
section:  Directly jumps to the specified section in a Markdown document. Usage: section=<string>.
start:  Specify the starting character on the current page. Used in selection links.
time:  Directly jumps to the specified time in seconds in a video or audio document. Usage: time=<float>.

record
reminder	get/set	reminder or missing value	Reminder of a record.
record
rich text
[synonyms: text]	get/set	rich text or missing value	The rich text of the record (see extended text suite). Changes are only supported in case of RTF/RTFD documents and not by audit-proof databases.
record
score	get	real	The score of the last comparison, classification or search (value between 0.0 and 1.0) or undefined otherwise.
record
size	get	integer	The size of a record in bytes.
record
source	get/set	text or missing value	The HTML/XML source of a record if available or the record converted to HTML if possible. Read-only in case of audit-proof databases.
record
tag type	get	tag type	The tag type of a record.
record
tags	get/set	array or missing value	The tags of a record. Setting accepts both strings and parents.
record
thumbnail	get/set	any or missing value	The thumbnail of a record. Setting supports both raw data and strings containing paths or URLs.
record
unread	get/set	boolean	The unread flag of a record.
record
URL	get/set	text or missing value	The URL of a record. Read-only in case of bookmarks in audit-proof databases.
record
uuid	get	text or missing value	The unique and persistent identifier of a record.
record
web archive	get	raw data or missing value	The web archive of a record if available or the record converted to web archive if possible.
record
width	get	number	The width of an image or PDF document in pixels or points.
record
word count	get	integer	The word count of a record.
record
ELEMENTS
Element
Access
Key Forms
Description
child	get/ make/ delete	by name
by index
by range
by whose/where
by unique ID

record
incoming reference	get/ make/ delete	by name
by index
by range
by whose/where
by unique ID

record
incoming Wiki reference	get/ make/ delete	by name
by index
by range
by whose/where
by unique ID

record
outgoing reference	get/ make/ delete	by name
by index
by range
by whose/where
by unique ID

record
outgoing Wiki reference	get/ make/ delete	by name
by index
by range
by whose/where
by unique ID

record
parent	get/ make/ delete	by name
by index
by range
by whose/where
by unique ID

record
SUPERCLASS
The child class inherits elements and properties from record.
WHERE USED
The child class is used in the following ways:
element of child class
element of content class
element of incoming reference class
element of incoming Wiki reference class
element of outgoing reference class
element of outgoing Wiki reference class
element of parent class
element of record class
element of selected record class
element of smart parent class
element of tag group class
content
content (noun), pl contents[synonyms: database content, database document, document]A content record of a database.
PROPERTIES
Property
Access
Type
Description
addition date	get	date or missing value	Date when the record was added to the database.
record
aliases	get/set	text or missing value	Wiki aliases (separated by commas or semicolons) of a record.
record
all document dates	get	list of date or missing value	All dates extracted from text of document, e.g. a scan.
record
altitude	get/set	real	The altitude in metres of a record.
record
annotation	get/set	content or missing value	Annotation of a record. Only plain & rich text and Markdown documents are supported. Read-only in case of audit-proof databases.
record
annotation count	get	integer	The number of annotations. Supported by HTML pages, formatted notes, web archives, PDF, rich text & Markdown documents.
record
attached script	get/set	text or missing value	POSIX path of script attached to a record.
record
attachment count	get	integer	The number of attachments. Currently only supported for RTFD documents and emails.
record
attributes change date	get/set	date or missing value	The change date of the record's attributes.
record
bates number	get/set	integer	Bates number.
record
cells	get/set	list of array	The cells of a sheet. This is a list of rows, each row contains a list of string values for the various colums. Read-only in case of audit-proof databases.
record
character count	get	integer	The character count of a record.
record
color	get/set	RGB color or missing value	The color of a record. Currently only supported by tags & groups.
record
columns	get	list of text or missing value	The column names of a sheet.
record
comment	get/set	text or missing value	The comment of a record.
record
content hash	get	text or missing value	Stored SHA1 hash of files and document packages.
record
creation date	get/set	date or missing value	The creation date of a record. Read-only in case of audit-proof databases.
record
custom meta data
[synonyms: custom metadata]	get/set	dictionary or missing value	User-defined metadata of a record as a dictionary containing key-value pairs. Setting a value for an unknown key automatically adds a definition to Settings > Data.
record
data	get/set	raw data or missing value	The file data of a record. Currently only supported by PDF documents, images, rich text documents and web archives. Read-only in case of audit-proof databases.
record
database	get	database or missing value	The database of the record.
record
date	get/set	date or missing value	The (creation/modification) date of a record. Read-only in case of audit-proof databases.
record
digital object identifier	get	text or missing value	Digital object identifier (DOI) extracted from text of document, e.g. a scanned receipt, or from the title.
record
dimensions	get	list of integer	The width and height of an image or PDF document in pixels or points.
record
document amount	get	text or missing value	Amount extracted from text of document, e.g. a scanned receipt.
record
document date	get	date or missing value	First date extracted from text of document, e.g. a scan.
record
document name	get	text or missing value	Name based on text or properties of document
record
dpi	get	number	The resultion of an image in dpi.
record
duplicates	get	list of record or missing value	The duplicates of a record (only other instances, not including the record).
record
duration	get	real	The duration of audio and video files.
record
encrypted	get	boolean	Specifies if a document is encrypted or not. Currently only supported by PDF documents.
record
exclude from chat	get/set	boolean	Exclude group or record from chat.
record
exclude from classification	get/set	boolean	Exclude group or record from classifying.
record
exclude from search	get/set	boolean	Exclude group or record from searching.
record
exclude from see also	get/set	boolean	Exclude record from see also.
record
exclude from tagging	get/set	boolean	Exclude group from tagging.
record
exclude from Wiki linking	get/set	boolean	Exclude record from automatic Wiki linking.
record
filename	get	text or missing value	The current filename of a record.
record
flag
[synonyms: flagged, state]	get/set	boolean	The flag of a record.
record
geolocation	get/set	text or missing value	The human readable geogr. location of a record.
record
height	get	number	The height of an image or PDF document in pixels or points.
record
id	get	integer	The scripting identifier of a record. Optimizing or closing a database might modify this identifier.
record
image	get/set	any or missing value	The image or PDF document of a record. Setting supports both raw data and strings containing paths or URLs. Read-only in case of audit-proof databases.
record
indexed	get	boolean	Indexed or imported record.
record
international standard book number	get	text or missing value	International standard book number (ISBN) extracted from text of document, e.g. a scanned receipt, or from the title.
record
interval	get/set	real	Refresh interval of a feed. Currently overriden by settings.
record
kind	get	text or missing value	The human readable and localized kind of a record. WARNING: Don't use this to check the type of a record, otherwise your script might fail depending on the version and the localization.
record
label	get/set	integer	Index of label (0-7) of a record.
record
latitude	get/set	real	The latitude in degrees of a record.
record
location	get	text or missing value	The primary location of the record in the database as a POSIX path (/ in names is replaced with \/).
record
location group	get	parent or missing value	The group of the record's primary location. This is identical to the first parent group.
record
location with name	get	text or missing value	The full primary location of the record including its name (/ in names is replaced with \/).
record
locking
[synonyms: locked]	get/set	boolean	The locking of a record. Read-only in case of audit-proof databases.
record
longitude	get/set	real	The longitude in degrees of a record.
record
meta data
[synonyms: metadata]	get	dictionary or missing value	Document metadata (e.g. of PDF & RTF documents, web pages or emails) of a record as a dictionary containing key-value pairs.
Keys:

kMDItemTitle (string) : Title of document.
kMDItemHeadline (string) : Headline of document.
kMDItemSubject (string) : Subject of document, e.g. an email.
kMDItemDescription (string) : Description of document, e.g. a web page.
kMDItemCopyright (string) : Copyright of document, e.g. a web page.
kMDItemComment (string) : Comment of document, e.g. a rich text.
kMDItemURL (string) : URL of document.
kMDItemCreator (string) : Creator of document, e.g. a PDF.
kMDItemProducer (string) : Producer of document, e.g. a PDF.
kMDItemComposer (string) : Composer of document, e.g. an MP file3.
kMDItemAlbum (string) : Album of document, e.g. an MP file3.
kMDItemKeywords (comma-separated string) : Keywords of document.
kMDItemOrganizations (comma-separated string) : Organizations of document.
kMDItemContributors (comma-separated string) : Contributors of document.
kMDItemEditors (comma-separated string) : Editors of documen.
kMDItemPublishers (comma-separated string) : Publishers of document.
kMDItemAuthors (comma-separated string) : Authors of document, e.g. sender of an email.
kMDItemAuthorEmailAddresses (comma-separated string) : Email addresses of authors of document, e.g. sender of an email.
kMDItemRecipients (comma-separated string) : Recipients of document, e.g. an email.
kMDItemRecipientEmailAddresses (comma-separated string) : Email addresses of recipients of document, e.g. an email.
kMDItemEmailAddresses (comma-separated string) : Email addresses of document.

record
MIME type	get	text or missing value	The (proposed) MIME type of a record.
record
modification date	get/set	date or missing value	The modification date of a record. Read-only in case of audit-proof databases.
record
name	get/set	text	The name of a record.
record
name without date	get	text or missing value	The name of a record without any dates.
record
name without extension	get	text or missing value	The name of a record without a file extension (independent of settings).
record
newest document date	get	date or missing value	Newest date extracted from text of document, e.g. a scan.
record
number of duplicates	get	integer	The number of duplicates of a record.
record
number of hits	get/set	integer	The number of hits of a record.
record
number of replicants	get	integer	The number of replicants of a record.
record
oldest document date	get	date or missing value	Oldest date extracted from text of document, e.g. a scan.
record
opening date	get	date or missing value	Date when a content was opened the last time or when a feed was refreshed the last time.
record
original name	get	text	The original name of a record.
record
page count	get	integer	The page count of a record. Currently only supported by PDF documents.
record
paginated PDF	get	raw data or missing value	A printed/converted PDF of the record.
record
path	get/set	text or missing value	The POSIX file path of a record. Only the path of external records can be changed. Not accessible at all in case of audit-proof databases.
record
pending	get	boolean	Flag whether the (latest) contents of a record haven't been downloaded from a sync location yet.
record
plain text	get/set	text or missing value	The plain text of a record. Read-only in case of audit-proof databases.
record
proposed filename	get	text or missing value	The proposed filename for a record.
record
rating	get/set	integer	Rating (0-5) of a record.
record
record type
[synonyms: type]	get	data type	The type of a record. WARNING: Don't use string conversions of this type for comparisons, this might fail due to known scripting issues of macOS.
record
reference URL	get	text or missing value	The URL (x-devonthink-item://...) to reference/link back to a record.
Optional parameters:

app: Used in conjunction with the openexternally parameter, specify the name of the app to open the referenced file with, e.g., x-devonthink-item://UUID?openexternally=1&app=Preview.
length: Specify the number of characters from the start parameter. Used in selection links.
line: Directly jumps to the specified paragraph/line in a plain/rich text or Markdown document. Usage: line=<integer>.
openexternally: Opens the referenced item in the system default application, e.g., opening a PDF in Preview. Used with a value of 1, e.g., openexternally=1.
page:  Opens a PDF to the specified page. Usage: page=<integer>.
reveal:  Reveals an item in the item list instead of opening it in a new window. Usage: reveal=1.
row: Directly jumps to the specified row in a sheet. Usage: row=<integer>.
search:  Directly jumps to the first occurrence of the search string in the specified document. Usage: search=<string>.
section:  Directly jumps to the specified section in a Markdown document. Usage: section=<string>.
start:  Specify the starting character on the current page. Used in selection links.
time:  Directly jumps to the specified time in seconds in a video or audio document. Usage: time=<float>.

record
reminder	get/set	reminder or missing value	Reminder of a record.
record
rich text
[synonyms: text]	get/set	rich text or missing value	The rich text of the record (see extended text suite). Changes are only supported in case of RTF/RTFD documents and not by audit-proof databases.
record
score	get	real	The score of the last comparison, classification or search (value between 0.0 and 1.0) or undefined otherwise.
record
size	get	integer	The size of a record in bytes.
record
source	get/set	text or missing value	The HTML/XML source of a record if available or the record converted to HTML if possible. Read-only in case of audit-proof databases.
record
tag type	get	tag type	The tag type of a record.
record
tags	get/set	array or missing value	The tags of a record. Setting accepts both strings and parents.
record
thumbnail	get/set	any or missing value	The thumbnail of a record. Setting supports both raw data and strings containing paths or URLs.
record
unread	get/set	boolean	The unread flag of a record.
record
URL	get/set	text or missing value	The URL of a record. Read-only in case of bookmarks in audit-proof databases.
record
uuid	get	text or missing value	The unique and persistent identifier of a record.
record
web archive	get	raw data or missing value	The web archive of a record if available or the record converted to web archive if possible.
record
width	get	number	The width of an image or PDF document in pixels or points.
record
word count	get	integer	The word count of a record.
record
ELEMENTS
Element
Access
Key Forms
Description
child	get/ make/ delete	by name
by index
by range
by whose/where
by unique ID

record
incoming reference	get/ make/ delete	by name
by index
by range
by whose/where
by unique ID

record
incoming Wiki reference	get/ make/ delete	by name
by index
by range
by whose/where
by unique ID

record
outgoing reference	get/ make/ delete	by name
by index
by range
by whose/where
by unique ID

record
outgoing Wiki reference	get/ make/ delete	by name
by index
by range
by whose/where
by unique ID

record
parent	get/ make/ delete	by name
by index
by range
by whose/where
by unique ID

record
SUPERCLASS
The content class inherits elements and properties from record.
WHERE USED
The content class is used in the following ways:
result of lookup records with file command
result of convert image command
result of ocr command
result of summarize annotations of command
result of summarize contents of command
result of summarize mentions of command
element of database class
result of compare command
result of convert command
result of create formatted note from command
result of create Markdown from command
result of create PDF document from command
result of create web document from command
annotation property of the record class/record
content record property of the think window class/record
content record property of the document window class/record
content record property of the application class/record
content record property of the tab class/record
record parameter of the convert image command/event
record parameter of the imprint command/event
record parameter of the transcribe command/event
record parameter of the compare command/event
record parameter of the convert command/event
record parameter of the get concordance of command/event
records parameter of the summarize annotations of command/event
records parameter of the summarize contents of command/event
records parameter of the summarize mentions of command/event
to parameter of the imprint configuration command/event
database
database (noun), pl databasesA database.
PROPERTIES
Property
Access
Type
Description
annotations group	get	parent or missing value	The group for annotations, will be created if necessary.
comment	get/set	text or missing value	The comment of the database.
current group	get	parent or missing value	The (selected) group of the frontmost window. Returns root if no current group exists.
encrypted	get	boolean	Specifies if a database is encrypted or not.
filename	get	text or missing value	The filename of the database.
id	get	integer	The scripting identifier of a database.
incoming group	get	parent or missing value	The default group for new notes. Might be identical to root.
name	get/set	text	The name of the database.
path	get	text or missing value	The POSIX path of the database.
read only	get	boolean	Specifies if a database is read-only and can't be modified.
root
[synonyms: top level group]	get	parent or missing value	The top level group of the database.
Spotlight indexing	get/set	boolean	Specifies if Spotlight indexing of a database is en- or disabled.
tags group	get	parent or missing value	The group for tags.
trash group	get	parent or missing value	The trash's group.
uuid	get	text or missing value	The unique and persistent identifier of a database for external referencing.
versioning	get/set	boolean	Specifies whether versioning of documents is en- or disabled.
versions group	get	parent or missing value	The group for versioning.
ELEMENTS
Element
Access
Key Forms
Description
content	get/ make/ delete	by name
by index
by range
by whose/where
by unique ID
parent	get/ make/ delete	by name
by index
by range
by whose/where
by unique ID
smart parent	get/ make/ delete	by name
by index
by range
by whose/where
by unique ID
tag group	get/ make/ delete	by name
by index
by range
by whose/where
by unique ID
COMMANDS
The database class responds to the following commands:
Command
Description
close	Close a window, tab or database.
WHERE USED
The database class is used in the following ways:
element of application class
result of open database command
result of create database command
result of get database with id command
result of get database with uuid command
current database property of the application class/record
database property of the think window class/record
database parameter of the optimize command/event
database parameter of the synchronize command/event
database parameter of the verify command/event
database property of the record class/record
database property of the tab class/record
database parameter of the check file integrity of command/event
database parameter of the compress command/event
for parameter of the display group selector command/event
in parameter of the lookup records with tags command/event
in parameter of the lookup records with comment command/event
in parameter of the lookup records with URL command/event
in parameter of the lookup records with path command/event
in parameter of the lookup records with file command/event
in parameter of the lookup records with content hash command/event
in parameter of the classify command/event
in parameter of the create location command/event
in parameter of the exists record at command/event
in parameter of the exists record with comment command/event
in parameter of the exists record with content hash command/event
in parameter of the exists record with file command/event
in parameter of the exists record with path command/event
in parameter of the exists record with URL command/event
in parameter of the get record at command/event
in parameter of the get record with id command/event
in parameter of the get record with uuid command/event
inbox property of the application class/record
to parameter of the compare command/event
SEE ALSO
close				
document window
document window (noun), pl document windows[synonyms: content window]A document window.
PROPERTIES
Property
Access
Type
Description
bounds	get/set	rectangle	The bounding rectangle of the window.
window
closeable	get	boolean	Does the window have a close button?
window
content record
[synonyms: record]	get/set	content or missing value	The record of the visible document.
current line	get	integer	Zero-based index of current line.
think window
current movie frame	get	raw data or missing value	Image of current movie frame.
think window
current page	get/set	integer	Zero-based index of current PDF page.
think window
current tab	get/set	tab or missing value	The selected tab of the think window.
think window
current time	get/set	real	Time of current audio/video file.
think window
database	get	database or missing value	The database of the window.
think window
id	get	integer	The unique identifier of the window.
window
index	get/set	integer	The index of the window, ordered front to back.
window
loading	get	boolean	Specifies if the current web page is still loading.
think window
miniaturizable	get	boolean	Does the window have a minimize button?
window
miniaturized	get/set	boolean	Is the window minimized right now?
window
name	get	text	The title of the window.
window
number of columns	get	integer	Number of columns of the current sheet.
think window
number of rows	get	integer	Number of rows of the current sheet.
think window
paginated PDF	get	raw data or missing value	A printed PDF with pagination of the visible document.
think window
PDF	get	raw data or missing value	A PDF without pagination of the visible document retaining the screen layout.
think window
plain text	get	text or missing value	The plain text of the window.
think window
reference URL	get	text or missing value	The URL (x-devonthink-item://...) to reference/link back to the current content record and its selection, page, frame etc.
think window
resizable	get	boolean	Can the window be resized?
window
rich text
[synonyms: text]	get/set	text, rich text or missing value	The rich text of the window. Changes are only supported in case of RTF/RTFD documents. In addition, Markdown & HTML formatted input is supported too.
think window
selected column	get/set	integer	Index (1...n) of selected column of the current sheet.
think window
selected columns	get	list of integer	Indices (1...n) of selected columns of the current sheet.
think window
selected row	get/set	integer	Index (1...n) of selected row of the current sheet.
think window
selected rows	get	list of integer	Indices (1...n) of selected rows of the current sheet.
think window
selected text	get/set	text, rich text or missing value	The rich text for the selection of the window. Setting supports both text- and web-based documents, e.g. plain/rich text, Markdown documents or formatted notes. In addition, Markdown & HTML formatted input is supported too.
think window
source	get	text or missing value	The HTML source of the current web page.
think window
URL	get/set	text or missing value	The URL of the current web page. In addition, setting the URL can be used to load a web page.
think window
visible	get/set	boolean	Is the window visible right now?
window
web archive	get	raw data or missing value	Web archive of the current web page.
think window
zoomable	get	boolean	Does the window have a zoom button?
window
zoomed	get/set	boolean	Is the window zoomed right now?
window
ELEMENTS
Element
Access
Key Forms
Description
tab	get/ make/ delete	by index
by unique ID

think window
COMMANDS
The document window class responds to the following commands:
Command
Description
add row	Add new row to current sheet. think window
close	Close a window, tab or database. think window
close	Close a window, tab or database. window
delete row at	Remove row at specified position from current sheet. think window
display chat dialog	Display a dialog to show the response for a chat prompt for the current document. Either the selected text or the complete document is used. think window
get cell at	Get content of cell at specified position of current sheet. think window
print	Print a window or tab. think window
print	Print a window or tab. window
save	Save a window or tab. think window
save	Save a window or tab. window
set cell at	Set cell at specified position of current sheet. think window
SUPERCLASS
The document window class inherits elements and properties from think window.
WHERE USED
The document window class is used in the following ways:
element of application class
incoming reference
incoming reference (noun), pl incoming referencesA reference from another record.
PROPERTIES
Property
Access
Type
Description
addition date	get	date or missing value	Date when the record was added to the database.
record
aliases	get/set	text or missing value	Wiki aliases (separated by commas or semicolons) of a record.
record
all document dates	get	list of date or missing value	All dates extracted from text of document, e.g. a scan.
record
altitude	get/set	real	The altitude in metres of a record.
record
annotation	get/set	content or missing value	Annotation of a record. Only plain & rich text and Markdown documents are supported. Read-only in case of audit-proof databases.
record
annotation count	get	integer	The number of annotations. Supported by HTML pages, formatted notes, web archives, PDF, rich text & Markdown documents.
record
attached script	get/set	text or missing value	POSIX path of script attached to a record.
record
attachment count	get	integer	The number of attachments. Currently only supported for RTFD documents and emails.
record
attributes change date	get/set	date or missing value	The change date of the record's attributes.
record
bates number	get/set	integer	Bates number.
record
cells	get/set	list of array	The cells of a sheet. This is a list of rows, each row contains a list of string values for the various colums. Read-only in case of audit-proof databases.
record
character count	get	integer	The character count of a record.
record
color	get/set	RGB color or missing value	The color of a record. Currently only supported by tags & groups.
record
columns	get	list of text or missing value	The column names of a sheet.
record
comment	get/set	text or missing value	The comment of a record.
record
content hash	get	text or missing value	Stored SHA1 hash of files and document packages.
record
creation date	get/set	date or missing value	The creation date of a record. Read-only in case of audit-proof databases.
record
custom meta data
[synonyms: custom metadata]	get/set	dictionary or missing value	User-defined metadata of a record as a dictionary containing key-value pairs. Setting a value for an unknown key automatically adds a definition to Settings > Data.
record
data	get/set	raw data or missing value	The file data of a record. Currently only supported by PDF documents, images, rich text documents and web archives. Read-only in case of audit-proof databases.
record
database	get	database or missing value	The database of the record.
record
date	get/set	date or missing value	The (creation/modification) date of a record. Read-only in case of audit-proof databases.
record
digital object identifier	get	text or missing value	Digital object identifier (DOI) extracted from text of document, e.g. a scanned receipt, or from the title.
record
dimensions	get	list of integer	The width and height of an image or PDF document in pixels or points.
record
document amount	get	text or missing value	Amount extracted from text of document, e.g. a scanned receipt.
record
document date	get	date or missing value	First date extracted from text of document, e.g. a scan.
record
document name	get	text or missing value	Name based on text or properties of document
record
dpi	get	number	The resultion of an image in dpi.
record
duplicates	get	list of record or missing value	The duplicates of a record (only other instances, not including the record).
record
duration	get	real	The duration of audio and video files.
record
encrypted	get	boolean	Specifies if a document is encrypted or not. Currently only supported by PDF documents.
record
exclude from chat	get/set	boolean	Exclude group or record from chat.
record
exclude from classification	get/set	boolean	Exclude group or record from classifying.
record
exclude from search	get/set	boolean	Exclude group or record from searching.
record
exclude from see also	get/set	boolean	Exclude record from see also.
record
exclude from tagging	get/set	boolean	Exclude group from tagging.
record
exclude from Wiki linking	get/set	boolean	Exclude record from automatic Wiki linking.
record
filename	get	text or missing value	The current filename of a record.
record
flag
[synonyms: flagged, state]	get/set	boolean	The flag of a record.
record
geolocation	get/set	text or missing value	The human readable geogr. location of a record.
record
height	get	number	The height of an image or PDF document in pixels or points.
record
id	get	integer	The scripting identifier of a record. Optimizing or closing a database might modify this identifier.
record
image	get/set	any or missing value	The image or PDF document of a record. Setting supports both raw data and strings containing paths or URLs. Read-only in case of audit-proof databases.
record
indexed	get	boolean	Indexed or imported record.
record
international standard book number	get	text or missing value	International standard book number (ISBN) extracted from text of document, e.g. a scanned receipt, or from the title.
record
interval	get/set	real	Refresh interval of a feed. Currently overriden by settings.
record
kind	get	text or missing value	The human readable and localized kind of a record. WARNING: Don't use this to check the type of a record, otherwise your script might fail depending on the version and the localization.
record
label	get/set	integer	Index of label (0-7) of a record.
record
latitude	get/set	real	The latitude in degrees of a record.
record
location	get	text or missing value	The primary location of the record in the database as a POSIX path (/ in names is replaced with \/).
record
location group	get	parent or missing value	The group of the record's primary location. This is identical to the first parent group.
record
location with name	get	text or missing value	The full primary location of the record including its name (/ in names is replaced with \/).
record
locking
[synonyms: locked]	get/set	boolean	The locking of a record. Read-only in case of audit-proof databases.
record
longitude	get/set	real	The longitude in degrees of a record.
record
meta data
[synonyms: metadata]	get	dictionary or missing value	Document metadata (e.g. of PDF & RTF documents, web pages or emails) of a record as a dictionary containing key-value pairs.
Keys:

kMDItemTitle (string) : Title of document.
kMDItemHeadline (string) : Headline of document.
kMDItemSubject (string) : Subject of document, e.g. an email.
kMDItemDescription (string) : Description of document, e.g. a web page.
kMDItemCopyright (string) : Copyright of document, e.g. a web page.
kMDItemComment (string) : Comment of document, e.g. a rich text.
kMDItemURL (string) : URL of document.
kMDItemCreator (string) : Creator of document, e.g. a PDF.
kMDItemProducer (string) : Producer of document, e.g. a PDF.
kMDItemComposer (string) : Composer of document, e.g. an MP file3.
kMDItemAlbum (string) : Album of document, e.g. an MP file3.
kMDItemKeywords (comma-separated string) : Keywords of document.
kMDItemOrganizations (comma-separated string) : Organizations of document.
kMDItemContributors (comma-separated string) : Contributors of document.
kMDItemEditors (comma-separated string) : Editors of documen.
kMDItemPublishers (comma-separated string) : Publishers of document.
kMDItemAuthors (comma-separated string) : Authors of document, e.g. sender of an email.
kMDItemAuthorEmailAddresses (comma-separated string) : Email addresses of authors of document, e.g. sender of an email.
kMDItemRecipients (comma-separated string) : Recipients of document, e.g. an email.
kMDItemRecipientEmailAddresses (comma-separated string) : Email addresses of recipients of document, e.g. an email.
kMDItemEmailAddresses (comma-separated string) : Email addresses of document.

record
MIME type	get	text or missing value	The (proposed) MIME type of a record.
record
modification date	get/set	date or missing value	The modification date of a record. Read-only in case of audit-proof databases.
record
name	get/set	text	The name of a record.
record
name without date	get	text or missing value	The name of a record without any dates.
record
name without extension	get	text or missing value	The name of a record without a file extension (independent of settings).
record
newest document date	get	date or missing value	Newest date extracted from text of document, e.g. a scan.
record
number of duplicates	get	integer	The number of duplicates of a record.
record
number of hits	get/set	integer	The number of hits of a record.
record
number of replicants	get	integer	The number of replicants of a record.
record
oldest document date	get	date or missing value	Oldest date extracted from text of document, e.g. a scan.
record
opening date	get	date or missing value	Date when a content was opened the last time or when a feed was refreshed the last time.
record
original name	get	text	The original name of a record.
record
page count	get	integer	The page count of a record. Currently only supported by PDF documents.
record
paginated PDF	get	raw data or missing value	A printed/converted PDF of the record.
record
path	get/set	text or missing value	The POSIX file path of a record. Only the path of external records can be changed. Not accessible at all in case of audit-proof databases.
record
pending	get	boolean	Flag whether the (latest) contents of a record haven't been downloaded from a sync location yet.
record
plain text	get/set	text or missing value	The plain text of a record. Read-only in case of audit-proof databases.
record
proposed filename	get	text or missing value	The proposed filename for a record.
record
rating	get/set	integer	Rating (0-5) of a record.
record
record type
[synonyms: type]	get	data type	The type of a record. WARNING: Don't use string conversions of this type for comparisons, this might fail due to known scripting issues of macOS.
record
reference URL	get	text or missing value	The URL (x-devonthink-item://...) to reference/link back to a record.
Optional parameters:

app: Used in conjunction with the openexternally parameter, specify the name of the app to open the referenced file with, e.g., x-devonthink-item://UUID?openexternally=1&app=Preview.
length: Specify the number of characters from the start parameter. Used in selection links.
line: Directly jumps to the specified paragraph/line in a plain/rich text or Markdown document. Usage: line=<integer>.
openexternally: Opens the referenced item in the system default application, e.g., opening a PDF in Preview. Used with a value of 1, e.g., openexternally=1.
page:  Opens a PDF to the specified page. Usage: page=<integer>.
reveal:  Reveals an item in the item list instead of opening it in a new window. Usage: reveal=1.
row: Directly jumps to the specified row in a sheet. Usage: row=<integer>.
search:  Directly jumps to the first occurrence of the search string in the specified document. Usage: search=<string>.
section:  Directly jumps to the specified section in a Markdown document. Usage: section=<string>.
start:  Specify the starting character on the current page. Used in selection links.
time:  Directly jumps to the specified time in seconds in a video or audio document. Usage: time=<float>.

record
reminder	get/set	reminder or missing value	Reminder of a record.
record
rich text
[synonyms: text]	get/set	rich text or missing value	The rich text of the record (see extended text suite). Changes are only supported in case of RTF/RTFD documents and not by audit-proof databases.
record
score	get	real	The score of the last comparison, classification or search (value between 0.0 and 1.0) or undefined otherwise.
record
size	get	integer	The size of a record in bytes.
record
source	get/set	text or missing value	The HTML/XML source of a record if available or the record converted to HTML if possible. Read-only in case of audit-proof databases.
record
tag type	get	tag type	The tag type of a record.
record
tags	get/set	array or missing value	The tags of a record. Setting accepts both strings and parents.
record
thumbnail	get/set	any or missing value	The thumbnail of a record. Setting supports both raw data and strings containing paths or URLs.
record
unread	get/set	boolean	The unread flag of a record.
record
URL	get/set	text or missing value	The URL of a record. Read-only in case of bookmarks in audit-proof databases.
record
uuid	get	text or missing value	The unique and persistent identifier of a record.
record
web archive	get	raw data or missing value	The web archive of a record if available or the record converted to web archive if possible.
record
width	get	number	The width of an image or PDF document in pixels or points.
record
word count	get	integer	The word count of a record.
record
ELEMENTS
Element
Access
Key Forms
Description
child	get/ make/ delete	by name
by index
by range
by whose/where
by unique ID

record
incoming reference	get/ make/ delete	by name
by index
by range
by whose/where
by unique ID

record
incoming Wiki reference	get/ make/ delete	by name
by index
by range
by whose/where
by unique ID

record
outgoing reference	get/ make/ delete	by name
by index
by range
by whose/where
by unique ID

record
outgoing Wiki reference	get/ make/ delete	by name
by index
by range
by whose/where
by unique ID

record
parent	get/ make/ delete	by name
by index
by range
by whose/where
by unique ID

record
SUPERCLASS
The incoming reference class inherits elements and properties from record.
WHERE USED
The incoming reference class is used in the following ways:
element of child class
element of content class
element of incoming reference class
element of incoming Wiki reference class
element of outgoing reference class
element of outgoing Wiki reference class
element of parent class
element of record class
element of selected record class
element of smart parent class
element of tag group class
incoming Wiki reference
incoming Wiki reference (noun), pl incoming Wiki referencesAn automatic Wiki reference from another record. This depends on the current Wiki linking settings.
PROPERTIES
Property
Access
Type
Description
addition date	get	date or missing value	Date when the record was added to the database.
record
aliases	get/set	text or missing value	Wiki aliases (separated by commas or semicolons) of a record.
record
all document dates	get	list of date or missing value	All dates extracted from text of document, e.g. a scan.
record
altitude	get/set	real	The altitude in metres of a record.
record
annotation	get/set	content or missing value	Annotation of a record. Only plain & rich text and Markdown documents are supported. Read-only in case of audit-proof databases.
record
annotation count	get	integer	The number of annotations. Supported by HTML pages, formatted notes, web archives, PDF, rich text & Markdown documents.
record
attached script	get/set	text or missing value	POSIX path of script attached to a record.
record
attachment count	get	integer	The number of attachments. Currently only supported for RTFD documents and emails.
record
attributes change date	get/set	date or missing value	The change date of the record's attributes.
record
bates number	get/set	integer	Bates number.
record
cells	get/set	list of array	The cells of a sheet. This is a list of rows, each row contains a list of string values for the various colums. Read-only in case of audit-proof databases.
record
character count	get	integer	The character count of a record.
record
color	get/set	RGB color or missing value	The color of a record. Currently only supported by tags & groups.
record
columns	get	list of text or missing value	The column names of a sheet.
record
comment	get/set	text or missing value	The comment of a record.
record
content hash	get	text or missing value	Stored SHA1 hash of files and document packages.
record
creation date	get/set	date or missing value	The creation date of a record. Read-only in case of audit-proof databases.
record
custom meta data
[synonyms: custom metadata]	get/set	dictionary or missing value	User-defined metadata of a record as a dictionary containing key-value pairs. Setting a value for an unknown key automatically adds a definition to Settings > Data.
record
data	get/set	raw data or missing value	The file data of a record. Currently only supported by PDF documents, images, rich text documents and web archives. Read-only in case of audit-proof databases.
record
database	get	database or missing value	The database of the record.
record
date	get/set	date or missing value	The (creation/modification) date of a record. Read-only in case of audit-proof databases.
record
digital object identifier	get	text or missing value	Digital object identifier (DOI) extracted from text of document, e.g. a scanned receipt, or from the title.
record
dimensions	get	list of integer	The width and height of an image or PDF document in pixels or points.
record
document amount	get	text or missing value	Amount extracted from text of document, e.g. a scanned receipt.
record
document date	get	date or missing value	First date extracted from text of document, e.g. a scan.
record
document name	get	text or missing value	Name based on text or properties of document
record
dpi	get	number	The resultion of an image in dpi.
record
duplicates	get	list of record or missing value	The duplicates of a record (only other instances, not including the record).
record
duration	get	real	The duration of audio and video files.
record
encrypted	get	boolean	Specifies if a document is encrypted or not. Currently only supported by PDF documents.
record
exclude from chat	get/set	boolean	Exclude group or record from chat.
record
exclude from classification	get/set	boolean	Exclude group or record from classifying.
record
exclude from search	get/set	boolean	Exclude group or record from searching.
record
exclude from see also	get/set	boolean	Exclude record from see also.
record
exclude from tagging	get/set	boolean	Exclude group from tagging.
record
exclude from Wiki linking	get/set	boolean	Exclude record from automatic Wiki linking.
record
filename	get	text or missing value	The current filename of a record.
record
flag
[synonyms: flagged, state]	get/set	boolean	The flag of a record.
record
geolocation	get/set	text or missing value	The human readable geogr. location of a record.
record
height	get	number	The height of an image or PDF document in pixels or points.
record
id	get	integer	The scripting identifier of a record. Optimizing or closing a database might modify this identifier.
record
image	get/set	any or missing value	The image or PDF document of a record. Setting supports both raw data and strings containing paths or URLs. Read-only in case of audit-proof databases.
record
indexed	get	boolean	Indexed or imported record.
record
international standard book number	get	text or missing value	International standard book number (ISBN) extracted from text of document, e.g. a scanned receipt, or from the title.
record
interval	get/set	real	Refresh interval of a feed. Currently overriden by settings.
record
kind	get	text or missing value	The human readable and localized kind of a record. WARNING: Don't use this to check the type of a record, otherwise your script might fail depending on the version and the localization.
record
label	get/set	integer	Index of label (0-7) of a record.
record
latitude	get/set	real	The latitude in degrees of a record.
record
location	get	text or missing value	The primary location of the record in the database as a POSIX path (/ in names is replaced with \/).
record
location group	get	parent or missing value	The group of the record's primary location. This is identical to the first parent group.
record
location with name	get	text or missing value	The full primary location of the record including its name (/ in names is replaced with \/).
record
locking
[synonyms: locked]	get/set	boolean	The locking of a record. Read-only in case of audit-proof databases.
record
longitude	get/set	real	The longitude in degrees of a record.
record
meta data
[synonyms: metadata]	get	dictionary or missing value	Document metadata (e.g. of PDF & RTF documents, web pages or emails) of a record as a dictionary containing key-value pairs.
Keys:

kMDItemTitle (string) : Title of document.
kMDItemHeadline (string) : Headline of document.
kMDItemSubject (string) : Subject of document, e.g. an email.
kMDItemDescription (string) : Description of document, e.g. a web page.
kMDItemCopyright (string) : Copyright of document, e.g. a web page.
kMDItemComment (string) : Comment of document, e.g. a rich text.
kMDItemURL (string) : URL of document.
kMDItemCreator (string) : Creator of document, e.g. a PDF.
kMDItemProducer (string) : Producer of document, e.g. a PDF.
kMDItemComposer (string) : Composer of document, e.g. an MP file3.
kMDItemAlbum (string) : Album of document, e.g. an MP file3.
kMDItemKeywords (comma-separated string) : Keywords of document.
kMDItemOrganizations (comma-separated string) : Organizations of document.
kMDItemContributors (comma-separated string) : Contributors of document.
kMDItemEditors (comma-separated string) : Editors of documen.
kMDItemPublishers (comma-separated string) : Publishers of document.
kMDItemAuthors (comma-separated string) : Authors of document, e.g. sender of an email.
kMDItemAuthorEmailAddresses (comma-separated string) : Email addresses of authors of document, e.g. sender of an email.
kMDItemRecipients (comma-separated string) : Recipients of document, e.g. an email.
kMDItemRecipientEmailAddresses (comma-separated string) : Email addresses of recipients of document, e.g. an email.
kMDItemEmailAddresses (comma-separated string) : Email addresses of document.

record
MIME type	get	text or missing value	The (proposed) MIME type of a record.
record
modification date	get/set	date or missing value	The modification date of a record. Read-only in case of audit-proof databases.
record
name	get/set	text	The name of a record.
record
name without date	get	text or missing value	The name of a record without any dates.
record
name without extension	get	text or missing value	The name of a record without a file extension (independent of settings).
record
newest document date	get	date or missing value	Newest date extracted from text of document, e.g. a scan.
record
number of duplicates	get	integer	The number of duplicates of a record.
record
number of hits	get/set	integer	The number of hits of a record.
record
number of replicants	get	integer	The number of replicants of a record.
record
oldest document date	get	date or missing value	Oldest date extracted from text of document, e.g. a scan.
record
opening date	get	date or missing value	Date when a content was opened the last time or when a feed was refreshed the last time.
record
original name	get	text	The original name of a record.
record
page count	get	integer	The page count of a record. Currently only supported by PDF documents.
record
paginated PDF	get	raw data or missing value	A printed/converted PDF of the record.
record
path	get/set	text or missing value	The POSIX file path of a record. Only the path of external records can be changed. Not accessible at all in case of audit-proof databases.
record
pending	get	boolean	Flag whether the (latest) contents of a record haven't been downloaded from a sync location yet.
record
plain text	get/set	text or missing value	The plain text of a record. Read-only in case of audit-proof databases.
record
proposed filename	get	text or missing value	The proposed filename for a record.
record
rating	get/set	integer	Rating (0-5) of a record.
record
record type
[synonyms: type]	get	data type	The type of a record. WARNING: Don't use string conversions of this type for comparisons, this might fail due to known scripting issues of macOS.
record
reference URL	get	text or missing value	The URL (x-devonthink-item://...) to reference/link back to a record.
Optional parameters:

app: Used in conjunction with the openexternally parameter, specify the name of the app to open the referenced file with, e.g., x-devonthink-item://UUID?openexternally=1&app=Preview.
length: Specify the number of characters from the start parameter. Used in selection links.
line: Directly jumps to the specified paragraph/line in a plain/rich text or Markdown document. Usage: line=<integer>.
openexternally: Opens the referenced item in the system default application, e.g., opening a PDF in Preview. Used with a value of 1, e.g., openexternally=1.
page:  Opens a PDF to the specified page. Usage: page=<integer>.
reveal:  Reveals an item in the item list instead of opening it in a new window. Usage: reveal=1.
row: Directly jumps to the specified row in a sheet. Usage: row=<integer>.
search:  Directly jumps to the first occurrence of the search string in the specified document. Usage: search=<string>.
section:  Directly jumps to the specified section in a Markdown document. Usage: section=<string>.
start:  Specify the starting character on the current page. Used in selection links.
time:  Directly jumps to the specified time in seconds in a video or audio document. Usage: time=<float>.

record
reminder	get/set	reminder or missing value	Reminder of a record.
record
rich text
[synonyms: text]	get/set	rich text or missing value	The rich text of the record (see extended text suite). Changes are only supported in case of RTF/RTFD documents and not by audit-proof databases.
record
score	get	real	The score of the last comparison, classification or search (value between 0.0 and 1.0) or undefined otherwise.
record
size	get	integer	The size of a record in bytes.
record
source	get/set	text or missing value	The HTML/XML source of a record if available or the record converted to HTML if possible. Read-only in case of audit-proof databases.
record
tag type	get	tag type	The tag type of a record.
record
tags	get/set	array or missing value	The tags of a record. Setting accepts both strings and parents.
record
thumbnail	get/set	any or missing value	The thumbnail of a record. Setting supports both raw data and strings containing paths or URLs.
record
unread	get/set	boolean	The unread flag of a record.
record
URL	get/set	text or missing value	The URL of a record. Read-only in case of bookmarks in audit-proof databases.
record
uuid	get	text or missing value	The unique and persistent identifier of a record.
record
web archive	get	raw data or missing value	The web archive of a record if available or the record converted to web archive if possible.
record
width	get	number	The width of an image or PDF document in pixels or points.
record
word count	get	integer	The word count of a record.
record
ELEMENTS
Element
Access
Key Forms
Description
child	get/ make/ delete	by name
by index
by range
by whose/where
by unique ID

record
incoming reference	get/ make/ delete	by name
by index
by range
by whose/where
by unique ID

record
incoming Wiki reference	get/ make/ delete	by name
by index
by range
by whose/where
by unique ID

record
outgoing reference	get/ make/ delete	by name
by index
by range
by whose/where
by unique ID

record
outgoing Wiki reference	get/ make/ delete	by name
by index
by range
by whose/where
by unique ID

record
parent	get/ make/ delete	by name
by index
by range
by whose/where
by unique ID

record
SUPERCLASS
The incoming Wiki reference class inherits elements and properties from record.
WHERE USED
The incoming Wiki reference class is used in the following ways:
element of child class
element of content class
element of incoming reference class
element of incoming Wiki reference class
element of outgoing reference class
element of outgoing Wiki reference class
element of parent class
element of record class
element of selected record class
element of smart parent class
element of tag group class
main window
main window (noun), pl main windows[synonyms: viewer window]A main window.
PROPERTIES
Property
Access
Type
Description
bounds	get/set	rectangle	The bounding rectangle of the window.
window
closeable	get	boolean	Does the window have a close button?
window
content record	get	content or missing value	The record of the visible document.
think window
current line	get	integer	Zero-based index of current line.
think window
current movie frame	get	raw data or missing value	Image of current movie frame.
think window
current page	get/set	integer	Zero-based index of current PDF page.
think window
current tab	get/set	tab or missing value	The selected tab of the think window.
think window
current time	get/set	real	Time of current audio/video file.
think window
database	get	database or missing value	The database of the window.
think window
id	get	integer	The unique identifier of the window.
window
index	get/set	integer	The index of the window, ordered front to back.
window
loading	get	boolean	Specifies if the current web page is still loading.
think window
miniaturizable	get	boolean	Does the window have a minimize button?
window
miniaturized	get/set	boolean	Is the window minimized right now?
window
name	get	text	The title of the window.
window
number of columns	get	integer	Number of columns of the current sheet.
think window
number of rows	get	integer	Number of rows of the current sheet.
think window
paginated PDF	get	raw data or missing value	A printed PDF with pagination of the visible document.
think window
PDF	get	raw data or missing value	A PDF without pagination of the visible document retaining the screen layout.
think window
plain text	get	text or missing value	The plain text of the window.
think window
reference URL	get	text or missing value	The URL (x-devonthink-item://...) to reference/link back to the current content record and its selection, page, frame etc.
think window
resizable	get	boolean	Can the window be resized?
window
rich text
[synonyms: text]	get/set	text, rich text or missing value	The rich text of the window. Changes are only supported in case of RTF/RTFD documents. In addition, Markdown & HTML formatted input is supported too.
think window
root	get/set	parent or missing value	The top level group of the viewer.
search query	get/set	text or missing value	The search query. Setting the query performs a search.
search results	get/set	list of record or missing value	The search results.
selected column	get/set	integer	Index (1...n) of selected column of the current sheet.
think window
selected columns	get	list of integer	Indices (1...n) of selected columns of the current sheet.
think window
selected row	get/set	integer	Index (1...n) of selected row of the current sheet.
think window
selected rows	get	list of integer	Indices (1...n) of selected rows of the current sheet.
think window
selected text	get/set	text, rich text or missing value	The rich text for the selection of the window. Setting supports both text- and web-based documents, e.g. plain/rich text, Markdown documents or formatted notes. In addition, Markdown & HTML formatted input is supported too.
think window
selection	get/set	list of record or missing value	The current selection. 'selected records' element is recommended instead.
source	get	text or missing value	The HTML source of the current web page.
think window
URL	get/set	text or missing value	The URL of the current web page. In addition, setting the URL can be used to load a web page.
think window
visible	get/set	boolean	Is the window visible right now?
window
web archive	get	raw data or missing value	Web archive of the current web page.
think window
zoomable	get	boolean	Does the window have a zoom button?
window
zoomed	get/set	boolean	Is the window zoomed right now?
window
ELEMENTS
Element
Access
Key Forms
Description
selected record	get/ make/ delete	by name
by index
by range
by whose/where
by unique ID
tab	get/ make/ delete	by index
by unique ID

think window
COMMANDS
The main window class responds to the following commands:
Command
Description
add row	Add new row to current sheet. think window
close	Close a window, tab or database. think window
close	Close a window, tab or database. window
delete row at	Remove row at specified position from current sheet. think window
display chat dialog	Display a dialog to show the response for a chat prompt for the current document. Either the selected text or the complete document is used. think window
get cell at	Get content of cell at specified position of current sheet. think window
print	Print a window or tab. think window
print	Print a window or tab. window
save	Save a window or tab. think window
save	Save a window or tab. window
set cell at	Set cell at specified position of current sheet. think window
SUPERCLASS
The main window class inherits elements and properties from think window.
WHERE USED
The main window class is used in the following ways:
element of application class
outgoing reference
outgoing reference (noun), pl outgoing referencesA reference to another record.
PROPERTIES
Property
Access
Type
Description
addition date	get	date or missing value	Date when the record was added to the database.
record
aliases	get/set	text or missing value	Wiki aliases (separated by commas or semicolons) of a record.
record
all document dates	get	list of date or missing value	All dates extracted from text of document, e.g. a scan.
record
altitude	get/set	real	The altitude in metres of a record.
record
annotation	get/set	content or missing value	Annotation of a record. Only plain & rich text and Markdown documents are supported. Read-only in case of audit-proof databases.
record
annotation count	get	integer	The number of annotations. Supported by HTML pages, formatted notes, web archives, PDF, rich text & Markdown documents.
record
attached script	get/set	text or missing value	POSIX path of script attached to a record.
record
attachment count	get	integer	The number of attachments. Currently only supported for RTFD documents and emails.
record
attributes change date	get/set	date or missing value	The change date of the record's attributes.
record
bates number	get/set	integer	Bates number.
record
cells	get/set	list of array	The cells of a sheet. This is a list of rows, each row contains a list of string values for the various colums. Read-only in case of audit-proof databases.
record
character count	get	integer	The character count of a record.
record
color	get/set	RGB color or missing value	The color of a record. Currently only supported by tags & groups.
record
columns	get	list of text or missing value	The column names of a sheet.
record
comment	get/set	text or missing value	The comment of a record.
record
content hash	get	text or missing value	Stored SHA1 hash of files and document packages.
record
creation date	get/set	date or missing value	The creation date of a record. Read-only in case of audit-proof databases.
record
custom meta data
[synonyms: custom metadata]	get/set	dictionary or missing value	User-defined metadata of a record as a dictionary containing key-value pairs. Setting a value for an unknown key automatically adds a definition to Settings > Data.
record
data	get/set	raw data or missing value	The file data of a record. Currently only supported by PDF documents, images, rich text documents and web archives. Read-only in case of audit-proof databases.
record
database	get	database or missing value	The database of the record.
record
date	get/set	date or missing value	The (creation/modification) date of a record. Read-only in case of audit-proof databases.
record
digital object identifier	get	text or missing value	Digital object identifier (DOI) extracted from text of document, e.g. a scanned receipt, or from the title.
record
dimensions	get	list of integer	The width and height of an image or PDF document in pixels or points.
record
document amount	get	text or missing value	Amount extracted from text of document, e.g. a scanned receipt.
record
document date	get	date or missing value	First date extracted from text of document, e.g. a scan.
record
document name	get	text or missing value	Name based on text or properties of document
record
dpi	get	number	The resultion of an image in dpi.
record
duplicates	get	list of record or missing value	The duplicates of a record (only other instances, not including the record).
record
duration	get	real	The duration of audio and video files.
record
encrypted	get	boolean	Specifies if a document is encrypted or not. Currently only supported by PDF documents.
record
exclude from chat	get/set	boolean	Exclude group or record from chat.
record
exclude from classification	get/set	boolean	Exclude group or record from classifying.
record
exclude from search	get/set	boolean	Exclude group or record from searching.
record
exclude from see also	get/set	boolean	Exclude record from see also.
record
exclude from tagging	get/set	boolean	Exclude group from tagging.
record
exclude from Wiki linking	get/set	boolean	Exclude record from automatic Wiki linking.
record
filename	get	text or missing value	The current filename of a record.
record
flag
[synonyms: flagged, state]	get/set	boolean	The flag of a record.
record
geolocation	get/set	text or missing value	The human readable geogr. location of a record.
record
height	get	number	The height of an image or PDF document in pixels or points.
record
id	get	integer	The scripting identifier of a record. Optimizing or closing a database might modify this identifier.
record
image	get/set	any or missing value	The image or PDF document of a record. Setting supports both raw data and strings containing paths or URLs. Read-only in case of audit-proof databases.
record
indexed	get	boolean	Indexed or imported record.
record
international standard book number	get	text or missing value	International standard book number (ISBN) extracted from text of document, e.g. a scanned receipt, or from the title.
record
interval	get/set	real	Refresh interval of a feed. Currently overriden by settings.
record
kind	get	text or missing value	The human readable and localized kind of a record. WARNING: Don't use this to check the type of a record, otherwise your script might fail depending on the version and the localization.
record
label	get/set	integer	Index of label (0-7) of a record.
record
latitude	get/set	real	The latitude in degrees of a record.
record
location	get	text or missing value	The primary location of the record in the database as a POSIX path (/ in names is replaced with \/).
record
location group	get	parent or missing value	The group of the record's primary location. This is identical to the first parent group.
record
location with name	get	text or missing value	The full primary location of the record including its name (/ in names is replaced with \/).
record
locking
[synonyms: locked]	get/set	boolean	The locking of a record. Read-only in case of audit-proof databases.
record
longitude	get/set	real	The longitude in degrees of a record.
record
meta data
[synonyms: metadata]	get	dictionary or missing value	Document metadata (e.g. of PDF & RTF documents, web pages or emails) of a record as a dictionary containing key-value pairs.
Keys:

kMDItemTitle (string) : Title of document.
kMDItemHeadline (string) : Headline of document.
kMDItemSubject (string) : Subject of document, e.g. an email.
kMDItemDescription (string) : Description of document, e.g. a web page.
kMDItemCopyright (string) : Copyright of document, e.g. a web page.
kMDItemComment (string) : Comment of document, e.g. a rich text.
kMDItemURL (string) : URL of document.
kMDItemCreator (string) : Creator of document, e.g. a PDF.
kMDItemProducer (string) : Producer of document, e.g. a PDF.
kMDItemComposer (string) : Composer of document, e.g. an MP file3.
kMDItemAlbum (string) : Album of document, e.g. an MP file3.
kMDItemKeywords (comma-separated string) : Keywords of document.
kMDItemOrganizations (comma-separated string) : Organizations of document.
kMDItemContributors (comma-separated string) : Contributors of document.
kMDItemEditors (comma-separated string) : Editors of documen.
kMDItemPublishers (comma-separated string) : Publishers of document.
kMDItemAuthors (comma-separated string) : Authors of document, e.g. sender of an email.
kMDItemAuthorEmailAddresses (comma-separated string) : Email addresses of authors of document, e.g. sender of an email.
kMDItemRecipients (comma-separated string) : Recipients of document, e.g. an email.
kMDItemRecipientEmailAddresses (comma-separated string) : Email addresses of recipients of document, e.g. an email.
kMDItemEmailAddresses (comma-separated string) : Email addresses of document.

record
MIME type	get	text or missing value	The (proposed) MIME type of a record.
record
modification date	get/set	date or missing value	The modification date of a record. Read-only in case of audit-proof databases.
record
name	get/set	text	The name of a record.
record
name without date	get	text or missing value	The name of a record without any dates.
record
name without extension	get	text or missing value	The name of a record without a file extension (independent of settings).
record
newest document date	get	date or missing value	Newest date extracted from text of document, e.g. a scan.
record
number of duplicates	get	integer	The number of duplicates of a record.
record
number of hits	get/set	integer	The number of hits of a record.
record
number of replicants	get	integer	The number of replicants of a record.
record
oldest document date	get	date or missing value	Oldest date extracted from text of document, e.g. a scan.
record
opening date	get	date or missing value	Date when a content was opened the last time or when a feed was refreshed the last time.
record
original name	get	text	The original name of a record.
record
page count	get	integer	The page count of a record. Currently only supported by PDF documents.
record
paginated PDF	get	raw data or missing value	A printed/converted PDF of the record.
record
path	get/set	text or missing value	The POSIX file path of a record. Only the path of external records can be changed. Not accessible at all in case of audit-proof databases.
record
pending	get	boolean	Flag whether the (latest) contents of a record haven't been downloaded from a sync location yet.
record
plain text	get/set	text or missing value	The plain text of a record. Read-only in case of audit-proof databases.
record
proposed filename	get	text or missing value	The proposed filename for a record.
record
rating	get/set	integer	Rating (0-5) of a record.
record
record type
[synonyms: type]	get	data type	The type of a record. WARNING: Don't use string conversions of this type for comparisons, this might fail due to known scripting issues of macOS.
record
reference URL	get	text or missing value	The URL (x-devonthink-item://...) to reference/link back to a record.
Optional parameters:

app: Used in conjunction with the openexternally parameter, specify the name of the app to open the referenced file with, e.g., x-devonthink-item://UUID?openexternally=1&app=Preview.
length: Specify the number of characters from the start parameter. Used in selection links.
line: Directly jumps to the specified paragraph/line in a plain/rich text or Markdown document. Usage: line=<integer>.
openexternally: Opens the referenced item in the system default application, e.g., opening a PDF in Preview. Used with a value of 1, e.g., openexternally=1.
page:  Opens a PDF to the specified page. Usage: page=<integer>.
reveal:  Reveals an item in the item list instead of opening it in a new window. Usage: reveal=1.
row: Directly jumps to the specified row in a sheet. Usage: row=<integer>.
search:  Directly jumps to the first occurrence of the search string in the specified document. Usage: search=<string>.
section:  Directly jumps to the specified section in a Markdown document. Usage: section=<string>.
start:  Specify the starting character on the current page. Used in selection links.
time:  Directly jumps to the specified time in seconds in a video or audio document. Usage: time=<float>.

record
reminder	get/set	reminder or missing value	Reminder of a record.
record
rich text
[synonyms: text]	get/set	rich text or missing value	The rich text of the record (see extended text suite). Changes are only supported in case of RTF/RTFD documents and not by audit-proof databases.
record
score	get	real	The score of the last comparison, classification or search (value between 0.0 and 1.0) or undefined otherwise.
record
size	get	integer	The size of a record in bytes.
record
source	get/set	text or missing value	The HTML/XML source of a record if available or the record converted to HTML if possible. Read-only in case of audit-proof databases.
record
tag type	get	tag type	The tag type of a record.
record
tags	get/set	array or missing value	The tags of a record. Setting accepts both strings and parents.
record
thumbnail	get/set	any or missing value	The thumbnail of a record. Setting supports both raw data and strings containing paths or URLs.
record
unread	get/set	boolean	The unread flag of a record.
record
URL	get/set	text or missing value	The URL of a record. Read-only in case of bookmarks in audit-proof databases.
record
uuid	get	text or missing value	The unique and persistent identifier of a record.
record
web archive	get	raw data or missing value	The web archive of a record if available or the record converted to web archive if possible.
record
width	get	number	The width of an image or PDF document in pixels or points.
record
word count	get	integer	The word count of a record.
record
ELEMENTS
Element
Access
Key Forms
Description
child	get/ make/ delete	by name
by index
by range
by whose/where
by unique ID

record
incoming reference	get/ make/ delete	by name
by index
by range
by whose/where
by unique ID

record
incoming Wiki reference	get/ make/ delete	by name
by index
by range
by whose/where
by unique ID

record
outgoing reference	get/ make/ delete	by name
by index
by range
by whose/where
by unique ID

record
outgoing Wiki reference	get/ make/ delete	by name
by index
by range
by whose/where
by unique ID

record
parent	get/ make/ delete	by name
by index
by range
by whose/where
by unique ID

record
SUPERCLASS
The outgoing reference class inherits elements and properties from record.
WHERE USED
The outgoing reference class is used in the following ways:
element of child class
element of content class
element of incoming reference class
element of incoming Wiki reference class
element of outgoing reference class
element of outgoing Wiki reference class
element of parent class
element of record class
element of selected record class
element of smart parent class
element of tag group class
outgoing Wiki reference
outgoing Wiki reference (noun), pl outgoing Wiki referencesAn automatic Wiki reference to another record. This depends on the current Wiki linking settings.
PROPERTIES
Property
Access
Type
Description
addition date	get	date or missing value	Date when the record was added to the database.
record
aliases	get/set	text or missing value	Wiki aliases (separated by commas or semicolons) of a record.
record
all document dates	get	list of date or missing value	All dates extracted from text of document, e.g. a scan.
record
altitude	get/set	real	The altitude in metres of a record.
record
annotation	get/set	content or missing value	Annotation of a record. Only plain & rich text and Markdown documents are supported. Read-only in case of audit-proof databases.
record
annotation count	get	integer	The number of annotations. Supported by HTML pages, formatted notes, web archives, PDF, rich text & Markdown documents.
record
attached script	get/set	text or missing value	POSIX path of script attached to a record.
record
attachment count	get	integer	The number of attachments. Currently only supported for RTFD documents and emails.
record
attributes change date	get/set	date or missing value	The change date of the record's attributes.
record
bates number	get/set	integer	Bates number.
record
cells	get/set	list of array	The cells of a sheet. This is a list of rows, each row contains a list of string values for the various colums. Read-only in case of audit-proof databases.
record
character count	get	integer	The character count of a record.
record
color	get/set	RGB color or missing value	The color of a record. Currently only supported by tags & groups.
record
columns	get	list of text or missing value	The column names of a sheet.
record
comment	get/set	text or missing value	The comment of a record.
record
content hash	get	text or missing value	Stored SHA1 hash of files and document packages.
record
creation date	get/set	date or missing value	The creation date of a record. Read-only in case of audit-proof databases.
record
custom meta data
[synonyms: custom metadata]	get/set	dictionary or missing value	User-defined metadata of a record as a dictionary containing key-value pairs. Setting a value for an unknown key automatically adds a definition to Settings > Data.
record
data	get/set	raw data or missing value	The file data of a record. Currently only supported by PDF documents, images, rich text documents and web archives. Read-only in case of audit-proof databases.
record
database	get	database or missing value	The database of the record.
record
date	get/set	date or missing value	The (creation/modification) date of a record. Read-only in case of audit-proof databases.
record
digital object identifier	get	text or missing value	Digital object identifier (DOI) extracted from text of document, e.g. a scanned receipt, or from the title.
record
dimensions	get	list of integer	The width and height of an image or PDF document in pixels or points.
record
document amount	get	text or missing value	Amount extracted from text of document, e.g. a scanned receipt.
record
document date	get	date or missing value	First date extracted from text of document, e.g. a scan.
record
document name	get	text or missing value	Name based on text or properties of document
record
dpi	get	number	The resultion of an image in dpi.
record
duplicates	get	list of record or missing value	The duplicates of a record (only other instances, not including the record).
record
duration	get	real	The duration of audio and video files.
record
encrypted	get	boolean	Specifies if a document is encrypted or not. Currently only supported by PDF documents.
record
exclude from chat	get/set	boolean	Exclude group or record from chat.
record
exclude from classification	get/set	boolean	Exclude group or record from classifying.
record
exclude from search	get/set	boolean	Exclude group or record from searching.
record
exclude from see also	get/set	boolean	Exclude record from see also.
record
exclude from tagging	get/set	boolean	Exclude group from tagging.
record
exclude from Wiki linking	get/set	boolean	Exclude record from automatic Wiki linking.
record
filename	get	text or missing value	The current filename of a record.
record
flag
[synonyms: flagged, state]	get/set	boolean	The flag of a record.
record
geolocation	get/set	text or missing value	The human readable geogr. location of a record.
record
height	get	number	The height of an image or PDF document in pixels or points.
record
id	get	integer	The scripting identifier of a record. Optimizing or closing a database might modify this identifier.
record
image	get/set	any or missing value	The image or PDF document of a record. Setting supports both raw data and strings containing paths or URLs. Read-only in case of audit-proof databases.
record
indexed	get	boolean	Indexed or imported record.
record
international standard book number	get	text or missing value	International standard book number (ISBN) extracted from text of document, e.g. a scanned receipt, or from the title.
record
interval	get/set	real	Refresh interval of a feed. Currently overriden by settings.
record
kind	get	text or missing value	The human readable and localized kind of a record. WARNING: Don't use this to check the type of a record, otherwise your script might fail depending on the version and the localization.
record
label	get/set	integer	Index of label (0-7) of a record.
record
latitude	get/set	real	The latitude in degrees of a record.
record
location	get	text or missing value	The primary location of the record in the database as a POSIX path (/ in names is replaced with \/).
record
location group	get	parent or missing value	The group of the record's primary location. This is identical to the first parent group.
record
location with name	get	text or missing value	The full primary location of the record including its name (/ in names is replaced with \/).
record
locking
[synonyms: locked]	get/set	boolean	The locking of a record. Read-only in case of audit-proof databases.
record
longitude	get/set	real	The longitude in degrees of a record.
record
meta data
[synonyms: metadata]	get	dictionary or missing value	Document metadata (e.g. of PDF & RTF documents, web pages or emails) of a record as a dictionary containing key-value pairs.
Keys:

kMDItemTitle (string) : Title of document.
kMDItemHeadline (string) : Headline of document.
kMDItemSubject (string) : Subject of document, e.g. an email.
kMDItemDescription (string) : Description of document, e.g. a web page.
kMDItemCopyright (string) : Copyright of document, e.g. a web page.
kMDItemComment (string) : Comment of document, e.g. a rich text.
kMDItemURL (string) : URL of document.
kMDItemCreator (string) : Creator of document, e.g. a PDF.
kMDItemProducer (string) : Producer of document, e.g. a PDF.
kMDItemComposer (string) : Composer of document, e.g. an MP file3.
kMDItemAlbum (string) : Album of document, e.g. an MP file3.
kMDItemKeywords (comma-separated string) : Keywords of document.
kMDItemOrganizations (comma-separated string) : Organizations of document.
kMDItemContributors (comma-separated string) : Contributors of document.
kMDItemEditors (comma-separated string) : Editors of documen.
kMDItemPublishers (comma-separated string) : Publishers of document.
kMDItemAuthors (comma-separated string) : Authors of document, e.g. sender of an email.
kMDItemAuthorEmailAddresses (comma-separated string) : Email addresses of authors of document, e.g. sender of an email.
kMDItemRecipients (comma-separated string) : Recipients of document, e.g. an email.
kMDItemRecipientEmailAddresses (comma-separated string) : Email addresses of recipients of document, e.g. an email.
kMDItemEmailAddresses (comma-separated string) : Email addresses of document.

record
MIME type	get	text or missing value	The (proposed) MIME type of a record.
record
modification date	get/set	date or missing value	The modification date of a record. Read-only in case of audit-proof databases.
record
name	get/set	text	The name of a record.
record
name without date	get	text or missing value	The name of a record without any dates.
record
name without extension	get	text or missing value	The name of a record without a file extension (independent of settings).
record
newest document date	get	date or missing value	Newest date extracted from text of document, e.g. a scan.
record
number of duplicates	get	integer	The number of duplicates of a record.
record
number of hits	get/set	integer	The number of hits of a record.
record
number of replicants	get	integer	The number of replicants of a record.
record
oldest document date	get	date or missing value	Oldest date extracted from text of document, e.g. a scan.
record
opening date	get	date or missing value	Date when a content was opened the last time or when a feed was refreshed the last time.
record
original name	get	text	The original name of a record.
record
page count	get	integer	The page count of a record. Currently only supported by PDF documents.
record
paginated PDF	get	raw data or missing value	A printed/converted PDF of the record.
record
path	get/set	text or missing value	The POSIX file path of a record. Only the path of external records can be changed. Not accessible at all in case of audit-proof databases.
record
pending	get	boolean	Flag whether the (latest) contents of a record haven't been downloaded from a sync location yet.
record
plain text	get/set	text or missing value	The plain text of a record. Read-only in case of audit-proof databases.
record
proposed filename	get	text or missing value	The proposed filename for a record.
record
rating	get/set	integer	Rating (0-5) of a record.
record
record type
[synonyms: type]	get	data type	The type of a record. WARNING: Don't use string conversions of this type for comparisons, this might fail due to known scripting issues of macOS.
record
reference URL	get	text or missing value	The URL (x-devonthink-item://...) to reference/link back to a record.
Optional parameters:

app: Used in conjunction with the openexternally parameter, specify the name of the app to open the referenced file with, e.g., x-devonthink-item://UUID?openexternally=1&app=Preview.
length: Specify the number of characters from the start parameter. Used in selection links.
line: Directly jumps to the specified paragraph/line in a plain/rich text or Markdown document. Usage: line=<integer>.
openexternally: Opens the referenced item in the system default application, e.g., opening a PDF in Preview. Used with a value of 1, e.g., openexternally=1.
page:  Opens a PDF to the specified page. Usage: page=<integer>.
reveal:  Reveals an item in the item list instead of opening it in a new window. Usage: reveal=1.
row: Directly jumps to the specified row in a sheet. Usage: row=<integer>.
search:  Directly jumps to the first occurrence of the search string in the specified document. Usage: search=<string>.
section:  Directly jumps to the specified section in a Markdown document. Usage: section=<string>.
start:  Specify the starting character on the current page. Used in selection links.
time:  Directly jumps to the specified time in seconds in a video or audio document. Usage: time=<float>.

record
reminder	get/set	reminder or missing value	Reminder of a record.
record
rich text
[synonyms: text]	get/set	rich text or missing value	The rich text of the record (see extended text suite). Changes are only supported in case of RTF/RTFD documents and not by audit-proof databases.
record
score	get	real	The score of the last comparison, classification or search (value between 0.0 and 1.0) or undefined otherwise.
record
size	get	integer	The size of a record in bytes.
record
source	get/set	text or missing value	The HTML/XML source of a record if available or the record converted to HTML if possible. Read-only in case of audit-proof databases.
record
tag type	get	tag type	The tag type of a record.
record
tags	get/set	array or missing value	The tags of a record. Setting accepts both strings and parents.
record
thumbnail	get/set	any or missing value	The thumbnail of a record. Setting supports both raw data and strings containing paths or URLs.
record
unread	get/set	boolean	The unread flag of a record.
record
URL	get/set	text or missing value	The URL of a record. Read-only in case of bookmarks in audit-proof databases.
record
uuid	get	text or missing value	The unique and persistent identifier of a record.
record
web archive	get	raw data or missing value	The web archive of a record if available or the record converted to web archive if possible.
record
width	get	number	The width of an image or PDF document in pixels or points.
record
word count	get	integer	The word count of a record.
record
ELEMENTS
Element
Access
Key Forms
Description
child	get/ make/ delete	by name
by index
by range
by whose/where
by unique ID

record
incoming reference	get/ make/ delete	by name
by index
by range
by whose/where
by unique ID

record
incoming Wiki reference	get/ make/ delete	by name
by index
by range
by whose/where
by unique ID

record
outgoing reference	get/ make/ delete	by name
by index
by range
by whose/where
by unique ID

record
outgoing Wiki reference	get/ make/ delete	by name
by index
by range
by whose/where
by unique ID

record
parent	get/ make/ delete	by name
by index
by range
by whose/where
by unique ID

record
SUPERCLASS
The outgoing Wiki reference class inherits elements and properties from record.
WHERE USED
The outgoing Wiki reference class is used in the following ways:
element of child class
element of content class
element of incoming reference class
element of incoming Wiki reference class
element of outgoing reference class
element of outgoing Wiki reference class
element of parent class
element of record class
element of selected record class
element of smart parent class
element of tag group class
parent
parent (noun), pl parents[synonyms: database group, database parent]A parent (either group, feed or tag) of a record.
PROPERTIES
Property
Access
Type
Description
addition date	get	date or missing value	Date when the record was added to the database.
record
aliases	get/set	text or missing value	Wiki aliases (separated by commas or semicolons) of a record.
record
all document dates	get	list of date or missing value	All dates extracted from text of document, e.g. a scan.
record
altitude	get/set	real	The altitude in metres of a record.
record
annotation	get/set	content or missing value	Annotation of a record. Only plain & rich text and Markdown documents are supported. Read-only in case of audit-proof databases.
record
annotation count	get	integer	The number of annotations. Supported by HTML pages, formatted notes, web archives, PDF, rich text & Markdown documents.
record
attached script	get/set	text or missing value	POSIX path of script attached to a record.
record
attachment count	get	integer	The number of attachments. Currently only supported for RTFD documents and emails.
record
attributes change date	get/set	date or missing value	The change date of the record's attributes.
record
bates number	get/set	integer	Bates number.
record
cells	get/set	list of array	The cells of a sheet. This is a list of rows, each row contains a list of string values for the various colums. Read-only in case of audit-proof databases.
record
character count	get	integer	The character count of a record.
record
color	get/set	RGB color or missing value	The color of a record. Currently only supported by tags & groups.
record
columns	get	list of text or missing value	The column names of a sheet.
record
comment	get/set	text or missing value	The comment of a record.
record
content hash	get	text or missing value	Stored SHA1 hash of files and document packages.
record
creation date	get/set	date or missing value	The creation date of a record. Read-only in case of audit-proof databases.
record
custom meta data
[synonyms: custom metadata]	get/set	dictionary or missing value	User-defined metadata of a record as a dictionary containing key-value pairs. Setting a value for an unknown key automatically adds a definition to Settings > Data.
record
data	get/set	raw data or missing value	The file data of a record. Currently only supported by PDF documents, images, rich text documents and web archives. Read-only in case of audit-proof databases.
record
database	get	database or missing value	The database of the record.
record
date	get/set	date or missing value	The (creation/modification) date of a record. Read-only in case of audit-proof databases.
record
digital object identifier	get	text or missing value	Digital object identifier (DOI) extracted from text of document, e.g. a scanned receipt, or from the title.
record
dimensions	get	list of integer	The width and height of an image or PDF document in pixels or points.
record
document amount	get	text or missing value	Amount extracted from text of document, e.g. a scanned receipt.
record
document date	get	date or missing value	First date extracted from text of document, e.g. a scan.
record
document name	get	text or missing value	Name based on text or properties of document
record
dpi	get	number	The resultion of an image in dpi.
record
duplicates	get	list of record or missing value	The duplicates of a record (only other instances, not including the record).
record
duration	get	real	The duration of audio and video files.
record
encrypted	get	boolean	Specifies if a document is encrypted or not. Currently only supported by PDF documents.
record
exclude from chat	get/set	boolean	Exclude group or record from chat.
record
exclude from classification	get/set	boolean	Exclude group or record from classifying.
record
exclude from search	get/set	boolean	Exclude group or record from searching.
record
exclude from see also	get/set	boolean	Exclude record from see also.
record
exclude from tagging	get/set	boolean	Exclude group from tagging.
record
exclude from Wiki linking	get/set	boolean	Exclude record from automatic Wiki linking.
record
filename	get	text or missing value	The current filename of a record.
record
flag
[synonyms: flagged, state]	get/set	boolean	The flag of a record.
record
geolocation	get/set	text or missing value	The human readable geogr. location of a record.
record
height	get	number	The height of an image or PDF document in pixels or points.
record
id	get	integer	The scripting identifier of a record. Optimizing or closing a database might modify this identifier.
record
image	get/set	any or missing value	The image or PDF document of a record. Setting supports both raw data and strings containing paths or URLs. Read-only in case of audit-proof databases.
record
indexed	get	boolean	Indexed or imported record.
record
international standard book number	get	text or missing value	International standard book number (ISBN) extracted from text of document, e.g. a scanned receipt, or from the title.
record
interval	get/set	real	Refresh interval of a feed. Currently overriden by settings.
record
kind	get	text or missing value	The human readable and localized kind of a record. WARNING: Don't use this to check the type of a record, otherwise your script might fail depending on the version and the localization.
record
label	get/set	integer	Index of label (0-7) of a record.
record
latitude	get/set	real	The latitude in degrees of a record.
record
location	get	text or missing value	The primary location of the record in the database as a POSIX path (/ in names is replaced with \/).
record
location group	get	parent or missing value	The group of the record's primary location. This is identical to the first parent group.
record
location with name	get	text or missing value	The full primary location of the record including its name (/ in names is replaced with \/).
record
locking
[synonyms: locked]	get/set	boolean	The locking of a record. Read-only in case of audit-proof databases.
record
longitude	get/set	real	The longitude in degrees of a record.
record
meta data
[synonyms: metadata]	get	dictionary or missing value	Document metadata (e.g. of PDF & RTF documents, web pages or emails) of a record as a dictionary containing key-value pairs.
Keys:

kMDItemTitle (string) : Title of document.
kMDItemHeadline (string) : Headline of document.
kMDItemSubject (string) : Subject of document, e.g. an email.
kMDItemDescription (string) : Description of document, e.g. a web page.
kMDItemCopyright (string) : Copyright of document, e.g. a web page.
kMDItemComment (string) : Comment of document, e.g. a rich text.
kMDItemURL (string) : URL of document.
kMDItemCreator (string) : Creator of document, e.g. a PDF.
kMDItemProducer (string) : Producer of document, e.g. a PDF.
kMDItemComposer (string) : Composer of document, e.g. an MP file3.
kMDItemAlbum (string) : Album of document, e.g. an MP file3.
kMDItemKeywords (comma-separated string) : Keywords of document.
kMDItemOrganizations (comma-separated string) : Organizations of document.
kMDItemContributors (comma-separated string) : Contributors of document.
kMDItemEditors (comma-separated string) : Editors of documen.
kMDItemPublishers (comma-separated string) : Publishers of document.
kMDItemAuthors (comma-separated string) : Authors of document, e.g. sender of an email.
kMDItemAuthorEmailAddresses (comma-separated string) : Email addresses of authors of document, e.g. sender of an email.
kMDItemRecipients (comma-separated string) : Recipients of document, e.g. an email.
kMDItemRecipientEmailAddresses (comma-separated string) : Email addresses of recipients of document, e.g. an email.
kMDItemEmailAddresses (comma-separated string) : Email addresses of document.

record
MIME type	get	text or missing value	The (proposed) MIME type of a record.
record
modification date	get/set	date or missing value	The modification date of a record. Read-only in case of audit-proof databases.
record
name	get/set	text	The name of a record.
record
name without date	get	text or missing value	The name of a record without any dates.
record
name without extension	get	text or missing value	The name of a record without a file extension (independent of settings).
record
newest document date	get	date or missing value	Newest date extracted from text of document, e.g. a scan.
record
number of duplicates	get	integer	The number of duplicates of a record.
record
number of hits	get/set	integer	The number of hits of a record.
record
number of replicants	get	integer	The number of replicants of a record.
record
oldest document date	get	date or missing value	Oldest date extracted from text of document, e.g. a scan.
record
opening date	get	date or missing value	Date when a content was opened the last time or when a feed was refreshed the last time.
record
original name	get	text	The original name of a record.
record
page count	get	integer	The page count of a record. Currently only supported by PDF documents.
record
paginated PDF	get	raw data or missing value	A printed/converted PDF of the record.
record
path	get/set	text or missing value	The POSIX file path of a record. Only the path of external records can be changed. Not accessible at all in case of audit-proof databases.
record
pending	get	boolean	Flag whether the (latest) contents of a record haven't been downloaded from a sync location yet.
record
plain text	get/set	text or missing value	The plain text of a record. Read-only in case of audit-proof databases.
record
proposed filename	get	text or missing value	The proposed filename for a record.
record
rating	get/set	integer	Rating (0-5) of a record.
record
record type
[synonyms: type]	get	data type	The type of a record. WARNING: Don't use string conversions of this type for comparisons, this might fail due to known scripting issues of macOS.
record
reference URL	get	text or missing value	The URL (x-devonthink-item://...) to reference/link back to a record.
Optional parameters:

app: Used in conjunction with the openexternally parameter, specify the name of the app to open the referenced file with, e.g., x-devonthink-item://UUID?openexternally=1&app=Preview.
length: Specify the number of characters from the start parameter. Used in selection links.
line: Directly jumps to the specified paragraph/line in a plain/rich text or Markdown document. Usage: line=<integer>.
openexternally: Opens the referenced item in the system default application, e.g., opening a PDF in Preview. Used with a value of 1, e.g., openexternally=1.
page:  Opens a PDF to the specified page. Usage: page=<integer>.
reveal:  Reveals an item in the item list instead of opening it in a new window. Usage: reveal=1.
row: Directly jumps to the specified row in a sheet. Usage: row=<integer>.
search:  Directly jumps to the first occurrence of the search string in the specified document. Usage: search=<string>.
section:  Directly jumps to the specified section in a Markdown document. Usage: section=<string>.
start:  Specify the starting character on the current page. Used in selection links.
time:  Directly jumps to the specified time in seconds in a video or audio document. Usage: time=<float>.

record
reminder	get/set	reminder or missing value	Reminder of a record.
record
rich text
[synonyms: text]	get/set	rich text or missing value	The rich text of the record (see extended text suite). Changes are only supported in case of RTF/RTFD documents and not by audit-proof databases.
record
score	get	real	The score of the last comparison, classification or search (value between 0.0 and 1.0) or undefined otherwise.
record
size	get	integer	The size of a record in bytes.
record
source	get/set	text or missing value	The HTML/XML source of a record if available or the record converted to HTML if possible. Read-only in case of audit-proof databases.
record
tag type	get	tag type	The tag type of a record.
record
tags	get/set	array or missing value	The tags of a record. Setting accepts both strings and parents.
record
thumbnail	get/set	any or missing value	The thumbnail of a record. Setting supports both raw data and strings containing paths or URLs.
record
unread	get/set	boolean	The unread flag of a record.
record
URL	get/set	text or missing value	The URL of a record. Read-only in case of bookmarks in audit-proof databases.
record
uuid	get	text or missing value	The unique and persistent identifier of a record.
record
web archive	get	raw data or missing value	The web archive of a record if available or the record converted to web archive if possible.
record
width	get	number	The width of an image or PDF document in pixels or points.
record
word count	get	integer	The word count of a record.
record
ELEMENTS
Element
Access
Key Forms
Description
child	get/ make/ delete	by name
by index
by range
by whose/where
by unique ID

record
incoming reference	get/ make/ delete	by name
by index
by range
by whose/where
by unique ID

record
incoming Wiki reference	get/ make/ delete	by name
by index
by range
by whose/where
by unique ID

record
outgoing reference	get/ make/ delete	by name
by index
by range
by whose/where
by unique ID

record
outgoing Wiki reference	get/ make/ delete	by name
by index
by range
by whose/where
by unique ID

record
parent	get/ make/ delete	by name
by index
by range
by whose/where
by unique ID

record
SUPERCLASS
The parent class inherits elements and properties from record.
SUBCLASSES
The tag group class inherits the elements and properties of the parent class.
WHERE USED
The parent class is used in the following ways:
element of child class
element of content class
element of database class
element of incoming reference class
element of incoming Wiki reference class
element of outgoing reference class
element of outgoing Wiki reference class
element of parent class
element of record class
element of selected record class
element of smart parent class
element of tag group class
result of classify command
result of create location command
result of display group selector command
annotations group property of the database class/record
current group property of the application class/record
current group property of the database class/record
from parameter of the move command/event
in parameter of the merge command/event
in parameter of the search command/event
in parameter of the summarize annotations of command/event
in parameter of the summarize contents of command/event
in parameter of the summarize mentions of command/event
in parameter of the convert command/event
in parameter of the create formatted note from command/event
in parameter of the create location command/event
in parameter of the create Markdown from command/event
in parameter of the create PDF document from command/event
in parameter of the create record with command/event
in parameter of the create web document from command/event
in parameter of the delete command/event
in parameter of the exists record at command/event
in parameter of the get record at command/event
incoming group property of the application class/record
incoming group property of the database class/record
location group property of the record class/record
preferred import destination property of the application class/record
root property of the main window class/record
root property of the database class/record
search group property of the smart parent class/record
selected group property of the group selector result class/record
tags group property of the database class/record
to parameter of the index path command/event
to parameter of the move command/event
to parameter of the import template command/event
to parameter of the convert image command/event
to parameter of the ocr command/event
to parameter of the paste clipboard command/event
to parameter of the replicate command/event
to parameter of the duplicate command/event
to parameter of the import attachments of command/event
to parameter of the import path command/event
trash group property of the database class/record
versions group property of the database class/record
record
record (noun), pl records[synonyms: database item, database record]A database record.
PROPERTIES
Property
Access
Type
Description
addition date	get	date or missing value	Date when the record was added to the database.
aliases	get/set	text or missing value	Wiki aliases (separated by commas or semicolons) of a record.
all document dates	get	list of date or missing value	All dates extracted from text of document, e.g. a scan.
altitude	get/set	real	The altitude in metres of a record.
annotation	get/set	content or missing value	Annotation of a record. Only plain & rich text and Markdown documents are supported. Read-only in case of audit-proof databases.
annotation count	get	integer	The number of annotations. Supported by HTML pages, formatted notes, web archives, PDF, rich text & Markdown documents.
attached script	get/set	text or missing value	POSIX path of script attached to a record.
attachment count	get	integer	The number of attachments. Currently only supported for RTFD documents and emails.
attributes change date	get/set	date or missing value	The change date of the record's attributes.
bates number	get/set	integer	Bates number.
cells	get/set	list of array	The cells of a sheet. This is a list of rows, each row contains a list of string values for the various colums. Read-only in case of audit-proof databases.
character count	get	integer	The character count of a record.
color	get/set	RGB color or missing value	The color of a record. Currently only supported by tags & groups.
columns	get	list of text or missing value	The column names of a sheet.
comment	get/set	text or missing value	The comment of a record.
content hash	get	text or missing value	Stored SHA1 hash of files and document packages.
creation date	get/set	date or missing value	The creation date of a record. Read-only in case of audit-proof databases.
custom meta data
[synonyms: custom metadata]	get/set	dictionary or missing value	User-defined metadata of a record as a dictionary containing key-value pairs. Setting a value for an unknown key automatically adds a definition to Settings > Data.
data	get/set	raw data or missing value	The file data of a record. Currently only supported by PDF documents, images, rich text documents and web archives. Read-only in case of audit-proof databases.
database	get	database or missing value	The database of the record.
date	get/set	date or missing value	The (creation/modification) date of a record. Read-only in case of audit-proof databases.
digital object identifier	get	text or missing value	Digital object identifier (DOI) extracted from text of document, e.g. a scanned receipt, or from the title.
dimensions	get	list of integer	The width and height of an image or PDF document in pixels or points.
document amount	get	text or missing value	Amount extracted from text of document, e.g. a scanned receipt.
document date	get	date or missing value	First date extracted from text of document, e.g. a scan.
document name	get	text or missing value	Name based on text or properties of document
dpi	get	number	The resultion of an image in dpi.
duplicates	get	list of record or missing value	The duplicates of a record (only other instances, not including the record).
duration	get	real	The duration of audio and video files.
encrypted	get	boolean	Specifies if a document is encrypted or not. Currently only supported by PDF documents.
exclude from chat	get/set	boolean	Exclude group or record from chat.
exclude from classification	get/set	boolean	Exclude group or record from classifying.
exclude from search	get/set	boolean	Exclude group or record from searching.
exclude from see also	get/set	boolean	Exclude record from see also.
exclude from tagging	get/set	boolean	Exclude group from tagging.
exclude from Wiki linking	get/set	boolean	Exclude record from automatic Wiki linking.
filename	get	text or missing value	The current filename of a record.
flag
[synonyms: flagged, state]	get/set	boolean	The flag of a record.
geolocation	get/set	text or missing value	The human readable geogr. location of a record.
height	get	number	The height of an image or PDF document in pixels or points.
id	get	integer	The scripting identifier of a record. Optimizing or closing a database might modify this identifier.
image	get/set	any or missing value	The image or PDF document of a record. Setting supports both raw data and strings containing paths or URLs. Read-only in case of audit-proof databases.
indexed	get	boolean	Indexed or imported record.
international standard book number	get	text or missing value	International standard book number (ISBN) extracted from text of document, e.g. a scanned receipt, or from the title.
interval	get/set	real	Refresh interval of a feed. Currently overriden by settings.
kind	get	text or missing value	The human readable and localized kind of a record. WARNING: Don't use this to check the type of a record, otherwise your script might fail depending on the version and the localization.
label	get/set	integer	Index of label (0-7) of a record.
latitude	get/set	real	The latitude in degrees of a record.
location	get	text or missing value	The primary location of the record in the database as a POSIX path (/ in names is replaced with \/).
location group	get	parent or missing value	The group of the record's primary location. This is identical to the first parent group.
location with name	get	text or missing value	The full primary location of the record including its name (/ in names is replaced with \/).
locking
[synonyms: locked]	get/set	boolean	The locking of a record. Read-only in case of audit-proof databases.
longitude	get/set	real	The longitude in degrees of a record.
meta data
[synonyms: metadata]	get	dictionary or missing value	Document metadata (e.g. of PDF & RTF documents, web pages or emails) of a record as a dictionary containing key-value pairs.
Keys:

kMDItemTitle (string) : Title of document.
kMDItemHeadline (string) : Headline of document.
kMDItemSubject (string) : Subject of document, e.g. an email.
kMDItemDescription (string) : Description of document, e.g. a web page.
kMDItemCopyright (string) : Copyright of document, e.g. a web page.
kMDItemComment (string) : Comment of document, e.g. a rich text.
kMDItemURL (string) : URL of document.
kMDItemCreator (string) : Creator of document, e.g. a PDF.
kMDItemProducer (string) : Producer of document, e.g. a PDF.
kMDItemComposer (string) : Composer of document, e.g. an MP file3.
kMDItemAlbum (string) : Album of document, e.g. an MP file3.
kMDItemKeywords (comma-separated string) : Keywords of document.
kMDItemOrganizations (comma-separated string) : Organizations of document.
kMDItemContributors (comma-separated string) : Contributors of document.
kMDItemEditors (comma-separated string) : Editors of documen.
kMDItemPublishers (comma-separated string) : Publishers of document.
kMDItemAuthors (comma-separated string) : Authors of document, e.g. sender of an email.
kMDItemAuthorEmailAddresses (comma-separated string) : Email addresses of authors of document, e.g. sender of an email.
kMDItemRecipients (comma-separated string) : Recipients of document, e.g. an email.
kMDItemRecipientEmailAddresses (comma-separated string) : Email addresses of recipients of document, e.g. an email.
kMDItemEmailAddresses (comma-separated string) : Email addresses of document.
MIME type	get	text or missing value	The (proposed) MIME type of a record.
modification date	get/set	date or missing value	The modification date of a record. Read-only in case of audit-proof databases.
name	get/set	text	The name of a record.
name without date	get	text or missing value	The name of a record without any dates.
name without extension	get	text or missing value	The name of a record without a file extension (independent of settings).
newest document date	get	date or missing value	Newest date extracted from text of document, e.g. a scan.
number of duplicates	get	integer	The number of duplicates of a record.
number of hits	get/set	integer	The number of hits of a record.
number of replicants	get	integer	The number of replicants of a record.
oldest document date	get	date or missing value	Oldest date extracted from text of document, e.g. a scan.
opening date	get	date or missing value	Date when a content was opened the last time or when a feed was refreshed the last time.
original name	get	text	The original name of a record.
page count	get	integer	The page count of a record. Currently only supported by PDF documents.
paginated PDF	get	raw data or missing value	A printed/converted PDF of the record.
path	get/set	text or missing value	The POSIX file path of a record. Only the path of external records can be changed. Not accessible at all in case of audit-proof databases.
pending	get	boolean	Flag whether the (latest) contents of a record haven't been downloaded from a sync location yet.
plain text	get/set	text or missing value	The plain text of a record. Read-only in case of audit-proof databases.
proposed filename	get	text or missing value	The proposed filename for a record.
rating	get/set	integer	Rating (0-5) of a record.
record type
[synonyms: type]	get	data type	The type of a record. WARNING: Don't use string conversions of this type for comparisons, this might fail due to known scripting issues of macOS.
reference URL	get	text or missing value	The URL (x-devonthink-item://...) to reference/link back to a record.
Optional parameters:

app: Used in conjunction with the openexternally parameter, specify the name of the app to open the referenced file with, e.g., x-devonthink-item://UUID?openexternally=1&app=Preview.
length: Specify the number of characters from the start parameter. Used in selection links.
line: Directly jumps to the specified paragraph/line in a plain/rich text or Markdown document. Usage: line=<integer>.
openexternally: Opens the referenced item in the system default application, e.g., opening a PDF in Preview. Used with a value of 1, e.g., openexternally=1.
page:  Opens a PDF to the specified page. Usage: page=<integer>.
reveal:  Reveals an item in the item list instead of opening it in a new window. Usage: reveal=1.
row: Directly jumps to the specified row in a sheet. Usage: row=<integer>.
search:  Directly jumps to the first occurrence of the search string in the specified document. Usage: search=<string>.
section:  Directly jumps to the specified section in a Markdown document. Usage: section=<string>.
start:  Specify the starting character on the current page. Used in selection links.
time:  Directly jumps to the specified time in seconds in a video or audio document. Usage: time=<float>.
reminder	get/set	reminder or missing value	Reminder of a record.
rich text
[synonyms: text]	get/set	rich text or missing value	The rich text of the record (see extended text suite). Changes are only supported in case of RTF/RTFD documents and not by audit-proof databases.
score	get	real	The score of the last comparison, classification or search (value between 0.0 and 1.0) or undefined otherwise.
size	get	integer	The size of a record in bytes.
source	get/set	text or missing value	The HTML/XML source of a record if available or the record converted to HTML if possible. Read-only in case of audit-proof databases.
tag type	get	tag type	The tag type of a record.
tags	get/set	array or missing value	The tags of a record. Setting accepts both strings and parents.
thumbnail	get/set	any or missing value	The thumbnail of a record. Setting supports both raw data and strings containing paths or URLs.
unread	get/set	boolean	The unread flag of a record.
URL	get/set	text or missing value	The URL of a record. Read-only in case of bookmarks in audit-proof databases.
uuid	get	text or missing value	The unique and persistent identifier of a record.
web archive	get	raw data or missing value	The web archive of a record if available or the record converted to web archive if possible.
width	get	number	The width of an image or PDF document in pixels or points.
word count	get	integer	The word count of a record.
ELEMENTS
Element
Access
Key Forms
Description
child	get/ make/ delete	by name
by index
by range
by whose/where
by unique ID
incoming reference	get/ make/ delete	by name
by index
by range
by whose/where
by unique ID
incoming Wiki reference	get/ make/ delete	by name
by index
by range
by whose/where
by unique ID
outgoing reference	get/ make/ delete	by name
by index
by range
by whose/where
by unique ID
outgoing Wiki reference	get/ make/ delete	by name
by index
by range
by whose/where
by unique ID
parent	get/ make/ delete	by name
by index
by range
by whose/where
by unique ID
SUBCLASSES
The child, content, incoming reference, incoming Wiki reference, outgoing reference, outgoing Wiki reference, parent, selected record, and smart parent classes inherit the elements and properties of the record class.
WHERE USED
The record class is used in the following ways:
result of merge command
result of move command
result of lookup records with content hash command
result of lookup records with URL command
result of lookup records with path command
result of lookup records with tags command
result of index path command
result of lookup records with comment command
result of paste clipboard command
result of replicate command
result of save version of command
result of search command
result of create record with command
result of duplicate command
result of get record at command
result of get record with id command
result of get record with uuid command
result of get versions of command
result of import attachments of command
result of import path command
result of import template command
duplicates property of the record class/record
for parameter of the create thumbnail command/event
from parameter of the get custom meta data command/event
of parameter of the update thumbnail command/event
of parameter of the delete thumbnail command/event
record parameter of the log message command/event
record parameter of the move command/event
record parameter of the move into database command/event
record parameter of the move to external folder command/event
record parameter of the open tab for command/event
record parameter of the open window for command/event
record parameter of the perform smart rule command/event
record parameter of the refresh command/event
record parameter of the replicate command/event
record parameter of the save version of command/event
record parameter of the synchronize command/event
record parameter of the update command/event
record parameter of the add reading list command/event
record parameter of the classify command/event
record parameter of the delete command/event
record parameter of the duplicate command/event
record parameter of the export command/event
record parameter of the export tags of command/event
record parameter of the export website command/event
record parameter of the extract keywords from command/event
record parameter of the get chat response for message command/event
record parameter of the get versions of command/event
record parameter of the import attachments of command/event
records parameter of the merge command/event
search results property of the main window class/record
selection property of the main window class/record
selection property of the application class/record
to parameter of the add custom meta data command/event
to parameter of the add reminder command/event
version parameter of the restore record with command/event
reminder
reminder (noun), pl remindersA reminder of a record.
PROPERTIES
Property
Access
Type
Description
alarm	get/set	reminder alarm	Alarm of reminder.
alarm string	get/set	text or missing value	Name of sound, text to speak, text of alert/notification, source/path of script or recipient of email. Text can also contain placeholders.
day of week	get/set	reminder day	Scheduled day of week.
due date	get/set	date or missing value	Due date.
interval	get/set	integer	Interval of schedule (every n hours, days, weeks, months or years)
masc	get/set	integer	Bitmap specifying scheduled days of week/month or scheduled months of year.
schedule	get/set	reminder schedule	Schedule of reminder.
week of month	get/set	reminder week	Scheduled week of month.
WHERE USED
The reminder class is used in the following ways:
result of add reminder command
reminder property of the record class/record
SEE ALSO
add reminder				
selected record
selected record (noun), pl selected recordsA selected record.
PROPERTIES
Property
Access
Type
Description
addition date	get	date or missing value	Date when the record was added to the database.
record
aliases	get/set	text or missing value	Wiki aliases (separated by commas or semicolons) of a record.
record
all document dates	get	list of date or missing value	All dates extracted from text of document, e.g. a scan.
record
altitude	get/set	real	The altitude in metres of a record.
record
annotation	get/set	content or missing value	Annotation of a record. Only plain & rich text and Markdown documents are supported. Read-only in case of audit-proof databases.
record
annotation count	get	integer	The number of annotations. Supported by HTML pages, formatted notes, web archives, PDF, rich text & Markdown documents.
record
attached script	get/set	text or missing value	POSIX path of script attached to a record.
record
attachment count	get	integer	The number of attachments. Currently only supported for RTFD documents and emails.
record
attributes change date	get/set	date or missing value	The change date of the record's attributes.
record
bates number	get/set	integer	Bates number.
record
cells	get/set	list of array	The cells of a sheet. This is a list of rows, each row contains a list of string values for the various colums. Read-only in case of audit-proof databases.
record
character count	get	integer	The character count of a record.
record
color	get/set	RGB color or missing value	The color of a record. Currently only supported by tags & groups.
record
columns	get	list of text or missing value	The column names of a sheet.
record
comment	get/set	text or missing value	The comment of a record.
record
content hash	get	text or missing value	Stored SHA1 hash of files and document packages.
record
creation date	get/set	date or missing value	The creation date of a record. Read-only in case of audit-proof databases.
record
custom meta data
[synonyms: custom metadata]	get/set	dictionary or missing value	User-defined metadata of a record as a dictionary containing key-value pairs. Setting a value for an unknown key automatically adds a definition to Settings > Data.
record
data	get/set	raw data or missing value	The file data of a record. Currently only supported by PDF documents, images, rich text documents and web archives. Read-only in case of audit-proof databases.
record
database	get	database or missing value	The database of the record.
record
date	get/set	date or missing value	The (creation/modification) date of a record. Read-only in case of audit-proof databases.
record
digital object identifier	get	text or missing value	Digital object identifier (DOI) extracted from text of document, e.g. a scanned receipt, or from the title.
record
dimensions	get	list of integer	The width and height of an image or PDF document in pixels or points.
record
document amount	get	text or missing value	Amount extracted from text of document, e.g. a scanned receipt.
record
document date	get	date or missing value	First date extracted from text of document, e.g. a scan.
record
document name	get	text or missing value	Name based on text or properties of document
record
dpi	get	number	The resultion of an image in dpi.
record
duplicates	get	list of record or missing value	The duplicates of a record (only other instances, not including the record).
record
duration	get	real	The duration of audio and video files.
record
encrypted	get	boolean	Specifies if a document is encrypted or not. Currently only supported by PDF documents.
record
exclude from chat	get/set	boolean	Exclude group or record from chat.
record
exclude from classification	get/set	boolean	Exclude group or record from classifying.
record
exclude from search	get/set	boolean	Exclude group or record from searching.
record
exclude from see also	get/set	boolean	Exclude record from see also.
record
exclude from tagging	get/set	boolean	Exclude group from tagging.
record
exclude from Wiki linking	get/set	boolean	Exclude record from automatic Wiki linking.
record
filename	get	text or missing value	The current filename of a record.
record
flag
[synonyms: flagged, state]	get/set	boolean	The flag of a record.
record
geolocation	get/set	text or missing value	The human readable geogr. location of a record.
record
height	get	number	The height of an image or PDF document in pixels or points.
record
id	get	integer	The scripting identifier of a record. Optimizing or closing a database might modify this identifier.
record
image	get/set	any or missing value	The image or PDF document of a record. Setting supports both raw data and strings containing paths or URLs. Read-only in case of audit-proof databases.
record
indexed	get	boolean	Indexed or imported record.
record
international standard book number	get	text or missing value	International standard book number (ISBN) extracted from text of document, e.g. a scanned receipt, or from the title.
record
interval	get/set	real	Refresh interval of a feed. Currently overriden by settings.
record
kind	get	text or missing value	The human readable and localized kind of a record. WARNING: Don't use this to check the type of a record, otherwise your script might fail depending on the version and the localization.
record
label	get/set	integer	Index of label (0-7) of a record.
record
latitude	get/set	real	The latitude in degrees of a record.
record
location	get	text or missing value	The primary location of the record in the database as a POSIX path (/ in names is replaced with \/).
record
location group	get	parent or missing value	The group of the record's primary location. This is identical to the first parent group.
record
location with name	get	text or missing value	The full primary location of the record including its name (/ in names is replaced with \/).
record
locking
[synonyms: locked]	get/set	boolean	The locking of a record. Read-only in case of audit-proof databases.
record
longitude	get/set	real	The longitude in degrees of a record.
record
meta data
[synonyms: metadata]	get	dictionary or missing value	Document metadata (e.g. of PDF & RTF documents, web pages or emails) of a record as a dictionary containing key-value pairs.
Keys:

kMDItemTitle (string) : Title of document.
kMDItemHeadline (string) : Headline of document.
kMDItemSubject (string) : Subject of document, e.g. an email.
kMDItemDescription (string) : Description of document, e.g. a web page.
kMDItemCopyright (string) : Copyright of document, e.g. a web page.
kMDItemComment (string) : Comment of document, e.g. a rich text.
kMDItemURL (string) : URL of document.
kMDItemCreator (string) : Creator of document, e.g. a PDF.
kMDItemProducer (string) : Producer of document, e.g. a PDF.
kMDItemComposer (string) : Composer of document, e.g. an MP file3.
kMDItemAlbum (string) : Album of document, e.g. an MP file3.
kMDItemKeywords (comma-separated string) : Keywords of document.
kMDItemOrganizations (comma-separated string) : Organizations of document.
kMDItemContributors (comma-separated string) : Contributors of document.
kMDItemEditors (comma-separated string) : Editors of documen.
kMDItemPublishers (comma-separated string) : Publishers of document.
kMDItemAuthors (comma-separated string) : Authors of document, e.g. sender of an email.
kMDItemAuthorEmailAddresses (comma-separated string) : Email addresses of authors of document, e.g. sender of an email.
kMDItemRecipients (comma-separated string) : Recipients of document, e.g. an email.
kMDItemRecipientEmailAddresses (comma-separated string) : Email addresses of recipients of document, e.g. an email.
kMDItemEmailAddresses (comma-separated string) : Email addresses of document.

record
MIME type	get	text or missing value	The (proposed) MIME type of a record.
record
modification date	get/set	date or missing value	The modification date of a record. Read-only in case of audit-proof databases.
record
name	get/set	text	The name of a record.
record
name without date	get	text or missing value	The name of a record without any dates.
record
name without extension	get	text or missing value	The name of a record without a file extension (independent of settings).
record
newest document date	get	date or missing value	Newest date extracted from text of document, e.g. a scan.
record
number of duplicates	get	integer	The number of duplicates of a record.
record
number of hits	get/set	integer	The number of hits of a record.
record
number of replicants	get	integer	The number of replicants of a record.
record
oldest document date	get	date or missing value	Oldest date extracted from text of document, e.g. a scan.
record
opening date	get	date or missing value	Date when a content was opened the last time or when a feed was refreshed the last time.
record
original name	get	text	The original name of a record.
record
page count	get	integer	The page count of a record. Currently only supported by PDF documents.
record
paginated PDF	get	raw data or missing value	A printed/converted PDF of the record.
record
path	get/set	text or missing value	The POSIX file path of a record. Only the path of external records can be changed. Not accessible at all in case of audit-proof databases.
record
pending	get	boolean	Flag whether the (latest) contents of a record haven't been downloaded from a sync location yet.
record
plain text	get/set	text or missing value	The plain text of a record. Read-only in case of audit-proof databases.
record
proposed filename	get	text or missing value	The proposed filename for a record.
record
rating	get/set	integer	Rating (0-5) of a record.
record
record type
[synonyms: type]	get	data type	The type of a record. WARNING: Don't use string conversions of this type for comparisons, this might fail due to known scripting issues of macOS.
record
reference URL	get	text or missing value	The URL (x-devonthink-item://...) to reference/link back to a record.
Optional parameters:

app: Used in conjunction with the openexternally parameter, specify the name of the app to open the referenced file with, e.g., x-devonthink-item://UUID?openexternally=1&app=Preview.
length: Specify the number of characters from the start parameter. Used in selection links.
line: Directly jumps to the specified paragraph/line in a plain/rich text or Markdown document. Usage: line=<integer>.
openexternally: Opens the referenced item in the system default application, e.g., opening a PDF in Preview. Used with a value of 1, e.g., openexternally=1.
page:  Opens a PDF to the specified page. Usage: page=<integer>.
reveal:  Reveals an item in the item list instead of opening it in a new window. Usage: reveal=1.
row: Directly jumps to the specified row in a sheet. Usage: row=<integer>.
search:  Directly jumps to the first occurrence of the search string in the specified document. Usage: search=<string>.
section:  Directly jumps to the specified section in a Markdown document. Usage: section=<string>.
start:  Specify the starting character on the current page. Used in selection links.
time:  Directly jumps to the specified time in seconds in a video or audio document. Usage: time=<float>.

record
reminder	get/set	reminder or missing value	Reminder of a record.
record
rich text
[synonyms: text]	get/set	rich text or missing value	The rich text of the record (see extended text suite). Changes are only supported in case of RTF/RTFD documents and not by audit-proof databases.
record
score	get	real	The score of the last comparison, classification or search (value between 0.0 and 1.0) or undefined otherwise.
record
size	get	integer	The size of a record in bytes.
record
source	get/set	text or missing value	The HTML/XML source of a record if available or the record converted to HTML if possible. Read-only in case of audit-proof databases.
record
tag type	get	tag type	The tag type of a record.
record
tags	get/set	array or missing value	The tags of a record. Setting accepts both strings and parents.
record
thumbnail	get/set	any or missing value	The thumbnail of a record. Setting supports both raw data and strings containing paths or URLs.
record
unread	get/set	boolean	The unread flag of a record.
record
URL	get/set	text or missing value	The URL of a record. Read-only in case of bookmarks in audit-proof databases.
record
uuid	get	text or missing value	The unique and persistent identifier of a record.
record
web archive	get	raw data or missing value	The web archive of a record if available or the record converted to web archive if possible.
record
width	get	number	The width of an image or PDF document in pixels or points.
record
word count	get	integer	The word count of a record.
record
ELEMENTS
Element
Access
Key Forms
Description
child	get/ make/ delete	by name
by index
by range
by whose/where
by unique ID

record
incoming reference	get/ make/ delete	by name
by index
by range
by whose/where
by unique ID

record
incoming Wiki reference	get/ make/ delete	by name
by index
by range
by whose/where
by unique ID

record
outgoing reference	get/ make/ delete	by name
by index
by range
by whose/where
by unique ID

record
outgoing Wiki reference	get/ make/ delete	by name
by index
by range
by whose/where
by unique ID

record
parent	get/ make/ delete	by name
by index
by range
by whose/where
by unique ID

record
SUPERCLASS
The selected record class inherits elements and properties from record.
WHERE USED
The selected record class is used in the following ways:
element of application class
element of main window class
smart parent
smart parent (noun), pl smart parentsA smart group.
PROPERTIES
Property
Access
Type
Description
addition date	get	date or missing value	Date when the record was added to the database.
record
aliases	get/set	text or missing value	Wiki aliases (separated by commas or semicolons) of a record.
record
all document dates	get	list of date or missing value	All dates extracted from text of document, e.g. a scan.
record
altitude	get/set	real	The altitude in metres of a record.
record
annotation	get/set	content or missing value	Annotation of a record. Only plain & rich text and Markdown documents are supported. Read-only in case of audit-proof databases.
record
annotation count	get	integer	The number of annotations. Supported by HTML pages, formatted notes, web archives, PDF, rich text & Markdown documents.
record
attached script	get/set	text or missing value	POSIX path of script attached to a record.
record
attachment count	get	integer	The number of attachments. Currently only supported for RTFD documents and emails.
record
attributes change date	get/set	date or missing value	The change date of the record's attributes.
record
bates number	get/set	integer	Bates number.
record
cells	get/set	list of array	The cells of a sheet. This is a list of rows, each row contains a list of string values for the various colums. Read-only in case of audit-proof databases.
record
character count	get	integer	The character count of a record.
record
color	get/set	RGB color or missing value	The color of a record. Currently only supported by tags & groups.
record
columns	get	list of text or missing value	The column names of a sheet.
record
comment	get/set	text or missing value	The comment of a record.
record
content hash	get	text or missing value	Stored SHA1 hash of files and document packages.
record
creation date	get/set	date or missing value	The creation date of a record. Read-only in case of audit-proof databases.
record
custom meta data
[synonyms: custom metadata]	get/set	dictionary or missing value	User-defined metadata of a record as a dictionary containing key-value pairs. Setting a value for an unknown key automatically adds a definition to Settings > Data.
record
data	get/set	raw data or missing value	The file data of a record. Currently only supported by PDF documents, images, rich text documents and web archives. Read-only in case of audit-proof databases.
record
database	get	database or missing value	The database of the record.
record
date	get/set	date or missing value	The (creation/modification) date of a record. Read-only in case of audit-proof databases.
record
digital object identifier	get	text or missing value	Digital object identifier (DOI) extracted from text of document, e.g. a scanned receipt, or from the title.
record
dimensions	get	list of integer	The width and height of an image or PDF document in pixels or points.
record
document amount	get	text or missing value	Amount extracted from text of document, e.g. a scanned receipt.
record
document date	get	date or missing value	First date extracted from text of document, e.g. a scan.
record
document name	get	text or missing value	Name based on text or properties of document
record
dpi	get	number	The resultion of an image in dpi.
record
duplicates	get	list of record or missing value	The duplicates of a record (only other instances, not including the record).
record
duration	get	real	The duration of audio and video files.
record
encrypted	get	boolean	Specifies if a document is encrypted or not. Currently only supported by PDF documents.
record
exclude from chat	get/set	boolean	Exclude group or record from chat.
record
exclude from classification	get/set	boolean	Exclude group or record from classifying.
record
exclude from search	get/set	boolean	Exclude group or record from searching.
record
exclude from see also	get/set	boolean	Exclude record from see also.
record
exclude from tagging	get/set	boolean	Exclude group from tagging.
record
exclude from Wiki linking	get/set	boolean	Exclude record from automatic Wiki linking.
record
exclude subgroups	get/set	boolean	Exclude subgroups of the search group from searching.
filename	get	text or missing value	The current filename of a record.
record
flag
[synonyms: flagged, state]	get/set	boolean	The flag of a record.
record
geolocation	get/set	text or missing value	The human readable geogr. location of a record.
record
height	get	number	The height of an image or PDF document in pixels or points.
record
highlight occurrences	get/set	boolean	Highlight found occurrences in documents.
id	get	integer	The scripting identifier of a record. Optimizing or closing a database might modify this identifier.
record
image	get/set	any or missing value	The image or PDF document of a record. Setting supports both raw data and strings containing paths or URLs. Read-only in case of audit-proof databases.
record
indexed	get	boolean	Indexed or imported record.
record
international standard book number	get	text or missing value	International standard book number (ISBN) extracted from text of document, e.g. a scanned receipt, or from the title.
record
interval	get/set	real	Refresh interval of a feed. Currently overriden by settings.
record
kind	get	text or missing value	The human readable and localized kind of a record. WARNING: Don't use this to check the type of a record, otherwise your script might fail depending on the version and the localization.
record
label	get/set	integer	Index of label (0-7) of a record.
record
latitude	get/set	real	The latitude in degrees of a record.
record
location	get	text or missing value	The primary location of the record in the database as a POSIX path (/ in names is replaced with \/).
record
location group	get	parent or missing value	The group of the record's primary location. This is identical to the first parent group.
record
location with name	get	text or missing value	The full primary location of the record including its name (/ in names is replaced with \/).
record
locking
[synonyms: locked]	get/set	boolean	The locking of a record. Read-only in case of audit-proof databases.
record
longitude	get/set	real	The longitude in degrees of a record.
record
meta data
[synonyms: metadata]	get	dictionary or missing value	Document metadata (e.g. of PDF & RTF documents, web pages or emails) of a record as a dictionary containing key-value pairs.
Keys:

kMDItemTitle (string) : Title of document.
kMDItemHeadline (string) : Headline of document.
kMDItemSubject (string) : Subject of document, e.g. an email.
kMDItemDescription (string) : Description of document, e.g. a web page.
kMDItemCopyright (string) : Copyright of document, e.g. a web page.
kMDItemComment (string) : Comment of document, e.g. a rich text.
kMDItemURL (string) : URL of document.
kMDItemCreator (string) : Creator of document, e.g. a PDF.
kMDItemProducer (string) : Producer of document, e.g. a PDF.
kMDItemComposer (string) : Composer of document, e.g. an MP file3.
kMDItemAlbum (string) : Album of document, e.g. an MP file3.
kMDItemKeywords (comma-separated string) : Keywords of document.
kMDItemOrganizations (comma-separated string) : Organizations of document.
kMDItemContributors (comma-separated string) : Contributors of document.
kMDItemEditors (comma-separated string) : Editors of documen.
kMDItemPublishers (comma-separated string) : Publishers of document.
kMDItemAuthors (comma-separated string) : Authors of document, e.g. sender of an email.
kMDItemAuthorEmailAddresses (comma-separated string) : Email addresses of authors of document, e.g. sender of an email.
kMDItemRecipients (comma-separated string) : Recipients of document, e.g. an email.
kMDItemRecipientEmailAddresses (comma-separated string) : Email addresses of recipients of document, e.g. an email.
kMDItemEmailAddresses (comma-separated string) : Email addresses of document.

record
MIME type	get	text or missing value	The (proposed) MIME type of a record.
record
modification date	get/set	date or missing value	The modification date of a record. Read-only in case of audit-proof databases.
record
name	get/set	text	The name of a record.
record
name without date	get	text or missing value	The name of a record without any dates.
record
name without extension	get	text or missing value	The name of a record without a file extension (independent of settings).
record
newest document date	get	date or missing value	Newest date extracted from text of document, e.g. a scan.
record
number of duplicates	get	integer	The number of duplicates of a record.
record
number of hits	get/set	integer	The number of hits of a record.
record
number of replicants	get	integer	The number of replicants of a record.
record
oldest document date	get	date or missing value	Oldest date extracted from text of document, e.g. a scan.
record
opening date	get	date or missing value	Date when a content was opened the last time or when a feed was refreshed the last time.
record
original name	get	text	The original name of a record.
record
page count	get	integer	The page count of a record. Currently only supported by PDF documents.
record
paginated PDF	get	raw data or missing value	A printed/converted PDF of the record.
record
path	get/set	text or missing value	The POSIX file path of a record. Only the path of external records can be changed. Not accessible at all in case of audit-proof databases.
record
pending	get	boolean	Flag whether the (latest) contents of a record haven't been downloaded from a sync location yet.
record
plain text	get/set	text or missing value	The plain text of a record. Read-only in case of audit-proof databases.
record
proposed filename	get	text or missing value	The proposed filename for a record.
record
rating	get/set	integer	Rating (0-5) of a record.
record
record type
[synonyms: type]	get	data type	The type of a record. WARNING: Don't use string conversions of this type for comparisons, this might fail due to known scripting issues of macOS.
record
reference URL	get	text or missing value	The URL (x-devonthink-item://...) to reference/link back to a record.
Optional parameters:

app: Used in conjunction with the openexternally parameter, specify the name of the app to open the referenced file with, e.g., x-devonthink-item://UUID?openexternally=1&app=Preview.
length: Specify the number of characters from the start parameter. Used in selection links.
line: Directly jumps to the specified paragraph/line in a plain/rich text or Markdown document. Usage: line=<integer>.
openexternally: Opens the referenced item in the system default application, e.g., opening a PDF in Preview. Used with a value of 1, e.g., openexternally=1.
page:  Opens a PDF to the specified page. Usage: page=<integer>.
reveal:  Reveals an item in the item list instead of opening it in a new window. Usage: reveal=1.
row: Directly jumps to the specified row in a sheet. Usage: row=<integer>.
search:  Directly jumps to the first occurrence of the search string in the specified document. Usage: search=<string>.
section:  Directly jumps to the specified section in a Markdown document. Usage: section=<string>.
start:  Specify the starting character on the current page. Used in selection links.
time:  Directly jumps to the specified time in seconds in a video or audio document. Usage: time=<float>.

record
reminder	get/set	reminder or missing value	Reminder of a record.
record
rich text
[synonyms: text]	get/set	rich text or missing value	The rich text of the record (see extended text suite). Changes are only supported in case of RTF/RTFD documents and not by audit-proof databases.
record
score	get	real	The score of the last comparison, classification or search (value between 0.0 and 1.0) or undefined otherwise.
record
search group	get/set	parent or missing value	Group of the smart group to search in.
search predicates	get/set	text or missing value	A string representation of the conditions of the smart group.
size	get	integer	The size of a record in bytes.
record
source	get/set	text or missing value	The HTML/XML source of a record if available or the record converted to HTML if possible. Read-only in case of audit-proof databases.
record
tag type	get	tag type	The tag type of a record.
record
tags	get/set	array or missing value	The tags of a record. Setting accepts both strings and parents.
record
thumbnail	get/set	any or missing value	The thumbnail of a record. Setting supports both raw data and strings containing paths or URLs.
record
unread	get/set	boolean	The unread flag of a record.
record
URL	get/set	text or missing value	The URL of a record. Read-only in case of bookmarks in audit-proof databases.
record
uuid	get	text or missing value	The unique and persistent identifier of a record.
record
web archive	get	raw data or missing value	The web archive of a record if available or the record converted to web archive if possible.
record
width	get	number	The width of an image or PDF document in pixels or points.
record
word count	get	integer	The word count of a record.
record
ELEMENTS
Element
Access
Key Forms
Description
child	get/ make/ delete	by name
by index
by range
by whose/where
by unique ID

record
incoming reference	get/ make/ delete	by name
by index
by range
by whose/where
by unique ID

record
incoming Wiki reference	get/ make/ delete	by name
by index
by range
by whose/where
by unique ID

record
outgoing reference	get/ make/ delete	by name
by index
by range
by whose/where
by unique ID

record
outgoing Wiki reference	get/ make/ delete	by name
by index
by range
by whose/where
by unique ID

record
parent	get/ make/ delete	by name
by index
by range
by whose/where
by unique ID

record
SUPERCLASS
The smart parent class inherits elements and properties from record.
WHERE USED
The smart parent class is used in the following ways:
element of database class
tab
tab (noun), pl tabsA tab of a think window.
PROPERTIES
Property
Access
Type
Description
content record	get	content or missing value	The record of the visible document.
current line	get	integer	Zero-based index of current line.
current movie frame	get	raw data or missing value	Image of current movie frame.
current page	get/set	integer	Zero-based index of current PDF page.
current time	get/set	real	Time of current audio/video file.
database	get	database or missing value	The database of the tab.
id	get	integer	The unique identifier of the tab.
loading	get	boolean	Specifies if the current web page is still loading.
number of columns	get	integer	Number of columns of the current sheet.
number of rows	get	integer	Number of rows of the current sheet.
paginated PDF	get	raw data or missing value	A printed PDF with pagination of the visible document.
PDF	get	raw data or missing value	A PDF without pagination of the visible document retaining the screen layout.
plain text	get	text or missing value	The plain text of the tab.
reference URL	get	text or missing value	The URL (x-devonthink-item://...) to reference/link back to the current content record and its selection, page, frame etc.
rich text
[synonyms: text]	get/set	text, rich text or missing value	The rich text of the tab. Changes are only supported in case of RTF/RTFD documents. In addition, Markdown & HTML formatted input is supported too.
selected column	get/set	integer	Index (1...n) of selected column of the current sheet.
selected columns	get	list of integer	Indices (1...n) of selected columns of the current sheet.
selected row	get/set	integer	Index (1...n) of selected row of the current sheet.
selected rows	get	list of integer	Indices (1...n) of selected rows of the current sheet.
selected text	get/set	text, rich text or missing value	The rich text for the selection of the tab. Setting supports both text- and web-based documents, e.g. plain/rich text, Markdown documents or formatted notes. In addition, Markdown & HTML formatted input is supported too.
source	get	text or missing value	The HTML source of the current web page.
think window	get	think window or missing value	The think window of the tab.
URL	get/set	text or missing value	The URL of the current web page. In addition, setting the URL can be used to load a web page.
web archive	get	raw data or missing value	Web archive of the current web page.
COMMANDS
The tab class responds to the following commands:
Command
Description
add row	Add new row to current sheet.
close	Close a window, tab or database.
delete row at	Remove row at specified position from current sheet.
display chat dialog	Display a dialog to show the response for a chat prompt for the current document. Either the selected text or the complete document is used.
get cell at	Get content of cell at specified position of current sheet.
print	Print a window or tab.
save	Save a window or tab.
set cell at	Set cell at specified position of current sheet.
WHERE USED
The tab class is used in the following ways:
result of open tab for command
element of think window class
element of document window class
element of main window class
current tab property of the think window class/record
from parameter of the get cached data for URL command/event
tag group
tag group (noun), pl tag groupsA tag of a database.
PROPERTIES
Property
Access
Type
Description
addition date	get	date or missing value	Date when the record was added to the database.
record
aliases	get/set	text or missing value	Wiki aliases (separated by commas or semicolons) of a record.
record
all document dates	get	list of date or missing value	All dates extracted from text of document, e.g. a scan.
record
altitude	get/set	real	The altitude in metres of a record.
record
annotation	get/set	content or missing value	Annotation of a record. Only plain & rich text and Markdown documents are supported. Read-only in case of audit-proof databases.
record
annotation count	get	integer	The number of annotations. Supported by HTML pages, formatted notes, web archives, PDF, rich text & Markdown documents.
record
attached script	get/set	text or missing value	POSIX path of script attached to a record.
record
attachment count	get	integer	The number of attachments. Currently only supported for RTFD documents and emails.
record
attributes change date	get/set	date or missing value	The change date of the record's attributes.
record
bates number	get/set	integer	Bates number.
record
cells	get/set	list of array	The cells of a sheet. This is a list of rows, each row contains a list of string values for the various colums. Read-only in case of audit-proof databases.
record
character count	get	integer	The character count of a record.
record
color	get/set	RGB color or missing value	The color of a record. Currently only supported by tags & groups.
record
columns	get	list of text or missing value	The column names of a sheet.
record
comment	get/set	text or missing value	The comment of a record.
record
content hash	get	text or missing value	Stored SHA1 hash of files and document packages.
record
creation date	get/set	date or missing value	The creation date of a record. Read-only in case of audit-proof databases.
record
custom meta data
[synonyms: custom metadata]	get/set	dictionary or missing value	User-defined metadata of a record as a dictionary containing key-value pairs. Setting a value for an unknown key automatically adds a definition to Settings > Data.
record
data	get/set	raw data or missing value	The file data of a record. Currently only supported by PDF documents, images, rich text documents and web archives. Read-only in case of audit-proof databases.
record
database	get	database or missing value	The database of the record.
record
date	get/set	date or missing value	The (creation/modification) date of a record. Read-only in case of audit-proof databases.
record
digital object identifier	get	text or missing value	Digital object identifier (DOI) extracted from text of document, e.g. a scanned receipt, or from the title.
record
dimensions	get	list of integer	The width and height of an image or PDF document in pixels or points.
record
document amount	get	text or missing value	Amount extracted from text of document, e.g. a scanned receipt.
record
document date	get	date or missing value	First date extracted from text of document, e.g. a scan.
record
document name	get	text or missing value	Name based on text or properties of document
record
dpi	get	number	The resultion of an image in dpi.
record
duplicates	get	list of record or missing value	The duplicates of a record (only other instances, not including the record).
record
duration	get	real	The duration of audio and video files.
record
encrypted	get	boolean	Specifies if a document is encrypted or not. Currently only supported by PDF documents.
record
exclude from chat	get/set	boolean	Exclude group or record from chat.
record
exclude from classification	get/set	boolean	Exclude group or record from classifying.
record
exclude from search	get/set	boolean	Exclude group or record from searching.
record
exclude from see also	get/set	boolean	Exclude record from see also.
record
exclude from tagging	get/set	boolean	Exclude group from tagging.
record
exclude from Wiki linking	get/set	boolean	Exclude record from automatic Wiki linking.
record
filename	get	text or missing value	The current filename of a record.
record
flag
[synonyms: flagged, state]	get/set	boolean	The flag of a record.
record
geolocation	get/set	text or missing value	The human readable geogr. location of a record.
record
height	get	number	The height of an image or PDF document in pixels or points.
record
id	get	integer	The scripting identifier of a record. Optimizing or closing a database might modify this identifier.
record
image	get/set	any or missing value	The image or PDF document of a record. Setting supports both raw data and strings containing paths or URLs. Read-only in case of audit-proof databases.
record
indexed	get	boolean	Indexed or imported record.
record
international standard book number	get	text or missing value	International standard book number (ISBN) extracted from text of document, e.g. a scanned receipt, or from the title.
record
interval	get/set	real	Refresh interval of a feed. Currently overriden by settings.
record
kind	get	text or missing value	The human readable and localized kind of a record. WARNING: Don't use this to check the type of a record, otherwise your script might fail depending on the version and the localization.
record
label	get/set	integer	Index of label (0-7) of a record.
record
latitude	get/set	real	The latitude in degrees of a record.
record
location	get	text or missing value	The primary location of the record in the database as a POSIX path (/ in names is replaced with \/).
record
location group	get	parent or missing value	The group of the record's primary location. This is identical to the first parent group.
record
location with name	get	text or missing value	The full primary location of the record including its name (/ in names is replaced with \/).
record
locking
[synonyms: locked]	get/set	boolean	The locking of a record. Read-only in case of audit-proof databases.
record
longitude	get/set	real	The longitude in degrees of a record.
record
meta data
[synonyms: metadata]	get	dictionary or missing value	Document metadata (e.g. of PDF & RTF documents, web pages or emails) of a record as a dictionary containing key-value pairs.
Keys:

kMDItemTitle (string) : Title of document.
kMDItemHeadline (string) : Headline of document.
kMDItemSubject (string) : Subject of document, e.g. an email.
kMDItemDescription (string) : Description of document, e.g. a web page.
kMDItemCopyright (string) : Copyright of document, e.g. a web page.
kMDItemComment (string) : Comment of document, e.g. a rich text.
kMDItemURL (string) : URL of document.
kMDItemCreator (string) : Creator of document, e.g. a PDF.
kMDItemProducer (string) : Producer of document, e.g. a PDF.
kMDItemComposer (string) : Composer of document, e.g. an MP file3.
kMDItemAlbum (string) : Album of document, e.g. an MP file3.
kMDItemKeywords (comma-separated string) : Keywords of document.
kMDItemOrganizations (comma-separated string) : Organizations of document.
kMDItemContributors (comma-separated string) : Contributors of document.
kMDItemEditors (comma-separated string) : Editors of documen.
kMDItemPublishers (comma-separated string) : Publishers of document.
kMDItemAuthors (comma-separated string) : Authors of document, e.g. sender of an email.
kMDItemAuthorEmailAddresses (comma-separated string) : Email addresses of authors of document, e.g. sender of an email.
kMDItemRecipients (comma-separated string) : Recipients of document, e.g. an email.
kMDItemRecipientEmailAddresses (comma-separated string) : Email addresses of recipients of document, e.g. an email.
kMDItemEmailAddresses (comma-separated string) : Email addresses of document.

record
MIME type	get	text or missing value	The (proposed) MIME type of a record.
record
modification date	get/set	date or missing value	The modification date of a record. Read-only in case of audit-proof databases.
record
name	get/set	text	The name of a record.
record
name without date	get	text or missing value	The name of a record without any dates.
record
name without extension	get	text or missing value	The name of a record without a file extension (independent of settings).
record
newest document date	get	date or missing value	Newest date extracted from text of document, e.g. a scan.
record
number of duplicates	get	integer	The number of duplicates of a record.
record
number of hits	get/set	integer	The number of hits of a record.
record
number of replicants	get	integer	The number of replicants of a record.
record
oldest document date	get	date or missing value	Oldest date extracted from text of document, e.g. a scan.
record
opening date	get	date or missing value	Date when a content was opened the last time or when a feed was refreshed the last time.
record
original name	get	text	The original name of a record.
record
page count	get	integer	The page count of a record. Currently only supported by PDF documents.
record
paginated PDF	get	raw data or missing value	A printed/converted PDF of the record.
record
path	get/set	text or missing value	The POSIX file path of a record. Only the path of external records can be changed. Not accessible at all in case of audit-proof databases.
record
pending	get	boolean	Flag whether the (latest) contents of a record haven't been downloaded from a sync location yet.
record
plain text	get/set	text or missing value	The plain text of a record. Read-only in case of audit-proof databases.
record
proposed filename	get	text or missing value	The proposed filename for a record.
record
rating	get/set	integer	Rating (0-5) of a record.
record
record type
[synonyms: type]	get	data type	The type of a record. WARNING: Don't use string conversions of this type for comparisons, this might fail due to known scripting issues of macOS.
record
reference URL	get	text or missing value	The URL (x-devonthink-item://...) to reference/link back to a record.
Optional parameters:

app: Used in conjunction with the openexternally parameter, specify the name of the app to open the referenced file with, e.g., x-devonthink-item://UUID?openexternally=1&app=Preview.
length: Specify the number of characters from the start parameter. Used in selection links.
line: Directly jumps to the specified paragraph/line in a plain/rich text or Markdown document. Usage: line=<integer>.
openexternally: Opens the referenced item in the system default application, e.g., opening a PDF in Preview. Used with a value of 1, e.g., openexternally=1.
page:  Opens a PDF to the specified page. Usage: page=<integer>.
reveal:  Reveals an item in the item list instead of opening it in a new window. Usage: reveal=1.
row: Directly jumps to the specified row in a sheet. Usage: row=<integer>.
search:  Directly jumps to the first occurrence of the search string in the specified document. Usage: search=<string>.
section:  Directly jumps to the specified section in a Markdown document. Usage: section=<string>.
start:  Specify the starting character on the current page. Used in selection links.
time:  Directly jumps to the specified time in seconds in a video or audio document. Usage: time=<float>.

record
reminder	get/set	reminder or missing value	Reminder of a record.
record
rich text
[synonyms: text]	get/set	rich text or missing value	The rich text of the record (see extended text suite). Changes are only supported in case of RTF/RTFD documents and not by audit-proof databases.
record
score	get	real	The score of the last comparison, classification or search (value between 0.0 and 1.0) or undefined otherwise.
record
size	get	integer	The size of a record in bytes.
record
source	get/set	text or missing value	The HTML/XML source of a record if available or the record converted to HTML if possible. Read-only in case of audit-proof databases.
record
tag type	get	tag type	The tag type of a record.
record
tags	get/set	array or missing value	The tags of a record. Setting accepts both strings and parents.
record
thumbnail	get/set	any or missing value	The thumbnail of a record. Setting supports both raw data and strings containing paths or URLs.
record
unread	get/set	boolean	The unread flag of a record.
record
URL	get/set	text or missing value	The URL of a record. Read-only in case of bookmarks in audit-proof databases.
record
uuid	get	text or missing value	The unique and persistent identifier of a record.
record
web archive	get	raw data or missing value	The web archive of a record if available or the record converted to web archive if possible.
record
width	get	number	The width of an image or PDF document in pixels or points.
record
word count	get	integer	The word count of a record.
record
ELEMENTS
Element
Access
Key Forms
Description
child	get/ make/ delete	by name
by index
by range
by whose/where
by unique ID

record
incoming reference	get/ make/ delete	by name
by index
by range
by whose/where
by unique ID

record
incoming Wiki reference	get/ make/ delete	by name
by index
by range
by whose/where
by unique ID

record
outgoing reference	get/ make/ delete	by name
by index
by range
by whose/where
by unique ID

record
outgoing Wiki reference	get/ make/ delete	by name
by index
by range
by whose/where
by unique ID

record
parent	get/ make/ delete	by name
by index
by range
by whose/where
by unique ID

record
SUPERCLASS
The tag group class inherits elements and properties from parent.
WHERE USED
The tag group class is used in the following ways:
element of database class
think window
think window (noun), pl think windowsA document window or main window.
PROPERTIES
Property
Access
Type
Description
bounds	get/set	rectangle	The bounding rectangle of the window.
window
closeable	get	boolean	Does the window have a close button?
window
content record	get	content or missing value	The record of the visible document.
current line	get	integer	Zero-based index of current line.
current movie frame	get	raw data or missing value	Image of current movie frame.
current page	get/set	integer	Zero-based index of current PDF page.
current tab	get/set	tab or missing value	The selected tab of the think window.
current time	get/set	real	Time of current audio/video file.
database	get	database or missing value	The database of the window.
id	get	integer	The unique identifier of the window.
window
index	get/set	integer	The index of the window, ordered front to back.
window
loading	get	boolean	Specifies if the current web page is still loading.
miniaturizable	get	boolean	Does the window have a minimize button?
window
miniaturized	get/set	boolean	Is the window minimized right now?
window
name	get	text	The title of the window.
window
number of columns	get	integer	Number of columns of the current sheet.
number of rows	get	integer	Number of rows of the current sheet.
paginated PDF	get	raw data or missing value	A printed PDF with pagination of the visible document.
PDF	get	raw data or missing value	A PDF without pagination of the visible document retaining the screen layout.
plain text	get	text or missing value	The plain text of the window.
reference URL	get	text or missing value	The URL (x-devonthink-item://...) to reference/link back to the current content record and its selection, page, frame etc.
resizable	get	boolean	Can the window be resized?
window
rich text
[synonyms: text]	get/set	text, rich text or missing value	The rich text of the window. Changes are only supported in case of RTF/RTFD documents. In addition, Markdown & HTML formatted input is supported too.
selected column	get/set	integer	Index (1...n) of selected column of the current sheet.
selected columns	get	list of integer	Indices (1...n) of selected columns of the current sheet.
selected row	get/set	integer	Index (1...n) of selected row of the current sheet.
selected rows	get	list of integer	Indices (1...n) of selected rows of the current sheet.
selected text	get/set	text, rich text or missing value	The rich text for the selection of the window. Setting supports both text- and web-based documents, e.g. plain/rich text, Markdown documents or formatted notes. In addition, Markdown & HTML formatted input is supported too.
source	get	text or missing value	The HTML source of the current web page.
URL	get/set	text or missing value	The URL of the current web page. In addition, setting the URL can be used to load a web page.
visible	get/set	boolean	Is the window visible right now?
window
web archive	get	raw data or missing value	Web archive of the current web page.
zoomable	get	boolean	Does the window have a zoom button?
window
zoomed	get/set	boolean	Is the window zoomed right now?
window
ELEMENTS
Element
Access
Key Forms
Description
tab	get/ make/ delete	by index
by unique ID
COMMANDS
The think window class responds to the following commands:
Command
Description
add row	Add new row to current sheet.
close	Close a window, tab or database.
close	Close a window, tab or database. window
delete row at	Remove row at specified position from current sheet.
display chat dialog	Display a dialog to show the response for a chat prompt for the current document. Either the selected text or the complete document is used.
get cell at	Get content of cell at specified position of current sheet.
print	Print a window or tab.
print	Print a window or tab. window
save	Save a window or tab.
save	Save a window or tab. window
set cell at	Set cell at specified position of current sheet.
SUPERCLASS
The think window class inherits elements and properties from window.
SUBCLASSES
The document window and main window classes inherit the elements and properties of the think window class.
WHERE USED
The think window class is used in the following ways:
element of application class
result of open window for command
in parameter of the open tab for command/event
in parameter of the do JavaScript command/event
think window property of the tab class/record
ENUMERATIONS
chat engine
chat engine (enumeration)[synonyms: ChatEngine]
CONSTANTS
Constant
Description
ChatGPT	OpenAI's ChatGPT
Claude	Anthropic's Claude
Gemini	Google's Gemini
GPT4All	Nomic's GPT4All
LM Studio	Element Lab's LM Studio
Mistral AI	Mistral's AI
Ollama	
Perplexity	Perplexity's AI
WHERE USED
The chat engine enumeration is used in the following ways:
direct parameter to the get chat models for engine command/event
current chat engine property of the application class/record
engine parameter of the display chat dialog command/event
engine parameter of the get chat response for message command/event
comparison type
comparison type (enumeration)[synonyms: CompareType]
CONSTANTS
Constant
Description
data comparison	Uses text & metadata
tags comparison	Uses tags
WHERE USED
The comparison type enumeration is used in the following ways:
comparison parameter of the classify command/event
comparison parameter of the compare command/event
concordance sorting
concordance sorting (enumeration)[synonyms: WordsSorting]
CONSTANTS
Constant
Description
frequency	Sorted by frequency
weight	Sorted by weight
WHERE USED
The concordance sorting enumeration is used in the following ways:
sorted by parameter of the get concordance of command/event
convert type
convert type (enumeration)[synonyms: ConvertType]
CONSTANTS
Constant
Description
bookmark	
HTML
[synonyms: html]	HTML document
markdown	Markdown document
note	Formatted Note
PDF document	PDF document (Paginated)
PDF with annotations burnt in	PDF/A document with annotations burnt in
PDF without annotations	PDF document without annotations
rich	Rich text
simple	Plain text
single page PDF document	PDF document (One Page)
webarchive	Web Archive
WHERE USED
The convert type enumeration is used in the following ways:
to parameter of the convert command/event
data type
data type (enumeration)[synonyms: DataType]
CONSTANTS
Constant
Description
AppleScript file
[synonyms: script]	
bookmark	Internet or filesystem location
email	
feed	RSS, RDF or Atom feed
formatted note	
group	
HTML
[synonyms: html]	HTML document
markdown	Markdown document
multimedia
[synonyms: audio, quicktime, video]	Audio or video file
PDF document	
picture	
property list
[synonyms: plist]	
RTF
[synonyms: rtf]	RTF document
RTFD
[synonyms: rtfd]	RTFD document
sheet	
smart group	
txt	Text document
unknown	Unknown file
webarchive	Web Archive
XML
[synonyms: xml]	XML document
WHERE USED
The data type enumeration is used in the following ways:
record type property of the record class/record
image engine
image engine (enumeration)[synonyms: ImageEngine]
CONSTANTS
Constant
Description
DallE3	OpenAI's Dall-E 3
FluxPro	Black Forest Labs' Flux Pro
FluxProUltra	Black Forest Labs' Flux Pro Ultra
FluxSchnell	Black Forest Labs' Flux Schnell
GPTImage1	OpenAI's GPT-Image-1
Imagen3	Google's Imagen 3
Imagen3Fast	Google's Imagen 3 Fast
Imagen4	Google's Imagen 4
Recraft3	Recraft AI's Recraft 3
StableDiffusion	Stability AI's Stable Diffusion 3.5 Large
StableDiffusionTurbo	Stability AI's Stable Diffusion 3.5 Large Turbo
WHERE USED
The image engine enumeration is used in the following ways:
engine parameter of the download image for prompt command/event
reminder alarm
reminder alarm (enumeration)
CONSTANTS
Constant
Description
add to reading list	Add to reading list.
alert	Display alert.
dock	Bounce Dock icon.
embedded JXA script	Execute embedded script (JavaScript).
embedded script	Execute embedded script (AppleScript).
external script	Execute external script.
launch	Launch URL.
mail with attachment	Send mail with attachment.
mail with item link
[synonyms: mail]	Send mail with item link.
no alarm	No alarm.
notification	Display notification.
open externally	Open in default application.
open internally	Open in DEVONthink.
sound	Play sound.
speak	Speak text.
WHERE USED
The reminder alarm enumeration is used in the following ways:
alarm property of the reminder class/record
reminder day
reminder day (enumeration)
CONSTANTS
Constant
Description
any day	Any day.
friday	Friday.
monday	Monday.
no day	No day.
saturday	Saturday.
sunday	Sunday.
thursday	Thursday.
tuesday	Tuesday.
wednesday	Wednesday.
weekend	Weekend.
workdays	Workdays.
WHERE USED
The reminder day enumeration is used in the following ways:
day of week property of the reminder class/record
reminder schedule
reminder schedule (enumeration)[synonyms: ReminderSchedule]
CONSTANTS
Constant
Description
daily	Daily schedule.
hourly	Hourly schedule.
monthly	Monthly schedule.
never	No schedule.
once	One shot schedule.
weekly	Weekly schedule.
yearly	Yearly schedule.
WHERE USED
The reminder schedule enumeration is used in the following ways:
schedule property of the reminder class/record
reminder week
reminder week (enumeration)[synonyms: ReminderWeek]
CONSTANTS
Constant
Description
first week	First week of month.
fourth week	Fourth week of month.
last week	Last week of month.
no week	No week.
second week	Second week of month.
third week	Third week of month.
WHERE USED
The reminder week enumeration is used in the following ways:
week of month property of the reminder class/record
rule event
rule event (enumeration)[synonyms: RuleEvent]
CONSTANTS
Constant
Description
classify event	Event after classifying items.
clipping event	Event after clipping websites.
commenting event	Event after commenting items.
convert event	Event after converting items.
creation event	Event after creating items.
download event	Event after downloading items.
duplicate event	Event after duplicating items.
edit externally event	Event after editing items externally.
flagging event	Event after flagging items.
import event	Event after importing items.
imprint event	Event after imprinting items.
labelling event	Event after labelling items.
launch event	Event after launching the URL of items.
move event	Event after moving items.
move into database event
[synonyms: consolidation event]	Event after consolidating items.
move to external folder event
[synonyms: deconsolidation event]	Event after deconsolidating items.
no event	No event.
OCR event	Event after performing OCR.
open event	Event after opening items.
open externally event	Event after opening items externally.
rating event	Event after rating items.
rename event	Event after renaming items.
replicate event	Event after replicating items.
tagging event	Event after tagging items.
trashing event	Event before trashing items.
WHERE USED
The rule event enumeration is used in the following ways:
trigger parameter of the perform smart rule command/event
search comparison
search comparison (enumeration)[synonyms: SearchCompare]
CONSTANTS
Constant
Description
fuzzy	Fuzzy search.
no case	Case insensitive search.
no umlauts	Diacritics insensitive search.
related	Related search.
WHERE USED
The search comparison enumeration is used in the following ways:
comparison parameter of the search command/event
comparison parameter of the show search command/event
summary style
summary style (enumeration)
CONSTANTS
Constant
Description
custom summary	Custom summary.
key points summary	Key points summary.
list summary	Bullet list summary.
table summary	Table summary.
text summary	Text summary.
WHERE USED
The summary style enumeration is used in the following ways:
as parameter of the summarize contents of command/event
as parameter of the summarize text command/event
summary type
summary type (enumeration)
CONSTANTS
Constant
Description
markdown	Markdown document
rich	Rich text
sheet	
simple	Plain text
WHERE USED
The summary type enumeration is used in the following ways:
to parameter of the summarize annotations of command/event
to parameter of the summarize contents of command/event
to parameter of the summarize mentions of command/event
tag type
tag type (enumeration)[synonyms: TagType]
CONSTANTS
Constant
Description
group tag	A 'group' tag located outside of the tags group.
no tag	No tag (not a group or excluded from tagging).
ordinary tag	An 'ordinary' tag located inside of the tags group.
WHERE USED
The tag type enumeration is used in the following ways:
tag type property of the record class/record
update mode
update mode (enumeration)[synonyms: UpdateMode]
CONSTANTS
Constant
Description
appending	Append text.
inserting	Insert text
replacing	Replace text.
WHERE USED
The update mode enumeration is used in the following ways:
mode parameter of the update command/event
RECORDS
authentication result
authentication result (record)The result of the 'display authentication dialog' command
PROPERTIES
Property
Access
Type
Description
password	get/set	text	The password
user	get/set	text	The user
WHERE USED
The authentication result record is used in the following ways:
result of display authentication dialog command
SEE ALSO
display authentication dialog				
feed item
feed item (record)An item of a RSS, RDF, JSON or Atom feed
PROPERTIES
Property
Access
Type
Description
author	get/set	text	The item's author
description	get/set	text	The item's description
enclosures	get/set	array	The item's enclosures
guid	get/set	text	The item's unique identifier
last modified	get/set	text	The item's modification date
source	get/set	text	The item's HTML source
tags	get/set	array	The item's tags
text content	get/set	text	The item's content
title	get/set	text	The item's title
URL
[synonyms: link]	get/set	text	The item's URL
WHERE USED
The feed item record is used in the following ways:
result of get feed items of command
group selector result
group selector result (record)The result of the 'display group selector' command
PROPERTIES
Property
Access
Type
Description
name	get/set	text	The name
selected group	get/set	parent	The selected (destination) group
tags	get/set	list of text	The tags
WHERE USED
The group selector result record is used in the following ways:
result of display group selector command
SEE ALSO
display group selector				
HTTP response
HTTP response (record)Header fields of HTTP(s) response
PROPERTIES
Property
Access
Type
Description
charset	get/set	text	The charset.
content length	get/set	integer	The (expected) content length.
content type	get/set	text	The content type.
HTTP status	get/set	integer	The HTTP(s) status code.
last modified	get/set	date	The last modification date.
WHERE USED
The HTTP response record is used in the following ways:
last downloaded response property of the application class/record
reading list item
reading list item (record)An item of the reading list.
PROPERTIES
Property
Access
Type
Description
date	get/set	date	The item's date
title	get/set	text	The item's title
unread	get/set	boolean	The item's unread flag
URL	get/set	text	The item's url
WHERE USED
The reading list item record is used in the following ways:
reading list property of the application class/record
EXTENDED TEXT SUITE
Extended Text SuiteClasses and commands for Extended Text Suite
COMMANDS
bold
bold (verb)Bold some text (from Extended Text Suite)
COMMAND SYNTAX
bold reference
PARAMETERS
Parameter
Required
Type
Description
direct parameter	required	reference	The text.
CLASSES
The following classes respond to the bold command:
rich text	attachment	paragraph		
character	attribute run	word		
italicize
italicize (verb)Italicize some text (from Extended Text Suite)
COMMAND SYNTAX
italicize reference
PARAMETERS
Parameter
Required
Type
Description
direct parameter	required	reference	The text.
CLASSES
The following classes respond to the italicize command:
rich text	attachment	paragraph		
character	attribute run	word		
plain
plain (verb)Make some text plain (from Extended Text Suite)
COMMAND SYNTAX
plain reference
PARAMETERS
Parameter
Required
Type
Description
direct parameter	required	reference	The text.
CLASSES
The following classes respond to the plain command:
rich text	attachment	paragraph		
character	attribute run	word		
reformat
reformat (verb)Reformat some text. Similar to WordService's Reformat service. (from Extended Text Suite)
COMMAND SYNTAX
reformat reference
PARAMETERS
Parameter
Required
Type
Description
direct parameter	required	reference	The text.
CLASSES
The following classes respond to the reformat command:
rich text	attachment	paragraph		
character	attribute run	word		
scroll to visible
scroll to visible (verb)Scroll to and animate some text. (from Extended Text Suite)
COMMAND SYNTAX
scroll to visible reference
PARAMETERS
Parameter
Required
Type
Description
direct parameter	required	reference	The text.
CLASSES
The following classes respond to the scroll to visible command:
rich text	attachment	paragraph		
character	attribute run	word		
strike
strike (verb)Strike some text (from Extended Text Suite)
COMMAND SYNTAX
strike reference
PARAMETERS
Parameter
Required
Type
Description
direct parameter	required	reference	The text.
CLASSES
The following classes respond to the strike command:
rich text	attachment	paragraph		
character	attribute run	word		
unbold
unbold (verb)Unbold some text (from Extended Text Suite)
COMMAND SYNTAX
unbold reference
PARAMETERS
Parameter
Required
Type
Description
direct parameter	required	reference	The text.
CLASSES
The following classes respond to the unbold command:
rich text	attachment	paragraph		
character	attribute run	word		
underline
underline (verb)Underline some text (from Extended Text Suite)
COMMAND SYNTAX
underline reference
PARAMETERS
Parameter
Required
Type
Description
direct parameter	required	reference	The text.
CLASSES
The following classes respond to the underline command:
rich text	attachment	paragraph		
character	attribute run	word		
unitalicize
unitalicize (verb)Unitalicize some text (from Extended Text Suite)
COMMAND SYNTAX
unitalicize reference
PARAMETERS
Parameter
Required
Type
Description
direct parameter	required	reference	The text.
CLASSES
The following classes respond to the unitalicize command:
rich text	attachment	paragraph		
character	attribute run	word		
unstrike
unstrike (verb)Unstrike some text (from Extended Text Suite)
COMMAND SYNTAX
unstrike reference
PARAMETERS
Parameter
Required
Type
Description
direct parameter	required	reference	The text.
CLASSES
The following classes respond to the unstrike command:
rich text	attachment	paragraph		
character	attribute run	word		
ununderline
ununderline (verb)Ununderline some text (from Extended Text Suite)
COMMAND SYNTAX
ununderline reference
PARAMETERS
Parameter
Required
Type
Description
direct parameter	required	reference	The text.
CLASSES
The following classes respond to the ununderline command:
rich text	attachment	paragraph		
character	attribute run	word		
ENUMERATIONS
text alignment
text alignment (enumeration)[synonyms: TextAlignment]
CONSTANTS
Constant
Description
center	
justified	
left	
natural	
right	
WHERE USED
The text alignment enumeration is used in the following ways:
alignment property of the rich text class/record
alignment property of the attribute run class/record
alignment property of the character class/record
alignment property of the word class/record
alignment property of the paragraph class/record
IMPRINT COMMANDS SUITE
Imprint Commands SuiteClasses and commands for Imprint Commands Suite
COMMANDS
imprint
imprint (verb)Imprint the record with a configuration defined in the parameters. Not supported by audit-proof databases. (from Imprint Commands Suite)
DESCRIPTION
AppleScript:

tell application id "DNtp"
	set theRecord to selected record 1
	set theText to "Demo""
	imprint font "Times New Roman Italic" position centered record theRecord size 15 text theText border color {65535, 0, 0} border width 5 border style rounded rectangle background color {65535, 65535, 0} rotation 45 with strikethrough
end tell
JavaScript:

(() => {
	const theApp = Application("DEVONthink");
	const theRecord = theApp.selectedRecords[0];
	const theText = "Demo";
	theApp.imprint({font:"Times New Roman Italic",position:"centered",record:theRecord,size:15,text:theText,borderWidth:5,borderStyle:"rounded rectangle",rotation:45,strikeThrough:1,borderColor:[65535, 0, 0],backgroundColor:[65535, 65535, 0]});
})();
		
FUNCTION SYNTAX
set theResult to imprint record content ¬
     background color RGB color or missing value ¬
     border color RGB color or missing value ¬
     border style border style type ¬
     border width integer ¬
     font text ¬
     foreground color RGB color or missing value ¬
     occurence occurrence type ¬
     outlined boolean ¬
     position imprint position ¬
     rotation integer ¬
     size integer ¬
     strike through boolean ¬
     text text ¬
     underlined boolean ¬
     x offset integer ¬
     y offset integer ¬
     waiting for reply boolean
RESULT
booleanTrue if imprinting was successful, false if not.
PARAMETERS
Parameter
Required
Type
Description
background color	optional	RGB color or missing value	Color expressed as an RGB value consisting of a list of three color values from 0 to 65535. ex: Blue = {0, 0, 65535} (Optional).
border color	optional	RGB color or missing value	Color expressed as an RGB value consisting of a list of three color values from 0 to 65535. ex: Blue = {0, 0, 65535} (Optional).
border style	optional	border style type	The type of border to be drawn (Optional).
border width	optional	integer	Width of the border for a given border style (Optional).
font	required	text	The name of the font. Can be the PostScript name, such as: “TimesNewRomanPS-ItalicMT”, or display name: “Times New Roman Italic”.
foreground color	optional	RGB color or missing value	Color expressed as an RGB value consisting of a list of three color values from 0 to 65535. ex: Blue = {0, 0, 65535} (Optional).
occurence
[synonyms: occurance]	optional	occurrence type	On what pages should the imprint occur (Optional).
outlined	optional	boolean	The text will be drawn as an outline if true (Optional).
position	required	imprint position	Specifies where the imprint will be drawn
record	required	content	The image or PDF record to imprint
rotation	optional	integer	Rotation value in degrees (Optional)
size	required	integer	Size of the font.
strike through
[synonyms: strikethrough]	optional	boolean	The text is striked through if true (Optional).
text	required	text	The text, including any placeholders to imprint
underlined	optional	boolean	The text is underlined if true (Optional).
waiting for reply	optional	boolean	Wait for reply (default) or perform the command in the background.
x offset	optional	integer	An x offset in pixels from the position (Optional).
y offset	optional	integer	An y offset in pixels from the position (Optional).
imprint configuration
imprint configuration (verb)Imprint the record with a given imprinter configuration. Not supported by audit-proof databases. (from Imprint Commands Suite)
FUNCTION SYNTAX
set theResult to imprint configuration text ¬
     to content ¬
     waiting for reply boolean
RESULT
booleanTrue if imprinting was successful, false if not.
PARAMETERS
Parameter
Required
Type
Description
direct parameter	required	text	The name of the imprinter configuration
to	required	content	The image or PDF record to imprint
waiting for reply	optional	boolean	Wait for reply (default) or perform the command in the background.
imprinter configuration names
imprinter configuration names (verb)Returns list of imprinter configuration names (from Imprint Commands Suite)
FUNCTION SYNTAX
set theResult to imprinter configuration names
RESULT
list of text or missing valueThe configuration names.
ENUMERATIONS
border style type
border style type (enumeration)[synonyms: BorderStyleType]
CONSTANTS
Constant
Description
left arrow	
none	No border, this is the default
oval	Oval border
rectangle	Rectangular border
right arrow	
rounded rectangle	Rectangle with rounded corners
WHERE USED
The border style type enumeration is used in the following ways:
border style parameter of the imprint command/event
imprint position
imprint position (enumeration)[synonyms: ImprintPosition]
CONSTANTS
Constant
Description
bottom center	Position imprint bottom center of page
bottom left	Position imprint bottom left of page
bottom right	Position imprint bottom right of page
center left	Position imprint center left of page
center right	Position imprint center right of page
centered	Position imprint in the center of the page
top center	Position imprint top center of page
top left	Position imprint top left of page
top right	Position imprint top right of page
WHERE USED
The imprint position enumeration is used in the following ways:
position parameter of the imprint command/event
occurrence type
occurrence type (enumeration)[synonyms: OccuranceType]
CONSTANTS
Constant
Description
even pages	Imprint even pages only
every page	Imprint every page, this is the default
first page only	Imprint the first page only
odd pages	Imprint odd pages only
WHERE USED
The occurrence type enumeration is used in the following ways:
occurence parameter of the imprint command/event
OCR COMMANDS SUITE
OCR Commands SuiteClasses and commands for OCR Commands Suite
COMMANDS
convert image
convert image (verb)Converts a record to a new record and applies OCR. (from OCR Commands Suite)
FUNCTION SYNTAX
set theResult to convert image record content ¬
     to parent or missing value ¬
     file type OCR convert type ¬
     waiting for reply boolean
RESULT
content or missing valueThe converted record.
PARAMETERS
Parameter
Required
Type
Description
file type
[synonyms: type]	optional	OCR convert type	Specifies what type of file to convert to. If no value is specified the settings default is used.
record	required	content	A record containing an image
to	optional	parent or missing value	The destination group (by default the same group as the input record)
waiting for reply	optional	boolean	Wait for reply (default) or perform the command in the background.
ocr
ocr (verb)Imports a PDF document or image with OCR. (from OCR Commands Suite)
DESCRIPTION
AppleScript:

tell application id "DNtp"
	ocr file "~/Downloads/Test.jpg" to current group
end tell
JavaScript:

(() => {
	const theApp = Application("DEVONthink");
	theApp.ocr({file:"~/Downloads/Test.jpg", to:theApp.currentGroup()});
})();
		
FUNCTION SYNTAX
set theResult to ocr file text ¬
     attributes PDF properties or missing value ¬
     to parent or missing value ¬
     file type OCR convert type ¬
     waiting for reply boolean
RESULT
content or missing valueThe OCRed record.
PARAMETERS
Parameter
Required
Type
Description
attributes	optional	PDF properties or missing value	The PDF properties.
file	required	text	POSIX path or file URL of the image file.
file type
[synonyms: type]	optional	OCR convert type	Specifies what type of file to convert to. If no value is specified the settings default is used.
to	optional	parent or missing value	The destination group. Uses incoming group or group selector if not specified.
waiting for reply	optional	boolean	Wait for reply (default) or perform the command in the background.
ENUMERATIONS
OCR convert type
OCR convert type (enumeration)[synonyms: OCRConvertType]
CONSTANTS
Constant
Description
Annotate document	Annotation
Comment document	Comment
PDF document	
RTF
[synonyms: rtf]	RTF document
webarchive	Web Archive
Word document	Microsoft Word document
WHERE USED
The OCR convert type enumeration is used in the following ways:
file type parameter of the convert image command/event
file type parameter of the ocr command/event
RECORDS
PDF properties
PDF properties (record)
PROPERTIES
Property
Access
Type
Description
author	get/set	text	The document's author
keywords	get/set	text	The document's keywords
subject	get/set	text	The document's subject
title	get/set	text	The document's title
WHERE USED
The PDF properties record is used in the following ways:
attributes parameter of the ocr command/event
STANDARD SUITE
Standard SuiteCommon classes and commands for all applications.
COMMANDS
close
close (verb)Close a window, tab or database. (from Standard Suite)
COMMAND SYNTAX
close reference ¬
     saving save options
PARAMETERS
Parameter
Required
Type
Description
direct parameter	required	reference	The window(s), tab(s) or database(s) to close.
saving	optional	save options	Should changes be saved before closing?
CLASSES
The following classes respond to the close command:
window	document window	database		
think window	main window	tab		
count
count (verb)Return the number of elements of a particular class within an object. (from Standard Suite)
FUNCTION SYNTAX
set theResult to count reference
RESULT
integerThe count.
PARAMETERS
Parameter
Required
Type
Description
direct parameter	required	reference	The objects to be counted.
exists
exists (verb)Verify that an object exists. (from Standard Suite)
FUNCTION SYNTAX
set theResult to exists any
RESULT
booleanDid the object(s) exist?
PARAMETERS
Parameter
Required
Type
Description
direct parameter	required	any	The object(s) to check.
make
make (verb)Create a new object. (from Standard Suite)
FUNCTION SYNTAX
set theResult to make new type class ¬
     at location specifier ¬
     with data any ¬
     with properties dictionary
RESULT
referenceThe new object.
PARAMETERS
Parameter
Required
Type
Description
at	optional	location specifier	The location at which to insert the object.
new	required	type class	The class of the new object.
with data	optional	any	The initial contents of the object.
with properties	optional	dictionary	The initial values for properties of the object.
print
print (verb)Print a window or tab. (from Standard Suite)
COMMAND SYNTAX
print reference ¬
     with properties print settings ¬
     print dialog boolean
PARAMETERS
Parameter
Required
Type
Description
direct parameter	required	reference	The window(s) or tab(s) to be printed.
print dialog	optional	boolean	Should the application show the print dialog?
with properties	optional	print settings	The print settings to use.
CLASSES
The following classes respond to the print command:
window	think window	main window		
application	document window	tab		
quit
quit (verb)Quit the application. (from Standard Suite)
COMMAND SYNTAX
quit saving save options
PARAMETERS
Parameter
Required
Type
Description
saving	optional	save options	Should changes be saved before quitting?
CLASSES
The following classes respond to the quit command:
application				
save
save (verb)Save a window or tab. (from Standard Suite)
COMMAND SYNTAX
save reference
PARAMETERS
Parameter
Required
Type
Description
direct parameter	required	reference	The window(s) or tab(s) to save.
CLASSES
The following classes respond to the save command:
window	think window	document window	main window	tab
CLASSES
application
application (noun)The application's top-level scripting object.
PROPERTIES
Property
Access
Type
Description
bates number	get/set	integer	Current bates number.
cancelled progress	get	boolean	Specifies if a process with a visible progress indicator should be cancelled.
content record	get	content or missing value	The record of the visible document in the frontmost think window.
current chat engine	get	chat engine or missing value	The default chat engine.
current database	get	database or missing value	The currently used database.
current group	get	parent or missing value	The (selected) group of the frontmost window of the current database. Returns root of current database if no current group exists.
current workspace	get	text or missing value	The name of the currently used workspace.
frontmost	get	boolean	Is this the active application?
inbox	get	database or missing value	The global inbox.
incoming group	get	parent or missing value	The default group for new notes. Either global inbox or incoming group of current database if global inbox isn't available.
label names	get	list of text or missing value	List of all 7 label names.
last downloaded response	get	HTTP response or missing value	The last downloaded HTTP(S) response.
last downloaded URL	get	text or missing value	The actual URL of the last download.
name	get	text	The name of the application.
preferred import destination	get	parent or missing value	The default destination for data from external sources. See Settings > Import > Destination.
reading list	get	list of reading list item or missing value	The items of the reading list.
selection	get	list of record or missing value	The current selection of the frontmost main window or the record of the frontmost document window. 'selected records' element is recommended instead especially for bulk retrieval of properties like UUID.
strict duplicate recognition	get/set	boolean	Specifies if recognition of duplicates is strict (exact) or not (fuzzy).
version	get	text	The version number of the application.
workspaces	get	list of text or missing value	The names of all available workspaces.
ELEMENTS
Element
Access
Key Forms
Description
database	get/ make/ delete	by name
by index
by range
by whose/where
by unique ID
document window	get/ make/ delete	by index
by unique ID
main window	get/ make/ delete	by index
by unique ID
selected record	get/ make/ delete	by name
by index
by range
by whose/where
by unique ID
think window	get/ make/ delete	by index
by unique ID
window	get	by name
by index
by range
relative to others
by whose/where
by unique ID
COMMANDS
The application class responds to the following commands:
Command
Description
add download	Add a URL to the download manager.
add reading list	Add record or URL to reading list.
add reminder	Add a new reminder to a record.
check file integrity of	Check file integrity of database.
classify	Get a list of classification proposals.
compare	Get a list of similar records, either by specifying a record or a content.
compress	Compress a database into a Zip archive.
convert	Convert a record to plain or rich text, formatted note or HTML and create a new record afterwards.
convert feed to HTML	Convert a RSS, RDF, JSON or Atom feed to HTML.
create database	Create a new database.
create formatted note from	Create a new formatted note from a web page.
create location	Create a hierarchy of groups if necessary.
create Markdown from	Create a Markdown document from a web resource.
create PDF document from	Create a new PDF document with or without pagination from a web resource.
create record with	Create a new record.
create thumbnail	Create or update existing thumbnail of a record. Thumbnailing is performed asynchronously in the background.
create web document from	Create a new record (picture, PDF or web archive) from a web resource.
delete	Delete all instances of a record from the database or one instance from the specified group.
delete thumbnail	Delete existing thumbnail of a record.
delete workspace	Delete a workspace.
display authentication dialog	Display a dialog to enter a username and its password.
display date editor	Display a dialog to enter a date.
display group selector	Display a dialog to select a (destination) group.
display name editor	Display a dialog to enter a name.
do JavaScript	Executes a string of JavaScript code (optionally in the web view of a think window).
download image for prompt	Download image for a prompt.
download JSON from	Download a JSON object.
download markup from	Download an HTML or XML page (including RSS, RDF or Atom feeds).
download URL	Download a URL.
duplicate	Duplicate a record.
exists record at	Check if at least one record exists at the specified location.
exists record with comment	Check if at least one record with the specified comment exists.
exists record with content hash	Check if at least one record with the specified content hash exists.
exists record with file	Check if at least one record with the specified last path component exists.
exists record with path	Check if at least one record with the specified path exists.
exists record with URL	Check if at least one record with the specified URL exists.
export	Export a record (and its children).
export tags of	Export Finder tags of a record.
export website	Export a record (and its children) as a website.
extract keywords from	Extract list of keywords from a record. The list is sorted by number of occurrences.
get cached data for URL	Get cached data for URL of a resource which is part of a loaded webpage and its DOM tree, rendered in a think tab/window.
get chat models for engine	Retrieve list of supported models of a chat engine.
get chat response for message	Retrieve the response for a chat message. The chat might perform a web, Wikipedia or PubMed search if necessary depending on the parameters and the settings.
get concordance of	Get list of words of a record. Supports both documents and groups/feeds.
get custom meta data	Get user-defined metadata from a record.
get database with id	Get database with the specified id.
get database with uuid	Get database with the specified uuid.
get embedded images of	Get the URLs of all embedded images of an HTML page.
get embedded objects of	Get the URLs of all embedded objects of an HTML page.
get embedded sheets and scripts of	Get the URLs of all embedded style sheets and scripts of an HTML page.
get favicon of	Get the favicon of an HTML page.
get feed items of	Get the feed items of a RSS, RDF, JSON or Atom feed.
get frames of	Get the URLs of all frames of an HTML page.
get items of feed	Get the items of a RSS, RDF, JSON or Atom feed as dictionaries. 'get feed items of' is recommended for new scripts.
get links of	Get the URLs of all links of an HTML page.
get metadata of	Get the metadata of an HTML page or of a Markdown document.
get record at	Search for record at the specified location.
get record with id	Get record with the specified id.
get record with uuid	Get record with the specified uuid or item link.
get rich text of	Get the rich text of an HTML page.
get text of	Get the text of an HTML page.
get title of	Get the title of an HTML page.
get versions of	Get saved versions of a record.
hide progress indicator	Hide a visible progress indicator.
import attachments of	Import attachments of an email.
import path	Import a file or folder (including its subfolders).
import template	Import a template. Template scripts are not supported and audit-proof databases do not support any templates at all.
index path	Index a file or folder (including its subfolders). Not supported by audit-proof databases.
load workspace	Load a workspace.
log message	Log info for a record, file or action to the Window > Log panel
lookup records with comment	Lookup records with specified comment.
lookup records with content hash	Lookup records with specified content hash.
lookup records with file	Lookup records whose last path component is the specified file.
lookup records with path	Lookup records with specified path.
lookup records with tags	Lookup records with all or any of the specified tags.
lookup records with URL	Lookup records with specified URL.
merge	Merge either a list of records as an RTF(D)/a PDF document or merge a list of not indexed groups/tags.
move	Move all instances of a record to a different group. Specify the 'from' group to move a single instance to a different group.
move into database	Move an external/indexed record (and its children) into the database. Not supported by audit-proof databases.
move to external folder	Move an internal/imported record (and its children) to the enclosing external folder in the filesystem. Creation/Modification dates, Spotlight comments and OpenMeta tags are immediately updated. Not supported by audit-proof databases.
open	
open database	Open an existing database.
open tab for	Open a new tab for the specified URL or record in a think window.
open window for	Open a (new) viewer or document window for the specified record. Only recommended for main windows, use 'open tab for' for document windows.
optimize	Backup & optimize a database.
paste clipboard	Create a new record with the contents of the clipboard.
perform smart rule	Perform one or all smart rules.
print	Print a window or tab.
quit	Quit the application.
refresh	Refresh a record. Currently only supported by feeds but not by audit-proof databases.
replicate	Replicate a record.
restore record with	Restore saved version of a record.
save version of	Save version of current record. NOTE: Use this command right before editing the contents, not afterwards, as duplicates are automatically removed.
save workspace	Save a workspace.
search	Search for records in specified group or all databases.
show progress indicator	Show a progress indicator or update an already visible indicator. You have to ensure that the indicator is hidden again via 'hide progress indicator' when the script ends or if an error occurs.
show search	Perform search in frontmost main window. Opens a new main window if there's none.
start downloads	Start queue of download manager.
step progress indicator	Go to next step of a progress.
stop downloads	Stop queue of download manager.
summarize annotations of	Summarize highlights & annotations of records. PDF, RTF(D), Markdown and web documents are currently supported.
summarize contents of	Summarize content of records.
summarize mentions of	Summarize mentions of records.
summarize text	Summarizes text.
synchronize	Synchronizes records with the filesystem or databases with their sync locations. Only one of both operations is supported.
transcribe	Transcribes speech, text or notes of a record.
update	Update text of a plain/rich text, Markdown document, formatted note or HTML page. Not supported by audit-proof databases.
update thumbnail	Update existing thumbnail of a record. Thumbnailing is performed asynchronously in the background.
verify	Verify a database.
window
window (noun), pl windowsA window.
PROPERTIES
Property
Access
Type
Description
bounds	get/set	rectangle	The bounding rectangle of the window.
closeable	get	boolean	Does the window have a close button?
id	get	integer	The unique identifier of the window.
index	get/set	integer	The index of the window, ordered front to back.
miniaturizable	get	boolean	Does the window have a minimize button?
miniaturized	get/set	boolean	Is the window minimized right now?
name	get	text	The title of the window.
resizable	get	boolean	Can the window be resized?
visible	get/set	boolean	Is the window visible right now?
zoomable	get	boolean	Does the window have a zoom button?
zoomed	get/set	boolean	Is the window zoomed right now?
COMMANDS
The window class responds to the following commands:
Command
Description
close	Close a window, tab or database.
print	Print a window or tab.
save	Save a window or tab.
SUBCLASSES
The think window class inherits the elements and properties of the window class.
WHERE USED
The window class is used in the following ways:
element of application class
ENUMERATIONS
printing error handling
printing error handling (enumeration)
CONSTANTS
Constant
Description
detailed	print a detailed report of PostScript errors
standard	Standard PostScript error handling
WHERE USED
The printing error handling enumeration is used in the following ways:
error handling property of the print settings class/record
save options
save options (enumeration)
CONSTANTS
Constant
Description
ask	Ask the user whether or not to save the file.
no	Do not save the file.
yes	Save the file.
WHERE USED
The save options enumeration is used in the following ways:
saving parameter of the close command/event
saving parameter of the quit command/event
RECORDS
print settings
print settings (record)
PROPERTIES
Property
Access
Type
Description
collating	get/set	boolean	Should printed copies be collated?
copies	get/set	integer	the number of copies of a document to be printed
ending page	get/set	integer	the last page of the document to be printed
error handling	get/set	printing error handling	how errors are handled
fax number	get/set	text	for fax number
pages across	get/set	integer	number of logical pages laid across a physical page
pages down	get/set	integer	number of logical pages laid out down a physical page
requested print time	get/set	date	the time at which the desktop printer should print the document
starting page	get/set	integer	the first page of the document to be printed
target printer	get/set	text	for target printer
WHERE USED
The print settings record is used in the following ways:
with properties parameter of the print command/event
TYPES
array
array (type)Array of items.
WHERE USED
The array type is used in the following ways:
result of get chat response for message command
cells property of the record class/record
enclosures property of the feed item class/record
tags property of the feed item class/record
tags property of the record class/record
dictionary
dictionary (type), pl dictionariesDictionary containing key-value pairs.
WHERE USED
The dictionary type is used in the following ways:
direct parameter to the add reminder command/event
direct parameter to the create record with command/event
result of download JSON from command
result of get chat response for message command
direct parameter to the get chat response for message command/event
result of get items of feed command
result of get metadata of command
custom meta data property of the record class/record
meta data property of the record class/record
placeholders parameter of the import path command/event
post parameter of the download JSON from command/event
post parameter of the download markup from command/event
post parameter of the download URL command/event
with properties parameter of the make command/event
raw data
raw data (type)Raw data.
WHERE USED
The raw data type is used in the following ways:
result of download image for prompt command
result of download URL command
result of get cached data for URL command
current movie frame property of the think window class/record
current movie frame property of the tab class/record
data property of the record class/record
image parameter of the download image for prompt command/event
image parameter of the get chat response for message command/event
paginated PDF property of the think window class/record
paginated PDF property of the record class/record
paginated PDF property of the tab class/record
PDF property of the think window class/record
PDF property of the tab class/record
web archive property of the think window class/record
web archive property of the record class/record
web archive property of the tab class/record
RGB color
RGB color (type)An RGB color.
WHERE USED
The RGB color type is used in the following ways:
background property of the rich text class/record
background property of the attribute run class/record
background property of the paragraph class/record
background property of the word class/record
background property of the character class/record
background color parameter of the imprint command/event
border color parameter of the imprint command/event
color property of the record class/record
color property of the rich text class/record
color property of the attribute run class/record
color property of the character class/record
color property of the paragraph class/record
color property of the word class/record
foreground color parameter of the imprint command/event
TEXT SUITE
Text SuiteClasses and commands for Text Suite
CLASSES
attachment
attachment (noun)Represents an inline text attachment. This class is used mainly for make commands.
PROPERTIES
Property
Access
Type
Description
alignment	get/set	text alignment	Alignment of the text.
rich text
background	get/set	RGB color or missing value	The background color of the first character.
rich text
baseline offset	get/set	real	Number of points shifted above or below the normal baseline.
rich text
color	get/set	RGB color or missing value	The color of the first character.
rich text
file name	get/set	file or missing value	The path to the file for the attachment
first line head indent	get/set	real	Paragraph first line head indent of the text (always 0 or positive)
rich text
font	get/set	text or missing value	The name of the font of the first character.
rich text
head indent	get/set	real	Paragraph head indent of the text (always 0 or positive).
rich text
line spacing	get/set	real	Line spacing of the text.
rich text
maximum line height	get/set	real	Maximum line height of the text.
rich text
minimum line height	get/set	real	Minimum line height of the text.
rich text
multiple line height	get/set	real	Multiple line height of the text.
rich text
paragraph spacing	get/set	real	Paragraph spacing of the text.
rich text
size	get/set	number	The size in points of the first character.
rich text
superscript	get/set	integer	The superscript level of the text.
rich text
tail indent	get/set	real	Paragraph tail indent of the text. If positive, it's the absolute line width. If 0 or negative, it's added to the line width.
rich text
text content
[synonyms: text]	get/set	text or missing value	The actual text content.
rich text
underlined	get/set	boolean	Is the first character underlined?
rich text
URL	get/set	text or missing value	Link of the text.
rich text
ELEMENTS
Element
Access
Key Forms
Description
attachment	get/ make/ delete	by name
by index
by range
relative to others
by whose/where
by unique ID

rich text
attribute run	get/ make/ delete	by name
by index
by range
relative to others
by whose/where
by unique ID

rich text
character	get/ make/ delete	by name
by index
by range
relative to others
by whose/where
by unique ID

rich text
paragraph	get/ make/ delete	by name
by index
by range
relative to others
by whose/where
by unique ID

rich text
word	get/ make/ delete	by name
by index
by range
relative to others
by whose/where
by unique ID

rich text
COMMANDS
The attachment class responds to the following commands:
Command
Description
bold	Bold some text rich text
italicize	Italicize some text rich text
plain	Make some text plain rich text
reformat	Reformat some text. Similar to WordService's Reformat service. rich text
scroll to visible	Scroll to and animate some text. rich text
strike	Strike some text rich text
unbold	Unbold some text rich text
underline	Underline some text rich text
unitalicize	Unitalicize some text rich text
unstrike	Unstrike some text rich text
ununderline	Ununderline some text rich text
SUPERCLASS
The attachment class inherits elements and properties from rich text.
WHERE USED
The attachment class is used in the following ways:
element of rich text class
element of character class
element of attachment class
element of attribute run class
element of paragraph class
element of word class
attribute run
attribute run (noun), pl attribute runsThis subdivides the text into chunks that all have the same attributes.
PROPERTIES
Property
Access
Type
Description
alignment	get/set	text alignment	Alignment of the text.
background	get/set	RGB color or missing value	The background color of the first character.
baseline offset	get/set	real	Number of points shifted above or below the normal baseline.
color	get/set	RGB color or missing value	The color of the first character.
first line head indent	get/set	real	Paragraph first line head indent of the text (always 0 or positive)
font	get/set	text or missing value	The name of the font of the first character.
head indent	get/set	real	Paragraph head indent of the text (always 0 or positive).
line spacing	get/set	real	Line spacing of the text.
maximum line height	get/set	real	Maximum line height of the text.
minimum line height	get/set	real	Minimum line height of the text.
multiple line height	get/set	real	Multiple line height of the text.
paragraph spacing	get/set	real	Paragraph spacing of the text.
size	get/set	number	The size in points of the first character.
superscript	get/set	integer	The superscript level of the text.
tail indent	get/set	real	Paragraph tail indent of the text. If positive, it's the absolute line width. If 0 or negative, it's added to the line width.
text content
[synonyms: text]	get/set	text or missing value	The actual text content.
underlined	get/set	boolean	Is the first character underlined?
URL	get/set	text or missing value	Link of the text.
ELEMENTS
Element
Access
Key Forms
Description
attachment	get/ make/ delete	by name
by index
by range
relative to others
by whose/where
by unique ID
attribute run	get/ make/ delete	by name
by index
by range
relative to others
by whose/where
by unique ID
character	get/ make/ delete	by name
by index
by range
relative to others
by whose/where
by unique ID
paragraph	get/ make/ delete	by name
by index
by range
relative to others
by whose/where
by unique ID
word	get/ make/ delete	by name
by index
by range
relative to others
by whose/where
by unique ID
COMMANDS
The attribute run class responds to the following commands:
Command
Description
bold	Bold some text
italicize	Italicize some text
plain	Make some text plain
reformat	Reformat some text. Similar to WordService's Reformat service.
scroll to visible	Scroll to and animate some text.
strike	Strike some text
unbold	Unbold some text
underline	Underline some text
unitalicize	Unitalicize some text
unstrike	Unstrike some text
ununderline	Ununderline some text
WHERE USED
The attribute run class is used in the following ways:
element of rich text class
element of character class
element of attachment class
element of paragraph class
element of word class
character
character (noun), pl charactersThis subdivides the text into characters.
PROPERTIES
Property
Access
Type
Description
alignment	get/set	text alignment	Alignment of the text.
background	get/set	RGB color or missing value	The background color of the first character.
baseline offset	get/set	real	Number of points shifted above or below the normal baseline.
color	get/set	RGB color or missing value	The color of the first character.
first line head indent	get/set	real	Paragraph first line head indent of the text (always 0 or positive)
font	get/set	text or missing value	The name of the font of the first character.
head indent	get/set	real	Paragraph head indent of the text (always 0 or positive).
line spacing	get/set	real	Line spacing of the text.
maximum line height	get/set	real	Maximum line height of the text.
minimum line height	get/set	real	Minimum line height of the text.
multiple line height	get/set	real	Multiple line height of the text.
paragraph spacing	get/set	real	Paragraph spacing of the text.
size	get/set	number	The size in points of the first character.
superscript	get/set	integer	The superscript level of the text.
tail indent	get/set	real	Paragraph tail indent of the text. If positive, it's the absolute line width. If 0 or negative, it's added to the line width.
text content
[synonyms: text]	get/set	text or missing value	The actual text content.
underlined	get/set	boolean	Is the first character underlined?
URL	get/set	text or missing value	Link of the text.
ELEMENTS
Element
Access
Key Forms
Description
attachment	get/ make/ delete	by name
by index
by range
relative to others
by whose/where
by unique ID
attribute run	get/ make/ delete	by name
by index
by range
relative to others
by whose/where
by unique ID
character	get/ make/ delete	by name
by index
by range
relative to others
by whose/where
by unique ID
paragraph	get/ make/ delete	by name
by index
by range
relative to others
by whose/where
by unique ID
word	get/ make/ delete	by name
by index
by range
relative to others
by whose/where
by unique ID
COMMANDS
The character class responds to the following commands:
Command
Description
bold	Bold some text
italicize	Italicize some text
plain	Make some text plain
reformat	Reformat some text. Similar to WordService's Reformat service.
scroll to visible	Scroll to and animate some text.
strike	Strike some text
unbold	Unbold some text
underline	Underline some text
unitalicize	Unitalicize some text
unstrike	Unstrike some text
ununderline	Ununderline some text
WHERE USED
The character class is used in the following ways:
element of rich text class
element of attachment class
element of attribute run class
element of paragraph class
element of word class
paragraph
paragraph (noun), pl paragraphsThis subdivides the text into paragraphs.
PROPERTIES
Property
Access
Type
Description
alignment	get/set	text alignment	Alignment of the text.
background	get/set	RGB color or missing value	The background color of the first character.
baseline offset	get/set	real	Number of points shifted above or below the normal baseline.
color	get/set	RGB color or missing value	The color of the first character.
first line head indent	get/set	real	Paragraph first line head indent of the text (always 0 or positive)
font	get/set	text or missing value	The name of the font of the first character.
head indent	get/set	real	Paragraph head indent of the text (always 0 or positive).
line spacing	get/set	real	Line spacing of the text.
maximum line height	get/set	real	Maximum line height of the text.
minimum line height	get/set	real	Minimum line height of the text.
multiple line height	get/set	real	Multiple line height of the text.
paragraph spacing	get/set	real	Paragraph spacing of the text.
size	get/set	number	The size in points of the first character.
superscript	get/set	integer	The superscript level of the text.
tail indent	get/set	real	Paragraph tail indent of the text. If positive, it's the absolute line width. If 0 or negative, it's added to the line width.
text content
[synonyms: text]	get/set	text or missing value	The actual text content.
underlined	get/set	boolean	Is the first character underlined?
URL	get/set	text or missing value	Link of the text.
ELEMENTS
Element
Access
Key Forms
Description
attachment	get/ make/ delete	by name
by index
by range
relative to others
by whose/where
by unique ID
attribute run	get/ make/ delete	by name
by index
by range
relative to others
by whose/where
by unique ID
character	get/ make/ delete	by name
by index
by range
relative to others
by whose/where
by unique ID
paragraph	get/ make/ delete	by name
by index
by range
relative to others
by whose/where
by unique ID
word	get/ make/ delete	by name
by index
by range
relative to others
by whose/where
by unique ID
COMMANDS
The paragraph class responds to the following commands:
Command
Description
bold	Bold some text
italicize	Italicize some text
plain	Make some text plain
reformat	Reformat some text. Similar to WordService's Reformat service.
scroll to visible	Scroll to and animate some text.
strike	Strike some text
unbold	Unbold some text
underline	Underline some text
unitalicize	Unitalicize some text
unstrike	Unstrike some text
ununderline	Ununderline some text
WHERE USED
The paragraph class is used in the following ways:
element of rich text class
element of character class
element of attachment class
element of attribute run class
element of word class
rich text
rich text (noun), pl rich textsRich (styled) text
PROPERTIES
Property
Access
Type
Description
alignment	get/set	text alignment	Alignment of the text.
background	get/set	RGB color or missing value	The background color of the first character.
baseline offset	get/set	real	Number of points shifted above or below the normal baseline.
color	get/set	RGB color or missing value	The color of the first character.
first line head indent	get/set	real	Paragraph first line head indent of the text (always 0 or positive)
font	get/set	text or missing value	The name of the font of the first character.
head indent	get/set	real	Paragraph head indent of the text (always 0 or positive).
line spacing	get/set	real	Line spacing of the text.
maximum line height	get/set	real	Maximum line height of the text.
minimum line height	get/set	real	Minimum line height of the text.
multiple line height	get/set	real	Multiple line height of the text.
paragraph spacing	get/set	real	Paragraph spacing of the text.
size	get/set	number	The size in points of the first character.
superscript	get/set	integer	The superscript level of the text.
tail indent	get/set	real	Paragraph tail indent of the text. If positive, it's the absolute line width. If 0 or negative, it's added to the line width.
text content
[synonyms: text]	get/set	text or missing value	The actual text content.
underlined	get/set	boolean	Is the first character underlined?
URL	get/set	text or missing value	Link of the text.
ELEMENTS
Element
Access
Key Forms
Description
attachment	get/ make/ delete	by name
by index
by range
relative to others
by whose/where
by unique ID
attribute run	get/ make/ delete	by name
by index
by range
relative to others
by whose/where
by unique ID
character	get/ make/ delete	by name
by index
by range
relative to others
by whose/where
by unique ID
paragraph	get/ make/ delete	by name
by index
by range
relative to others
by whose/where
by unique ID
word	get/ make/ delete	by name
by index
by range
relative to others
by whose/where
by unique ID
COMMANDS
The rich text class responds to the following commands:
Command
Description
bold	Bold some text
italicize	Italicize some text
plain	Make some text plain
reformat	Reformat some text. Similar to WordService's Reformat service.
scroll to visible	Scroll to and animate some text.
strike	Strike some text
unbold	Unbold some text
underline	Underline some text
unitalicize	Unitalicize some text
unstrike	Unstrike some text
ununderline	Ununderline some text
SUBCLASSES
The attachment class inherits the elements and properties of the rich text class.
WHERE USED
The rich text class is used in the following ways:
direct parameter to the add custom meta data command/event
result of get custom meta data command
result of get rich text of command
default value parameter of the get custom meta data command/event
rich text property of the tab class/record
rich text property of the think window class/record
rich text property of the record class/record
selected text property of the tab class/record
selected text property of the think window class/record
with text parameter of the update command/event
word
word (noun), pl wordsThis subdivides the text into words.
PROPERTIES
Property
Access
Type
Description
alignment	get/set	text alignment	Alignment of the text.
background	get/set	RGB color or missing value	The background color of the first character.
baseline offset	get/set	real	Number of points shifted above or below the normal baseline.
color	get/set	RGB color or missing value	The color of the first character.
first line head indent	get/set	real	Paragraph first line head indent of the text (always 0 or positive)
font	get/set	text or missing value	The name of the font of the first character.
head indent	get/set	real	Paragraph head indent of the text (always 0 or positive).
line spacing	get/set	real	Line spacing of the text.
maximum line height	get/set	real	Maximum line height of the text.
minimum line height	get/set	real	Minimum line height of the text.
multiple line height	get/set	real	Multiple line height of the text.
paragraph spacing	get/set	real	Paragraph spacing of the text.
size	get/set	number	The size in points of the first character.
superscript	get/set	integer	The superscript level of the text.
tail indent	get/set	real	Paragraph tail indent of the text. If positive, it's the absolute line width. If 0 or negative, it's added to the line width.
text content
[synonyms: text]	get/set	text or missing value	The actual text content.
underlined	get/set	boolean	Is the first character underlined?
URL	get/set	text or missing value	Link of the text.
ELEMENTS
Element
Access
Key Forms
Description
attachment	get/ make/ delete	by name
by index
by range
relative to others
by whose/where
by unique ID
attribute run	get/ make/ delete	by name
by index
by range
relative to others
by whose/where
by unique ID
character	get/ make/ delete	by name
by index
by range
relative to others
by whose/where
by unique ID
paragraph	get/ make/ delete	by name
by index
by range
relative to others
by whose/where
by unique ID
word	get/ make/ delete	by name
by index
by range
relative to others
by whose/where
by unique ID
COMMANDS
The word class responds to the following commands:
Command
Description
bold	Bold some text
italicize	Italicize some text
plain	Make some text plain
reformat	Reformat some text. Similar to WordService's Reformat service.
scroll to visible	Scroll to and animate some text.
strike	Strike some text
unbold	Unbold some text
underline	Underline some text
unitalicize	Unitalicize some text
unstrike	Unstrike some text
ununderline	Ununderline some text
WHERE USED
The word class is used in the following ways:
element of rich text class
element of character class
element of attachment class
element of attribute run class
element of paragraph class
