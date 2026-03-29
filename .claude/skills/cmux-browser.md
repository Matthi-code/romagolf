---
name: cmux-browser
description: cmux terminal multiplexer met ingebouwde browser - commando's en workflows
---

# cmux — Terminal Multiplexer met Browser

cmux is een terminal multiplexer (gebaseerd op Ghostty) met een ingebouwde browser.
Binary: `/Applications/cmux.app/Contents/Resources/bin/cmux`

## Browser openen

```bash
# Open browser als split in huidige workspace
cmux browser open <url>

# Open als aparte split
cmux browser open-split <url>

# Nieuw pane met browser
cmux new-pane --type browser --url <url>
```

## Browser navigatie

```bash
cmux browser goto <url>          # Navigeer naar URL
cmux browser back                # Terug
cmux browser forward             # Vooruit
cmux browser reload              # Herlaad
cmux browser url                 # Huidige URL opvragen
```

## Browser interactie

```bash
cmux browser click <selector>    # Klik element
cmux browser fill <selector> <text>  # Vul input in
cmux browser type <selector> <text>  # Type tekst
cmux browser press <key>         # Druk toets (Enter, Tab, etc.)
cmux browser select <selector> <value>  # Selecteer optie
cmux browser hover <selector>    # Hover over element
cmux browser scroll --dy <n>     # Scroll (positief = omlaag)
```

## Browser info ophalen

```bash
cmux browser snapshot            # DOM snapshot (accessibility tree)
cmux browser snapshot -i         # Interactieve snapshot met refs
cmux browser screenshot          # Screenshot
cmux browser screenshot --out <path>  # Screenshot opslaan
cmux browser get url             # Huidige URL
cmux browser get title           # Pagina titel
cmux browser get text <selector> # Tekst van element
cmux browser get html <selector> # HTML van element
cmux browser eval <script>       # JavaScript uitvoeren
```

## Browser wachten

```bash
cmux browser wait --selector <css>       # Wacht op element
cmux browser wait --text <text>          # Wacht op tekst
cmux browser wait --url-contains <text>  # Wacht op URL
cmux browser wait --load-state complete  # Wacht tot geladen
```

## Browser zoeken

```bash
cmux browser find role <role>        # Vind op ARIA role
cmux browser find text <text>        # Vind op tekst
cmux browser find testid <id>        # Vind op data-testid
cmux browser find label <text>       # Vind op label
```

## Browser debugging

```bash
cmux browser console list        # Console logs
cmux browser errors list         # JavaScript errors
cmux browser is visible <sel>    # Check zichtbaarheid
cmux browser highlight <sel>     # Highlight element
```

## Workspace & Pane management

```bash
cmux tree                        # Toon alle windows/workspaces/panes
cmux list-panes                  # Lijst panes in workspace
cmux new-split right             # Split rechts
cmux new-split down              # Split onder
cmux focus-pane --pane <ref>     # Focus pane
cmux close-surface               # Sluit huidige surface
```

## Notificaties & Status

```bash
cmux notify --title "Klaar!" --body "Build geslaagd"
cmux set-status build "passing" --icon checkmark --color "#1a6b3c"
cmux set-progress 0.75 --label "75% klaar"
cmux log "Dit is een logbericht"
```

## Typisch development workflow

```bash
# 1. Open app in browser split
cmux browser open http://localhost:3000

# 2. Navigeer naar specifieke pagina
cmux browser goto http://localhost:3000/login

# 3. Test interactie
cmux browser fill "input[type=password]" "vrijmigo"
cmux browser click "button"

# 4. Check resultaat
cmux browser snapshot
cmux browser screenshot --out /tmp/test.png
```
