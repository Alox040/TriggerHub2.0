from __future__ import annotations

from datetime import datetime
from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import (
    Image,
    PageBreak,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)
from reportlab.graphics.shapes import Drawing, Line, Polygon, Rect, String


PROJECT_ROOT = Path(__file__).resolve().parents[1]
timestamp = datetime.now().strftime("%Y-%m-%d_%H%M%S")
OUTPUT_PATH = PROJECT_ROOT / "docs" / f"TriggerHub2_Projektpraesentation_{timestamp}.pdf"
HERO_IMAGE_PATH = PROJECT_ROOT / "website" / "src" / "assets" / "41208bd857a758438641cb275dc7de957fd9fa9f.png"


def build_styles():
    styles = getSampleStyleSheet()
    styles.add(
        ParagraphStyle(
            name="HeroTitle",
            parent=styles["Title"],
            fontName="Helvetica-Bold",
            fontSize=34,
            leading=38,
            textColor=colors.HexColor("#0A2A43"),
            spaceAfter=10,
        )
    )
    styles.add(
        ParagraphStyle(
            name="SectionTitle",
            parent=styles["Heading1"],
            fontName="Helvetica-Bold",
            fontSize=24,
            leading=28,
            textColor=colors.HexColor("#0A2A43"),
            spaceBefore=8,
            spaceAfter=10,
        )
    )
    styles.add(
        ParagraphStyle(
            name="Claim",
            parent=styles["BodyText"],
            fontName="Helvetica",
            fontSize=14,
            leading=19,
            textColor=colors.HexColor("#1F4765"),
            spaceAfter=8,
        )
    )
    styles.add(
        ParagraphStyle(
            name="Body",
            parent=styles["BodyText"],
            fontName="Helvetica",
            fontSize=11,
            leading=16,
            textColor=colors.HexColor("#16222B"),
            spaceAfter=8,
        )
    )
    styles.add(
        ParagraphStyle(
            name="Caption",
            parent=styles["BodyText"],
            fontName="Helvetica-Oblique",
            fontSize=9,
            leading=12,
            textColor=colors.HexColor("#4B6170"),
            spaceAfter=6,
        )
    )
    return styles


def section_header(title: str) -> Drawing:
    d = Drawing(170 * mm, 12 * mm)
    d.add(Rect(0, 0, 170 * mm, 12 * mm, fillColor=colors.HexColor("#DCEAF4"), strokeColor=colors.HexColor("#DCEAF4")))
    d.add(String(4 * mm, 4 * mm, title, fontName="Helvetica-Bold", fontSize=12, fillColor=colors.HexColor("#0A2A43")))
    return d


def trigger_flow_diagram() -> Drawing:
    d = Drawing(170 * mm, 35 * mm)
    width = 46 * mm
    height = 18 * mm
    gap = 14 * mm
    y = 9 * mm
    x1 = 4 * mm
    x2 = x1 + width + gap
    x3 = x2 + width + gap

    for x, label, fill in [
        (x1, "Trigger", "#CBE7FF"),
        (x2, "Automation", "#D7F5DF"),
        (x3, "Aktion", "#FFE8C9"),
    ]:
        d.add(Rect(x, y, width, height, rx=4, ry=4, fillColor=colors.HexColor(fill), strokeColor=colors.HexColor("#6E8BA0")))
        d.add(String(x + 10 * mm, y + 7 * mm, label, fontName="Helvetica-Bold", fontSize=11, fillColor=colors.HexColor("#17364B")))

    d.add(Line(x1 + width, y + height / 2, x2 - 3 * mm, y + height / 2, strokeColor=colors.HexColor("#53748A"), strokeWidth=2))
    d.add(Polygon([x2 - 3 * mm, y + height / 2, x2 - 6 * mm, y + height / 2 + 2 * mm, x2 - 6 * mm, y + height / 2 - 2 * mm], fillColor=colors.HexColor("#53748A")))
    d.add(Line(x2 + width, y + height / 2, x3 - 3 * mm, y + height / 2, strokeColor=colors.HexColor("#53748A"), strokeWidth=2))
    d.add(Polygon([x3 - 3 * mm, y + height / 2, x3 - 6 * mm, y + height / 2 + 2 * mm, x3 - 6 * mm, y + height / 2 - 2 * mm], fillColor=colors.HexColor("#53748A")))
    return d


def architecture_diagram() -> Drawing:
    d = Drawing(170 * mm, 92 * mm)
    levels = [
        ("UI Layer", "#D9ECFF"),
        ("AppFacade / Controller", "#E4F3FF"),
        ("Core Engine (Trigger + Macro + EventBus)", "#D7F5DF"),
        ("Service Layer (OBS / Spotify / Clip)", "#FFE7CC"),
        ("Plugin Layer", "#F1E2FF"),
    ]
    y = 74 * mm
    for idx, (label, color) in enumerate(levels):
        d.add(Rect(14 * mm, y, 142 * mm, 12 * mm, rx=3, ry=3, fillColor=colors.HexColor(color), strokeColor=colors.HexColor("#6E8BA0")))
        d.add(String(18 * mm, y + 4 * mm, label, fontName="Helvetica-Bold", fontSize=10, fillColor=colors.HexColor("#1A3346")))
        if idx < len(levels) - 1:
            d.add(Line(85 * mm, y, 85 * mm, y - 6 * mm, strokeColor=colors.HexColor("#53748A"), strokeWidth=1.8))
            d.add(Polygon([85 * mm, y - 6 * mm, 83.5 * mm, y - 3.8 * mm, 86.5 * mm, y - 3.8 * mm], fillColor=colors.HexColor("#53748A")))
        y -= 17 * mm
    return d


def mockup_card(title: str, subtitle: str) -> Drawing:
    d = Drawing(80 * mm, 48 * mm)
    d.add(Rect(0, 0, 80 * mm, 48 * mm, rx=2, ry=2, fillColor=colors.HexColor("#F7FBFF"), strokeColor=colors.HexColor("#7B96AA")))
    d.add(Rect(0, 40 * mm, 80 * mm, 8 * mm, fillColor=colors.HexColor("#DCEAF4"), strokeColor=colors.HexColor("#DCEAF4")))
    d.add(String(2 * mm, 43 * mm, title, fontName="Helvetica-Bold", fontSize=8.8, fillColor=colors.HexColor("#14354C")))
    d.add(Rect(3 * mm, 4 * mm, 24 * mm, 32 * mm, fillColor=colors.HexColor("#E8F2FA"), strokeColor=colors.HexColor("#D2E2EE")))
    d.add(Rect(30 * mm, 22 * mm, 47 * mm, 14 * mm, fillColor=colors.HexColor("#E3F4E8"), strokeColor=colors.HexColor("#C4E6CF")))
    d.add(Rect(30 * mm, 4 * mm, 47 * mm, 14 * mm, fillColor=colors.HexColor("#FFEED8"), strokeColor=colors.HexColor("#F3D2A0")))
    d.add(String(31 * mm, 11 * mm, subtitle, fontName="Helvetica", fontSize=7.8, fillColor=colors.HexColor("#21445C")))
    return d


def build_pdf(output_path: Path):
    styles = build_styles()
    doc = SimpleDocTemplate(
        str(output_path),
        pagesize=A4,
        rightMargin=18 * mm,
        leftMargin=18 * mm,
        topMargin=16 * mm,
        bottomMargin=16 * mm,
        title="TriggerHub 2.0 - Projektpraesentation",
        author="TriggerHub Team",
    )

    story = []

    # 1) Titelseite
    story.append(Spacer(1, 26 * mm))
    story.append(Paragraph("TriggerHub 2.0", styles["HeroTitle"]))
    story.append(Paragraph("Creator-Automation fuer wiederholbare Live-Workflows", styles["Claim"]))
    story.append(Paragraph(f"Projektpraesentation | Stand: {datetime.now().date().isoformat()}", styles["Body"]))
    story.append(Spacer(1, 8 * mm))
    if HERO_IMAGE_PATH.exists():
        story.append(Image(str(HERO_IMAGE_PATH), width=132 * mm, height=74 * mm))
        story.append(Paragraph("Visual: Projektmotiv / Branding-Asset", styles["Caption"]))
    else:
        story.append(mockup_card("TriggerHub Branding", "Logo/Key Visual Platzhalter"))
        story.append(Paragraph("Platzhalter: Hier kann spaeter ein offizielles Projektlogo eingefuegt werden.", styles["Caption"]))

    # 2) Was ist das Projekt
    story.append(PageBreak())
    story.append(section_header("2. WAS IST DAS PROJEKT"))
    story.append(Paragraph("Die Idee", styles["SectionTitle"]))
    story.append(Paragraph("TriggerHub ist eine modulare Windows-Desktop-Software fuer Creator und Streamer. Das Ziel ist, wiederholbare Schritte im Live-Betrieb automatisch auszufuehren.", styles["Body"]))
    story.append(Paragraph("Welches Problem wird geloest?", styles["SectionTitle"]))
    story.append(Paragraph("Viele Creator wechseln waehrend eines Streams staendig zwischen Tools, Fenstern und Shortcuts. Das kostet Fokus und erhoeht Fehler. TriggerHub reduziert diese manuellen Ketten auf klare Automationslogik.", styles["Body"]))
    story.append(Paragraph("Fuer wen ist es gedacht?", styles["SectionTitle"]))
    story.append(Paragraph("Primaere Zielgruppe sind automation-orientierte Streamer und Content Creator. Langfristig eignet sich die Plattform auch fuer Teams mit wiederkehrenden Produktionsablaeufen.", styles["Body"]))

    # 3) Wie die Software funktioniert
    story.append(PageBreak())
    story.append(section_header("3. WIE DIE SOFTWARE FUNKTIONIERT"))
    story.append(Paragraph("Vereinfachtes Prinzip", styles["SectionTitle"]))
    story.append(Paragraph("Ein Event loest einen Trigger aus. Der Trigger prueft Bedingungen und startet dann eine oder mehrere Aktionen. Diese Aktionen koennen in Makros verkettet werden.", styles["Body"]))
    story.append(trigger_flow_diagram())
    story.append(Spacer(1, 2 * mm))
    story.append(Paragraph("Beispiel: Twitch-Event -> Trigger prueft Bedingung -> Szene in OBS wechseln -> Chat-Nachricht senden.", styles["Caption"]))

    # 4) Automation-Beispiele
    story.append(PageBreak())
    story.append(section_header("4. AUTOMATION-BEISPIELE"))
    story.append(Paragraph("Konkrete Workflows", styles["SectionTitle"]))
    examples = [
        ["Trigger", "Automation", "Ergebnis"],
        ["Twitch Follow", "OBS Szene wechseln + Animation starten", "Reaktionsstarker Stream ohne manuelle Klicks"],
        ["Hotkey F11", "Fullscreen umschalten", "Schneller Fokuswechsel waehrend Live-Betrieb"],
        ["Macro Start Stream", "Szene setzen -> Aufnahme starten -> Musik starten", "Konstanter Stream-Start in einem Ablauf"],
        ["Plugin Event", "Custom Action aus Plugin ausfuehren", "Erweiterbarer Workflow fuer Spezialfaelle"],
    ]
    table = Table(examples, colWidths=[40 * mm, 78 * mm, 50 * mm])
    table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#0A2A43")),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                ("FONTNAME", (0, 1), (-1, -1), "Helvetica"),
                ("FONTSIZE", (0, 0), (-1, -1), 9.5),
                ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#9DB2C1")),
                ("BACKGROUND", (0, 1), (-1, -1), colors.HexColor("#F7FBFF")),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("LEFTPADDING", (0, 0), (-1, -1), 6),
                ("RIGHTPADDING", (0, 0), (-1, -1), 6),
                ("TOPPADDING", (0, 0), (-1, -1), 5),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
            ]
        )
    )
    story.append(table)

    # 5) Systemarchitektur
    story.append(PageBreak())
    story.append(section_header("5. SYSTEMARCHITEKTUR"))
    story.append(Paragraph("Architektur in einer Uebersicht", styles["SectionTitle"]))
    story.append(Paragraph("TriggerHub nutzt eine modulare, event-getriebene Architektur. Die UI spricht ueber die AppFacade mit dem Core, waehrend Integrationen im Service-Layer gekapselt sind. Plugins erweitern das Verhalten ohne den Kern umzubauen.", styles["Body"]))
    story.append(architecture_diagram())
    story.append(Paragraph("Grundregel: Core klein halten, Integrationen und Features ueber Services und Plugins erweitern.", styles["Caption"]))

    # 6) Visuelle Beispiele
    story.append(PageBreak())
    story.append(section_header("6. VISUELLE BEISPIELE"))
    story.append(Paragraph("UI-Ansichten (aktuell teils Mockup-basiert)", styles["SectionTitle"]))
    row_one = [mockup_card("Dashboard", "Live-Status und Trigger-Karten"), mockup_card("Automation Editor", "Trigger- und Makro-Konfiguration")]
    row_two = [mockup_card("Plugin System", "Registry und Lifecycle"), mockup_card("Workflow Builder", "Mehrstufige Automationsketten")]
    t = Table([row_one, row_two], colWidths=[82 * mm, 82 * mm], rowHeights=[50 * mm, 50 * mm])
    t.setStyle(TableStyle([("VALIGN", (0, 0), (-1, -1), "TOP"), ("LEFTPADDING", (0, 0), (-1, -1), 0), ("RIGHTPADDING", (0, 0), (-1, -1), 0)]))
    story.append(t)
    story.append(Spacer(1, 4 * mm))
    story.append(Paragraph("Hinweis: Wenn echte Screenshots verfuegbar sind, lassen sich die vier Platzhalter direkt ersetzen.", styles["Caption"]))

    # 7) Entwicklungsstatus
    story.append(PageBreak())
    story.append(section_header("7. AKTUELLER ENTWICKLUNGSSTATUS"))
    story.append(Paragraph("Bereits umgesetzt", styles["SectionTitle"]))
    done_items = [
        "Kernsysteme: TriggerEngine, TriggerExecutor, TriggerGraph, MacroEngine und EventBus sind implementiert.",
        "Architektur: Clean/Hexagonal Struktur mit AppFacade, DI-Bootstrap und modularen Ports.",
        "Automationslogik: Trigger-Ausfuehrung, Conditions und Action-Dispatch funktionieren.",
        "Plugin-Basis: Registry-Lifecycle (register/activate/deactivate) inklusive Example Plugin.",
        "Qualitaet: Test-Suite mit 14 Testdateien ueber Core, UI, Services und Plugin-Layer.",
    ]
    for item in done_items:
        story.append(Paragraph(f"• {item}", styles["Body"]))
    story.append(Spacer(1, 2 * mm))
    story.append(Paragraph("In Entwicklung", styles["SectionTitle"]))
    in_progress = [
        "Electron IPC Bridge fuer echte Hotkeys und Window-Management.",
        "Reale Integrationen (OBS WebSocket / Spotify OAuth) statt nur InMemory-Transports.",
        "Editor-, Plugin- und Settings-Seiten: aktuell Scaffold, Funktionalitaet folgt.",
        "Persistenz, Auto-Update und CI/CD-Pipeline fuer produktionsnahe Releases.",
    ]
    for item in in_progress:
        story.append(Paragraph(f"• {item}", styles["Body"]))

    # 8) Naechste Schritte
    story.append(PageBreak())
    story.append(section_header("8. NAECHSTE SCHRITTE"))
    story.append(Paragraph("Meilensteine der naechsten Entwicklungsphase", styles["SectionTitle"]))
    milestones = [
        ["1", "IPC-Bruecke umsetzen", "Hotkeys, Fenstersteuerung und Desktop-Features aktivieren"],
        ["2", "CI + Release Workflows", "Automatische Qualitaetschecks und reproduzierbare Builds"],
        ["3", "Error Boundary integrieren", "Stabilere UI bei Laufzeitfehlern"],
        ["4", "OBS-Integration produktiv", "Direkte Stream-Steuerung aus TriggerHub"],
        ["5", "Persistenzlayer einfuehren", "Trigger, Makros und Einstellungen dauerhaft speichern"],
    ]
    m_table = Table([["#", "Meilenstein", "Nutzen"]] + milestones, colWidths=[10 * mm, 62 * mm, 96 * mm])
    m_table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#0A2A43")),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                ("BACKGROUND", (0, 1), (-1, -1), colors.HexColor("#F7FBFF")),
                ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#9DB2C1")),
                ("FONTNAME", (0, 1), (-1, -1), "Helvetica"),
                ("FONTSIZE", (0, 0), (-1, -1), 9.3),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ]
        )
    )
    story.append(m_table)

    # 9) Zukunftsvision
    story.append(PageBreak())
    story.append(section_header("9. ZUKUNFTSVISION"))
    story.append(Paragraph("Langfristiges Potenzial", styles["SectionTitle"]))
    story.append(Paragraph("TriggerHub kann sich von einer Desktop-Automation fuer Streamer zu einer offenen Creator-Automation-Plattform entwickeln. Das umfasst Plugin-Ecosystem, Workflow-Sharing, Cloud-Sync und perspektivisch AI-gestuetzte Trigger-Erstellung.", styles["Body"]))
    story.append(Paragraph("Strategisch entsteht damit ein System, das nicht nur einzelne Buttons steuert, sondern komplette Produktionsablaeufe koordinieren kann.", styles["Body"]))
    vision = Table(
        [
            ["Kurzfristig", "Stabile Kernfunktionen + reale Integrationen"],
            ["Mittelfristig", "Editor-UX, Persistenz, Auto-Update, Security Hardening"],
            ["Langfristig", "Plugin-Marktplatz, Community-Workflows, intelligente Automationen"],
        ],
        colWidths=[35 * mm, 133 * mm],
    )
    vision.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#F1F8FF")),
                ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#A9BECC")),
                ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),
                ("FONTNAME", (1, 0), (1, -1), "Helvetica"),
                ("FONTSIZE", (0, 0), (-1, -1), 10),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ]
        )
    )
    story.append(vision)

    # 10) Abschluss
    story.append(PageBreak())
    story.append(section_header("10. ABSCHLUSS"))
    story.append(Paragraph("Zusammenfassung", styles["SectionTitle"]))
    story.append(Paragraph("TriggerHub 2.0 besitzt bereits einen soliden technischen Kern mit funktionierender Trigger- und Makro-Engine, klarer Architektur und testbarer Basis. Der naechste Schritt ist die Bruecke zur produktionsnahen Nutzung: reale Integrationen, stabile Desktop-Features und ein ausgebauter Editor.", styles["Body"]))
    story.append(Paragraph("Damit ist das Projekt in einer starken Position: Der Grundstein ist gelegt, und das Potenzial fuer eine leistungsfaehige Creator-Automation-Plattform ist klar sichtbar.", styles["Body"]))
    story.append(Spacer(1, 8 * mm))
    story.append(Paragraph("Kontakt / Demo-Hinweis: Fuer Live-Demos koennen hier spaeter QR-Code oder Repo-Link ergänzt werden.", styles["Caption"]))

    doc.build(story)


if __name__ == "__main__":
    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    build_pdf(OUTPUT_PATH)
    print(f"PDF erzeugt: {OUTPUT_PATH}")
