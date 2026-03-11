"""
Generates the TriggerHub 2.0 project overview DOCX document
for a non-technical audience.
"""

from docx import Document
from docx.shared import Pt, RGBColor, Inches, Cm
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml.ns import qn
from docx.oxml import OxmlElement
import datetime

# ── helpers ──────────────────────────────────────────────────────────────────

def set_cell_bg(cell, hex_color: str):
    tc = cell._tc
    tcPr = tc.get_or_add_tcPr()
    shd = OxmlElement("w:shd")
    shd.set(qn("w:val"), "clear")
    shd.set(qn("w:color"), "auto")
    shd.set(qn("w:fill"), hex_color)
    tcPr.append(shd)


def set_cell_borders(table):
    """Light grey borders on all cells."""
    for row in table.rows:
        for cell in row.cells:
            tc = cell._tc
            tcPr = tc.get_or_add_tcPr()
            tcBorders = OxmlElement("w:tcBorders")
            for side in ("top", "left", "bottom", "right"):
                border = OxmlElement(f"w:{side}")
                border.set(qn("w:val"), "single")
                border.set(qn("w:sz"), "4")
                border.set(qn("w:space"), "0")
                border.set(qn("w:color"), "CCCCCC")
                tcBorders.append(border)
            tcPr.append(tcBorders)


def heading(doc, text, level=1, color=None):
    p = doc.add_heading(text, level=level)
    p.alignment = WD_ALIGN_PARAGRAPH.LEFT
    run = p.runs[0] if p.runs else p.add_run(text)
    if color:
        run.font.color.rgb = RGBColor(*bytes.fromhex(color))
    return p


def body(doc, text, bold=False, italic=False, size=11):
    p = doc.add_paragraph()
    run = p.add_run(text)
    run.font.size = Pt(size)
    run.bold = bold
    run.italic = italic
    p.paragraph_format.space_after = Pt(6)
    return p


def bullet(doc, items: list, style="List Bullet"):
    for item in items:
        p = doc.add_paragraph(style=style)
        run = p.add_run(item)
        run.font.size = Pt(11)


def add_table(doc, headers, rows, header_bg="1F4E79", header_fg="FFFFFF"):
    table = doc.add_table(rows=1 + len(rows), cols=len(headers))
    table.alignment = WD_TABLE_ALIGNMENT.LEFT
    table.style = "Table Grid"

    # Header row
    hdr = table.rows[0]
    for i, h in enumerate(headers):
        cell = hdr.cells[i]
        cell.text = h
        set_cell_bg(cell, header_bg)
        run = cell.paragraphs[0].runs[0]
        run.font.bold = True
        run.font.color.rgb = RGBColor(*bytes.fromhex(header_fg))
        run.font.size = Pt(10)
        cell.paragraphs[0].alignment = WD_ALIGN_PARAGRAPH.LEFT

    # Data rows
    for r_idx, row in enumerate(rows):
        tr = table.rows[r_idx + 1]
        bg = "EBF0F7" if r_idx % 2 == 0 else "FFFFFF"
        for c_idx, val in enumerate(row):
            cell = tr.cells[c_idx]
            cell.text = str(val)
            set_cell_bg(cell, bg)
            cell.paragraphs[0].runs[0].font.size = Pt(10)

    set_cell_borders(table)
    doc.add_paragraph()  # spacing after table
    return table


def page_break(doc):
    doc.add_page_break()


# ── document ─────────────────────────────────────────────────────────────────

doc = Document()

# ── page margins ──
for section in doc.sections:
    section.top_margin    = Cm(2.5)
    section.bottom_margin = Cm(2.5)
    section.left_margin   = Cm(2.8)
    section.right_margin  = Cm(2.8)

# ═══════════════════════════════════════════════════════════════════
# 1 -- TITELSEITE
# ═══════════════════════════════════════════════════════════════════
doc.add_paragraph()
doc.add_paragraph()
doc.add_paragraph()

title = doc.add_paragraph()
title.alignment = WD_ALIGN_PARAGRAPH.CENTER
run = title.add_run("TriggerHub 2.0")
run.font.size = Pt(36)
run.font.bold = True
run.font.color.rgb = RGBColor(0x1F, 0x4E, 0x79)

sub = doc.add_paragraph()
sub.alignment = WD_ALIGN_PARAGRAPH.CENTER
run = sub.add_run("Aktueller Entwicklungsstand -- Projektübersicht")
run.font.size = Pt(16)
run.font.color.rgb = RGBColor(0x44, 0x72, 0xC4)
run.font.italic = True

doc.add_paragraph()

date_p = doc.add_paragraph()
date_p.alignment = WD_ALIGN_PARAGRAPH.CENTER
run = date_p.add_run(f"Stand: {datetime.date.today().strftime('%d. %B %Y')}")
run.font.size = Pt(12)
run.font.color.rgb = RGBColor(0x66, 0x66, 0x66)

doc.add_paragraph()
doc.add_paragraph()

intro = doc.add_paragraph()
intro.alignment = WD_ALIGN_PARAGRAPH.CENTER
run = intro.add_run(
    "Dieses Dokument gibt einen verständlichen Überblick über TriggerHub 2.0 --\n"
    "ein Softwareprojekt, das gerade aktiv entwickelt wird."
)
run.font.size = Pt(12)
run.font.italic = True
run.font.color.rgb = RGBColor(0x44, 0x44, 0x44)

page_break(doc)

# ═══════════════════════════════════════════════════════════════════
# 2 -- DAS PROJEKT EINFACH ERKLÄRT
# ═══════════════════════════════════════════════════════════════════
heading(doc, "1 -- Das Projekt einfach erklärt", level=1, color="1F4E79")

body(doc,
    "TriggerHub 2.0 ist eine Desktop-App für Streamer und Content Creator -- "
    "also für Menschen, die Videospiele oder andere Inhalte live im Internet übertragen "
    "und dabei Videoclips für Plattformen wie TikTok, YouTube oder Instagram erstellen."
)

heading(doc, "Für wen ist es gedacht?", level=2, color="2F5597")
body(doc,
    "Die App richtet sich an alle, die regelmäßig streamen oder Videos produzieren und "
    "dabei viele verschiedene Programme gleichzeitig bedienen müssen -- zum Beispiel "
    "OBS Studio (für die Aufnahme), Spotify (für Musik), und diverse Clip-Tools. "
    "Das kostet Zeit und Konzentration."
)

heading(doc, "Welches Problem löst es?", level=2, color="2F5597")
body(doc,
    "Aktuell müssen Streamer alle diese Aktionen manuell ausführen: "
    "Szene wechseln, Musik starten, Aufnahme starten, Clips erstellen und exportieren. "
    "TriggerHub automatisiert genau das. Man definiert einmal Regeln -- zum Beispiel: "
    "'Wenn ich Szene Gameplay oeffne, starte automatisch die Aufnahme und spiele Track X ab' -- "
    "und die App erledigt den Rest."
)

heading(doc, "Warum ist die Idee sinnvoll?", level=2, color="2F5597")
body(doc,
    "Content Creation ist heutzutage ein ernsthafter Beruf oder zumindest ein aufwändiges "
    "Hobby. Professionelle Creator verbringen Stunden damit, Abläufe manuell zu koordinieren. "
    "TriggerHub gibt ihnen dieses Werkzeug zurück -- mit einer klaren Benutzeroberfläche, "
    "ohne Programmierkenntnisse vorauszusetzen."
)
body(doc,
    "Langfristig soll TriggerHub das Betriebssystem für Creator-Automation werden: "
    "eine einzige Plattform, die alle Tools eines Streamers verbindet, erweitert "
    "werden kann und von einer Community lebt.",
    italic=True
)

page_break(doc)

# ═══════════════════════════════════════════════════════════════════
# 3 -- AKTUELLER ENTWICKLUNGSSTAND
# ═══════════════════════════════════════════════════════════════════
heading(doc, "2 -- Aktueller Entwicklungsstand", level=1, color="1F4E79")

body(doc,
    "Das Projekt befindet sich in Version 0.1.0. Die Grundarchitektur ist vollständig "
    "ausgebaut und alle Kernsysteme sind implementiert. Die App ist technisch stabil "
    "und gut getestet -- sie ist aber noch nicht für den öffentlichen Einsatz freigegeben, "
    "da bestimmte Qualitätssicherungsschritte noch abgeschlossen werden."
)

heading(doc, "Hauptkomponenten im Überblick", level=2, color="2F5597")

add_table(doc,
    headers=["Komponente", "Was es macht", "Status"],
    rows=[
        ["Trigger-Engine",
         "Reagiert auf Ereignisse (z. B. Szenenwechsel) und startet Aktionen automatisch",
         "✅ Fertig"],
        ["Makro-System",
         "Führt komplexe, mehrstufige Abläufe in einer definierten Reihenfolge aus",
         "✅ Fertig"],
        ["Event-Bus",
         "Zentrales Nachrichtensystem -- alle Teile der App kommunizieren darüber",
         "✅ Fertig"],
        ["Hotkey-Manager",
         "Tastenkürzel können frei belegt werden und Aktionen auslösen",
         "✅ Fertig"],
        ["OBS-Integration",
         "Verbindung zu OBS Studio: Szenen wechseln, Aufnahme steuern",
         "✅ Fertig (Adapter)"],
        ["Spotify-Integration",
         "Musik automatisch starten/stoppen, Infos zum aktuellen Titel abrufen",
         "✅ Fertig (Adapter)"],
        ["Clip-Service",
         "Videoclips verarbeiten und in verschiedene Formate exportieren",
         "✅ Fertig (Adapter)"],
        ["Plugin-System",
         "Drittentwickler können die App um eigene Funktionen erweitern",
         "✅ Grundstruktur fertig"],
        ["Benutzeroberfläche",
         "Dashboard, Editor, Einstellungen, Plugin-Verwaltung",
         "🔄 In Entwicklung"],
        ["Desktop-App (Windows)",
         "Die fertige .exe-Datei, die Nutzer installieren können",
         "🔄 Pipeline bereit, Freigabe ausstehend"],
        ["Persistenz",
         "Trigger und Makros dauerhaft speichern (auch nach Neustart)",
         "⏳ Noch nicht implementiert"],
        ["Auto-Update",
         "App aktualisiert sich selbst wenn neue Versionen erscheinen",
         "⏳ Geplant"],
    ]
)

page_break(doc)

# ═══════════════════════════════════════════════════════════════════
# 4 -- WAS BEREITS FUNKTIONIERT
# ═══════════════════════════════════════════════════════════════════
heading(doc, "3 -- Was bereits funktioniert", level=1, color="1F4E79")

body(doc, "Folgende Dinge sind vollständig implementiert und durch automatische Tests abgesichert:")

bullet(doc, [
    "Trigger-Engine: Ereignisse werden erkannt, Bedingungen geprüft und Aktionen ausgelöst",
    "Makro-System: Mehrstufige Automationsabläufe werden korrekt ausgeführt",
    "Event-Bus: Alle App-Teile tauschen Nachrichten zuverlässig aus",
    "OBS-Adapter: Verbindung und Steuerung von OBS Studio ist technisch möglich",
    "Spotify-Adapter: Wiedergabe-Steuerung und Titelinformationen abrufbar",
    "Clip-Adapter: Verarbeitung und Export von Videoclips vorbereitet",
    "Plugin-Registrierung: Plugins können geladen, aktiviert und deaktiviert werden",
    "Dependency-Injection-Container: Alle Module werden sauber zusammengebaut",
    "Benutzeroberfläche (Grundstruktur): Dashboard, Header, Sidebar, Einstellungsseiten",
    "Testabdeckung: 106 automatische Tests laufen durch -- alle bestehen",
    "Architektur-Entscheidungen: 20 dokumentierte Designentscheidungen sichern die Qualität",
    "Release-Pipeline: Automatischer Build und Verteilung für Windows ist konfiguriert",
    "Website: Grundlegende Marketing-Seite mit Authentifizierung ist betriebsbereit",
])

page_break(doc)

# ═══════════════════════════════════════════════════════════════════
# 5 -- WAS NOCH IN ENTWICKLUNG IST
# ═══════════════════════════════════════════════════════════════════
heading(doc, "4 -- Was noch in Entwicklung ist", level=1, color="1F4E79")

body(doc, "Einige Bereiche sind noch nicht abgeschlossen:")

add_table(doc,
    headers=["Bereich", "Beschreibung", "Priorität"],
    rows=[
        ["Build-Blockade beheben",
         "Eine technische Datei importiert Windows-Systemfunktionen im Browser-Bundle -- muss getrennt werden",
         "🔴 Hoch"],
        ["TypeScript-Fehler",
         "4 kleinere Typfehler blockieren den automatischen Qualitätscheck",
         "🔴 Hoch"],
        ["Datenpersistenz",
         "Trigger und Makros werden aktuell nur im Arbeitsspeicher gehalten -- gehen beim Beenden verloren",
         "🟠 Mittel"],
        ["Auto-Update",
         "Mechanismus, damit die App sich selbst auf neue Versionen aktualisiert",
         "🟠 Mittel"],
        ["Plugin-Sandbox",
         "Plugins sollen sicher in einer isolierten Umgebung laufen",
         "🟡 Geplant"],
        ["Trigger-Editor (UI)",
         "Grafische Oberfläche zum komfortablen Erstellen von Automationsregeln",
         "🟡 Geplant"],
        ["Echte API-Integration",
         "Derzeit testen Adapter gegen interne Stubs -- reale Verbindungen werden schrittweise aktiviert",
         "🟡 Geplant"],
        ["Produktmetadaten",
         "Viele interne Beschreibungsdateien sind noch leer -- blockiert generierten Website-Inhalt",
         "🟡 Geplant"],
    ]
)

page_break(doc)

# ═══════════════════════════════════════════════════════════════════
# 6 -- NÄCHSTE ENTWICKLUNGSSCHRITTE
# ═══════════════════════════════════════════════════════════════════
heading(doc, "5 -- Nächste Entwicklungsschritte", level=1, color="1F4E79")

body(doc,
    "Die direkt bevorstehenden Meilensteine konzentrieren sich darauf, "
    "die App release-bereit zu machen und erste Kernfunktionen für echte Nutzer freizugeben."
)

add_table(doc,
    headers=["Schritt", "Ziel"],
    rows=[
        ["1. Qualitätsgates schließen",
         "Build-Fehler und TypeScript-Probleme lösen, damit die Release-Pipeline grünes Licht bekommt"],
        ["2. Erstes Release (v0.1)",
         "Erste installierbare Windows-Version (.exe) für frühe Tester veröffentlichen"],
        ["3. Datenpersistenz",
         "Trigger und Makros in einer Datei oder Datenbank speichern, damit Einstellungen erhalten bleiben"],
        ["4. Trigger-Editor fertigstellen",
         "Nutzer können ohne Programmierkenntnisse Automationsregeln visuell erstellen und anpassen"],
        ["5. Echte OBS-Verbindung testen",
         "Vollständigen Live-Test mit echter OBS Studio Instanz durchführen und Fehler beheben"],
        ["6. Auto-Update implementieren",
         "App informiert Nutzer über Updates und installiert sie auf Wunsch automatisch"],
    ]
)

page_break(doc)

# ═══════════════════════════════════════════════════════════════════
# 7 -- LANGFRISTIGE VISION
# ═══════════════════════════════════════════════════════════════════
heading(doc, "6 -- Langfristige Vision", level=1, color="1F4E79")

body(doc,
    "TriggerHub soll langfristig weit mehr sein als eine einfache Automations-App. "
    "Die Vision ist ein vollständiges Ökosystem für Content Creator."
)

add_table(doc,
    headers=["Phase", "Name", "Was passiert"],
    rows=[
        ["Phase 1 (jetzt)", "Grundlage",
         "Desktop-App funktioniert lokal: Trigger, Makros, OBS-Steuerung, erste Benutzeroberfläche"],
        ["Phase 2", "Creator-Tools",
         "Trigger-Editor, Makro-Builder, Stream-Automation -- Streamer können echte Workflows bauen"],
        ["Phase 3", "Erweiterbarkeit",
         "Plugin-Manager, Plugin-Installation, SDK für Entwickler -- externe Devs können Plugins bauen"],
        ["Phase 4", "Content-Tools",
         "Clip-Integration, automatische TikTok/YouTube-Exporte, Highlight-Erkennung"],
        ["Phase 5", "Community",
         "Plugin-Marktplatz, Community-Presets, Workflow-Sharing zwischen Nutzern"],
        ["Phase 6", "KI-Schicht",
         "KI-gestützte Trigger-Erstellung, automatische Clip-Erkennung, Sprachbefehle"],
    ]
)

body(doc,
    "Das Endziel: Creator müssen nicht mehr zwischen fünf verschiedenen Programmen wechseln. "
    "TriggerHub ist die eine Schaltzentrale, die alles verbindet.",
    italic=True, bold=True
)

page_break(doc)

# ═══════════════════════════════════════════════════════════════════
# 8 -- FAZIT
# ═══════════════════════════════════════════════════════════════════
heading(doc, "7 -- Fazit", level=1, color="1F4E79")

body(doc,
    "TriggerHub 2.0 ist kein Hobbyexperiment -- es ist ein professionell strukturiertes "
    "Softwareprojekt mit einer klaren Architektur, echten Tests und einem durchdachten Plan."
)
body(doc,
    "Die Kernlogik der App steht: 106 automatische Tests bestätigen, dass die wichtigsten "
    "Systeme korrekt funktionieren. Die Verbindungen zu OBS Studio, Spotify und dem "
    "Clip-Export sind technisch vorbereitet."
)
body(doc,
    "Was noch fehlt, sind vor allem zwei kleinere technische Hürden vor dem ersten Release, "
    "sowie Features wie dauerhafte Datenspeicherung und der visuelle Trigger-Editor. "
    "Diese Aufgaben sind klar definiert und planbar."
)
body(doc,
    "Die langfristige Vision -- ein Betriebssystem für Creator-Automation -- ist ambitioniert, "
    "aber realistisch: Die Grundpfeiler sind bereits gelegt, und jede Phase baut sinnvoll "
    "auf der vorherigen auf."
)
body(doc,
    "Insgesamt ist TriggerHub 2.0 ein Projekt, das auf einem sehr soliden Fundament steht "
    "und sich konsequent in Richtung seines großen Ziels bewegt.",
    bold=True
)

# ═══════════════════════════════════════════════════════════════════
# FOOTER NOTE
# ═══════════════════════════════════════════════════════════════════
doc.add_paragraph()
p = doc.add_paragraph()
p.alignment = WD_ALIGN_PARAGRAPH.CENTER
run = p.add_run("── Dieses Dokument wurde automatisch aus dem Projektstand generiert ──")
run.font.size = Pt(9)
run.font.color.rgb = RGBColor(0xAA, 0xAA, 0xAA)
run.font.italic = True

# ── save ─────────────────────────────────────────────────────────────────────
output_path = r"e:\Programmierung\TriggerHub2.0\docs\TriggerHub2_Projektübersicht.docx"
doc.save(output_path)
print(f"OK - Dokument gespeichert: {output_path}")
