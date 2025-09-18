import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html>
      <Head>
        {/* Aggressive cache busting meta tags */}
        <meta httpEquiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
        <meta httpEquiv="Pragma" content="no-cache" />
        <meta httpEquiv="Expires" content="0" />
        <meta name="cache-control" content="max-age=0" />
        <meta name="expires" content="0" />
        <meta name="expires" content="Tue, 01 Jan 1980 1:00:00 GMT" />
        <meta name="pragma" content="no-cache" />
        
        {/* Force fresh JavaScript loading */}
        <script dangerouslySetInnerHTML={{
          __html: `
            // Clear any existing cache
            if ('caches' in window) {
              caches.keys().then(function(names) {
                for (let name of names) {
                  caches.delete(name);
                }
              });
            }
            
            // Force reload if page is cached
            window.addEventListener('pageshow', function(event) {
              if (event.persisted) {
                window.location.reload();
              }
            });
          `
        }} />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}



