import QtQuick
import QtQuick.Controls
import QtWebView


ApplicationWindow {
    id: window
    visible: true

    WebView {
        id: webView
        url: initialUrl
        height: parent.height
        width: parent.width
        onLoadingChanged: function(loadRequest) {
            if (loadRequest.errorString)
                console.error(loadRequest.errorString);
        }
    }
}
