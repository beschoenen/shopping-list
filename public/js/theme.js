const match = window.matchMedia("(prefers-color-scheme: dark)");

function applyTheme (match) {

  document.body.classList.toggle('bg-dark', match.matches);
  document.body.classList.toggle('text-light', match.matches);

  const iosTheme = document.head.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]');
  const androidTheme = document.head.querySelector('meta[name="theme-color"]');

  // Theme
  iosTheme.content = match.matches ? 'black' : 'white';
  androidTheme.content = match.matches ? '#343a40' : '#fff';
}

match.addEventListener('change', applyTheme);
applyTheme(match);
