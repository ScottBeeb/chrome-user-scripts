// ==UserScript==
// @name S3PathNavigator
// @namespace http://www.bbc.co.uk/news/ndp/aws
// @description Allows the specification of the initial bucket path in the AWS S3 web interface using a query parameter
// @version 0.1
// @run_at document_end
// @match https://*.aws.amazon.com/GetResource/Console.html*
// ==/UserScript==


var pathParts = null;
var nextFolderName = null;

function asyncMouseClick(target) {
   setTimeout(function() {
          var e = document.createEvent("MouseEvents");
          e.initEvent.apply(e, ['click', true, true]);
          target.dispatchEvent(e);
        },
        1
    )
}

function getBucketPathFromQuery(queryString) {
    var vars = queryString.split("&");
    for (var i = 0 ; i < vars.length ; i++) {
        var pair = vars[i].split("=");
        if(pair[0] == 'bucket-path') {
            return decodeURIComponent(pair[1]);
        }
    }
    return(null);
}

function bucketNodeInserted(e) {
    var element = e.target;
    if (element == null || !element.getAttribute) return;

    element.scrollIntoView(true);

    if (element.getAttribute('bucket') == nextFolderName) {
        var spanElement = element.getElementsByClassName('bucket-name')[0];
        asyncMouseClick(spanElement);
        setNextFolderName();
    }
 }

function objectNodeInserted(e) {
    var element = e.target;
    if (element == null || !element.getAttribute) return;

    var spanElement = element.getElementsByClassName('object-name-text')[0];
    if (spanElement == null) return;

    spanElement.scrollIntoView(true);

    if (spanElement.innerHTML == nextFolderName) {
        asyncMouseClick(spanElement);
        setNextFolderName();
    }
}

function setNextFolderName() {
    nextFolderName = pathParts.shift();
    if (nextFolderName == null || nextFolderName == '') {
        console.log("Removing event listeners");
        document.getElementById("bucket-list-view").removeEventListener("DOMNodeInserted", bucketNodeInserted);
        document.getElementById("list-view").removeEventListener("DOMNodeInserted", objectNodeInserted);
    }
}

function navigateToBucketPath() {

    console.log("Location query is " + location.search);

    var bucketPath = getBucketPathFromQuery(location.search.substring(1));
    if (bucketPath == null || bucketPath.length == 0) {
        console.log("No bucket_path in URL");
        return;
    }

    // Assume that this user script will be run before the bucket data has been loaded asynchronously
    document.getElementById("bucket-list-view").addEventListener("DOMNodeInserted", bucketNodeInserted);
    document.getElementById("list-view").addEventListener("DOMNodeInserted", objectNodeInserted);

    pathParts = bucketPath.split("/");

    nextFolderName = pathParts.shift();
}


navigateToBucketPath();
