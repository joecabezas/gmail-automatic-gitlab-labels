function processInbox() {
  var threads = GmailApp.search("newer_than:1h");
  Logger.log(threads.length)
   for (var i = 0; i < threads.length; i++) {
      var messages = threads[i].getMessages();
      for (var j = 0; j < messages.length; j++) {
         var message = messages[j];
         processMessage(message);
      }
   }
}

const HEADER_LABEL_MAP = {
  "X-GitLab-Issue-ID": "Gitlab/Issue",
  "X-GitLab-MergeRequest-ID": "Gitlab/Merge Request",
  "X-GitLab-Pipeline-Id": "Gitlab/Build",
};

const HEADERS_WITH_VALUE_LIST = [
  "X-GitLab-Project",
];

function processMessage(message) {
  process_headers(message);
  process_headers_with_value(message);
}

const process_headers = (message) => {
  // create parent hader label
  getLabel("Gitlab");
  
  var body = message.getRawContent(); 

  for (const [headerName, label] of Object.entries(HEADER_LABEL_MAP)) {
    var labelObject = getLabel(label);

    if (body.indexOf(headerName) > -1) { 
      message.getThread().addLabel(labelObject); 
    }
  } 
};

const process_headers_with_value = (message) => {
  for (const headerName of HEADERS_WITH_VALUE_LIST) {
    var headerValue = message.getHeader(headerName);

    if(!headerValue)
    {
      Logger.log(`no header: ${headerName}`);
      continue;
    }

    // create parent hader label
    getLabel(headerName);

    var labelObject = getLabel(
      createLabelForHeaderWithValue(headerName, headerValue)
    );

    message.getThread().addLabel(labelObject); 
  } 
};

const getLabel = (label) => {
  return GmailApp.getUserLabelByName(label)
    || GmailApp.createLabel(label);
};

const createLabelForHeaderWithValue = (name, value) => {
  return `${name}/${value}`;
}
