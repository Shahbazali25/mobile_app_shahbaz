import React from 'react';
import {View, StyleSheet} from 'react-native';
import {WebView} from 'react-native-webview';

// Simple wrapper that renders an iframe-based WebRTC page for the given rtcUrl.
// Props:
// - rtcUrl: string (required) - the url to put into the iframe src
// - style: additional style for the WebView container
// - height: numeric height for the WebView (optional)
// - onError/onMessage/onLoadEnd: event handlers to forward to the WebView
const WebrtcWebView = ({
  rtcUrl,
  style,
  height = 200,
  onError,
  onMessage,
  onLoadEnd,
}) => {
  const safeUrl = rtcUrl || '';

  const html = `<!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        html, body, #frame { width: 100%; height: 100%; }
        body { background-color: #000; overflow: hidden; display:flex; align-items:center; justify-content:center; }
        iframe { width: 100%; height: 100%; border: none; }
        .error { color: #ff4444 !important; }
      </style>
    </head>
    <body>
      <iframe id="frame" src="${safeUrl}" allow="autoplay; encrypted-media" playsinline></iframe>
    </body>
    </html>`;

  return (
    <View style={[{height}, styles.container, style]}>
      <WebView
        source={{html}}
        style={{flex: 1, backgroundColor: '#000'}}
        mediaPlaybackRequiresUserAction={false}
        allowsInlineMediaPlayback={true}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        scalesPageToFit={true}
        mixedContentMode="always"
        originWhitelist={['*']}
        androidLayerType="hardware"
        androidHardwareAccelerationDisabled={false}
        onError={onError}
        onMessage={onMessage}
        onLoadEnd={onLoadEnd}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: '#000',
  },
});

export default WebrtcWebView;
