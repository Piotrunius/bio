# GitHub Security Features Documentation

## Przegląd

Ta implementacja dodaje kompletny Security Dashboard oraz dodatkowe funkcje GitHub do strony bio, w tym:
- **Vulnerability Alerts** (Dependabot, CodeQL, Secret Scanning)
- **GitHub Insights** (Pull Requests, Issues, Languages)

## Funkcje Security Dashboard

### 1. Dependabot Alerts
Wyświetla alerty bezpieczeństwa związane z zależnościami (dependencies):
- Severity levels: critical, high, medium, low
- Informacje o pakiecie i opisie vulnerability
- Link do szczegółów na GitHub
- Data utworzenia alertu
- Repository, w którym znajduje się alert

### 2. Code Scanning Alerts (CodeQL)
Wyświetla alerty z analizy statycznej kodu:
- Severity levels: error, warning, note
- Opis znalezionej reguły/problemu
- Tool używany do analizy (np. CodeQL)
- Link do szczegółów
- Repository i data

### 3. Secret Scanning Alerts
Wyświetla znalezione sekrety w kodzie:
- Typ sekret (np. GitHub Token, AWS Key)
- Repository
- Link do alertu
- Data wykrycia
- Severity: critical (domyślnie dla wszystkich sekretów)

## GitHub Insights

### 1. Pull Requests
- Łączna liczba PR stworzonych przez użytkownika
- 10 ostatnich PR z statusem (open/closed)
- Repository, tytuł, data aktualizacji

### 2. Issues
- Łączna liczba issues stworzonych przez użytkownika
- 10 ostatnich issues z statusem
- Repository, tytuł, data aktualizacji

### 3. Top Languages
- Wykres słupkowy z 10 najpopularniejszych języków
- Liczba repozytoriów dla każdego języka
- Animowany progress bar

## Implementacja Backend

### Workflow (.github/workflows/main.yml)

#### Pobieranie danych bezpieczeństwa
```javascript
// Dla każdego repozytorium (max 20):
// 1. Dependabot alerts
GET /repos/{owner}/{repo}/dependabot/alerts?state=open&per_page=10

// 2. Code Scanning alerts
GET /repos/{owner}/{repo}/code-scanning/alerts?state=open&per_page=10

// 3. Secret Scanning alerts
GET /repos/{owner}/{repo}/secret-scanning/alerts?state=open&per_page=10
```

#### Agregacja i sortowanie
- Alerty są agregowane ze wszystkich repozytoriów
- Sortowanie według severity (critical → high → medium → low)
- Następnie według daty (najnowsze pierwsze)
- Limit: 20 alertów każdego typu

#### Error Handling
- Retry logic z exponential backoff (3 próby)
- Rate limit detection i handling
- Fallback do poprzednich danych przy błędach
- Graceful degradation (niektóre repo mogą nie mieć włączonych features)

### Struktura danych (github-stats.json)
```json
{
  "security": {
    "totalOpen": 5,
    "dependabot": {
      "open": 2,
      "alerts": [
        {
          "number": 1,
          "state": "open",
          "severity": "high",
          "package": "lodash",
          "summary": "Prototype Pollution",
          "url": "https://github.com/...",
          "created": "2025-01-01T00:00:00Z",
          "repo": "my-repo"
        }
      ]
    },
    "codeScanning": { /* similar */ },
    "secretScanning": { /* similar */ }
  },
  "pullRequests": {
    "total": 42,
    "recent": [ /* array of PRs */ ]
  },
  "issues": {
    "total": 15,
    "recent": [ /* array of issues */ ]
  },
  "languages": [
    { "name": "JavaScript", "repos": 10 },
    { "name": "Python", "repos": 5 }
  ]
}
```

## Implementacja Frontend

### JavaScript (app.js)

#### Funkcje główne
1. `initSecurityDashboard()` - Inicjalizacja zakładek
2. `refreshSecurityAlerts()` - Pobieranie i renderowanie alertów
3. `refreshGitHubExtras()` - Pobieranie PRs, Issues, Languages

#### Rendering
- Używa `DocumentFragment` dla wydajności
- Animacje opóźnione (staggered animation)
- Formatowanie dat polskich (formatPLDateTime)
- Conditional rendering (brak danych = placeholder)

#### Error Handling
- Optional chaining (?.) dla bezpieczeństwa
- Fallback do domyślnych wartości
- Console warnings dla debugowania

### CSS (styles.css)

#### Zmienne CSS
```css
:root {
  --text-primary: #ffffff;
  --text-secondary: rgba(255, 255, 255, 0.7);
  /* ... */
}

body.light-mode {
  --text-primary: #0f1419;
  --text-secondary: rgba(15, 20, 25, 0.7);
  /* ... */
}
```

#### Klasy severity
- `.severity-critical` - czerwony
- `.severity-high` - pomarańczowy
- `.severity-medium` - żółty
- `.severity-low` - niebieski
- `.severity-unknown` - szary

#### Responsive Breakpoints
- `1200px` - layout adjustments
- `768px` - mobile tablets
- `480px` - mobile phones

### HTML (index.html)

#### Sekcja Security Dashboard
```html
<section class="security-section glass-card">
  <h3>SECURITY DASHBOARD</h3>
  <div class="security-overview">
    <!-- Statystyki -->
  </div>
  <div class="security-tabs">
    <!-- Zakładki -->
  </div>
  <div class="security-content">
    <!-- Listy alertów -->
  </div>
</section>
```

#### Sekcja GitHub Insights
```html
<section class="github-extras-section glass-card">
  <h3>GITHUB INSIGHTS</h3>
  <div class="github-extras-grid">
    <!-- PRs, Issues, Languages -->
  </div>
</section>
```

## Bezpieczeństwo

### Sanityzacja danych
Backend:
```javascript
function sanitizeString(str, maxLength = 500) {
  if (typeof str !== 'string') return '';
  return str.slice(0, maxLength).trim();
}
```

Frontend:
- Używa `textContent` zamiast `innerHTML` gdzie możliwe
- Walidacja URL (tylko GitHub URLs)
- XSS protection via proper escaping

### Rate Limiting
```javascript
if (response.status === 403 && rateLimitRemaining === '0') {
  const resetTime = new Date(rateLimitReset * 1000);
  // Wait and retry
}
```

### Permissions
Workflow wymaga:
```yaml
permissions:
  contents: write  # do commitowania danych
  pages: write     # do deploymentu
```

## Wydajność

### Optymalizacje
1. **Adaptive refresh intervals**
   - Low-end devices: 10 min
   - Normal devices: 5 min

2. **Lazy rendering**
   - DocumentFragment
   - Conditional rendering
   - Animation delays

3. **Data optimization**
   - Max 20 alerts per type
   - Max 10 PRs/Issues
   - Max 10 languages

4. **Network optimization**
   - Parallel fetching (Promise.allSettled)
   - Caching with timestamps
   - Fallback data

## Użytkowanie

### Dla użytkowników
1. **Nawigacja zakładek** - Kliknij zakładkę aby zobaczyć alerty tego typu
2. **Link do alertu** - Kliknij na alert aby przejść do GitHub
3. **Auto-refresh** - Dane odświeżają się automatycznie co 5-10 min

### Dla developerów

#### Dodanie nowego typu alertu
1. Dodaj fetching w workflow (main.yml)
2. Dodaj strukturę danych w stats
3. Dodaj rendering w `refreshSecurityAlerts()`
4. Dodaj CSS styles
5. Dodaj HTML section

#### Dostosowanie wyglądu
Zmień zmienne CSS w `:root`:
```css
:root {
  --primary: #00ff88;  /* Kolor główny */
  --text-primary: #ffffff;
  --text-secondary: rgba(255, 255, 255, 0.7);
}
```

#### Debug
Otwórz console w przeglądarce:
```javascript
// Zobacz dane security
fetch('data/github-stats.json').then(r => r.json()).then(console.log)

// Wymuś refresh
refreshSecurityAlerts()
refreshGitHubExtras()
```

## FAQ

**Q: Dlaczego nie widzę alertów?**
A: Możliwe przyczyny:
- Brak alertów w repozytoriach (to dobrze!)
- Brak uprawnień (workflow needs access)
- Features nie włączone w repo (Settings → Security)

**Q: Jak często są aktualizowane dane?**
A: Workflow uruchamia się co 15 minut. Dane na stronie odświeżają się co 5-10 minut.

**Q: Czy mogę dodać inne GitHub features?**
A: Tak! Workflow można rozszerzyć o:
- GitHub Actions status
- Workflow runs
- Deployment history
- Repository insights

**Q: Jak działa na urządzeniach mobilnych?**
A: Strona jest w pełni responsive:
- Zakładki układają się pionowo
- Grid zmienia się na 1 kolumnę
- Touch-friendly buttons (min 48px)

## Troubleshooting

### Workflow nie działa
1. Sprawdź GitHub Token permissions
2. Sprawdź czy repo ma włączone Security features
3. Zobacz logi w Actions

### Brak danych na stronie
1. Sprawdź czy `data/github-stats.json` istnieje
2. Sprawdź console errors
3. Sprawdź network tab (failed requests)

### Alerty nie wyświetlają się poprawnie
1. Sprawdź strukturę danych w JSON
2. Sprawdź console errors
3. Sprawdź CSS (może być nadpisany)

## Licencja i Credits

- Implementation: GitHub Copilot + Piotrunius
- Icons: Font Awesome 6.5.1
- API: GitHub REST API v3

## Changelog

### v1.0.0 (2025-12-26)
- ✨ Initial implementation
- ✨ Security Dashboard (Dependabot, CodeQL, Secrets)
- ✨ GitHub Insights (PRs, Issues, Languages)
- ✨ Responsive design
- ✨ Light mode support
- ✨ CodeQL security scan: 0 alerts
