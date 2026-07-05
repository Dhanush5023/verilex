import io
from fpdf import FPDF
from app.models import Document

class LegalReportPDF(FPDF):
    def header(self):
        # Top banner decoration
        self.set_fill_color(15, 23, 42) # Deep slate-blue
        self.rect(0, 0, 210, 35, 'F')
        
        # Header text
        self.set_text_color(255, 255, 255)
        self.set_font("helvetica", "B", 18)
        self.cell(0, 10, "VeriLex Legal Audit Report", align="C", new_x="LMARGIN", new_y="NEXT")
        
        self.set_font("helvetica", "I", 10)
        self.cell(0, 5, "Autonomous AI Document Analysis & Risk Report", align="C", new_x="LMARGIN", new_y="NEXT")
        self.ln(12)

    def footer(self):
        # Draw a bottom thin line
        self.set_y(-18)
        self.set_draw_color(226, 232, 240)
        self.line(10, self.get_y(), 200, self.get_y())
        
        # Page numbers and disclaimer
        self.set_text_color(100, 116, 139)
        self.set_font("helvetica", "I", 8)
        self.cell(0, 8, "Disclaimer: Automated report. Informational only - not formal legal advice.", align="L")
        self.cell(0, 8, f"Page {self.page_no()}/{{nb}}", align="R")

def generate_report_pdf(doc: Document, report: dict) -> io.BytesIO:
    """Generates a professional PDF audit report in memory using fpdf2."""
    pdf = LegalReportPDF()
    pdf.set_auto_page_break(auto=True, margin=25)
    pdf.alias_nb_pages()
    pdf.add_page()
    
    # ─── SECTION 1: Document Details ───
    pdf.set_text_color(15, 23, 42)
    pdf.set_font("helvetica", "B", 14)
    pdf.cell(0, 8, "1. Document Metadata", new_x="LMARGIN", new_y="NEXT")
    pdf.ln(2)
    
    pdf.set_font("helvetica", "", 10)
    pdf.cell(50, 6, f"Original File Name: {doc.original_filename}")
    pdf.ln(5)
    pdf.cell(50, 6, f"Document Type: {(doc.document_type or 'General Contract').upper()}")
    pdf.ln(5)
    pdf.cell(50, 6, f"Status: Ready / Audited")
    pdf.ln(5)
    pdf.cell(50, 6, f"Created At: {doc.created_at.strftime('%Y-%m-%d %H:%M')}")
    pdf.ln(8)
    
    # ─── SECTION 2: Risk Summary ───
    pdf.set_font("helvetica", "B", 14)
    pdf.cell(0, 8, "2. Risk Assessment Summary", new_x="LMARGIN", new_y="NEXT")
    pdf.ln(2)
    
    risk_level = report.get("risk_level", "MEDIUM")
    risk_score = report.get("risk_score", 5.0)
    
    # Risk Badge background color based on level
    if risk_level in ["HIGH", "CRITICAL"]:
        pdf.set_fill_color(254, 226, 226) # light red
        pdf.set_text_color(220, 38, 38) # red-600
    elif risk_level == "MEDIUM":
        pdf.set_fill_color(254, 243, 199) # light yellow
        pdf.set_text_color(217, 119, 6) # amber-600
    else:
        pdf.set_fill_color(220, 252, 231) # light green
        pdf.set_text_color(22, 163, 74) # green-600
        
    pdf.set_font("helvetica", "B", 11)
    pdf.cell(75, 10, f"  RISK LEVEL: {risk_level} ({risk_score:.1f} / 10.0)  ", border=1, fill=True)
    pdf.ln(14)
    
    pdf.set_text_color(15, 23, 42)
    pdf.set_font("helvetica", "", 10)
    pdf.multi_cell(0, 6, report.get("summary", "No summary provided."), new_x="LMARGIN", new_y="NEXT")
    pdf.ln(4)
    
    # ─── SECTION 3: Action Recommendations ───
    pdf.set_font("helvetica", "B", 14)
    pdf.cell(0, 8, "3. Recommended Actions", new_x="LMARGIN", new_y="NEXT")
    pdf.ln(2)
    
    pdf.set_font("helvetica", "", 10)
    actions = report.get("recommended_actions", [])
    if not actions:
        pdf.cell(0, 6, "No actions required.", new_x="LMARGIN", new_y="NEXT")
    else:
        for act in actions:
            pdf.multi_cell(0, 6, f"- {act}", new_x="LMARGIN", new_y="NEXT")
            pdf.ln(1)
    pdf.ln(4)
    
    # ─── SECTION 4: Relevant Laws ───
    pdf.set_font("helvetica", "B", 14)
    pdf.cell(0, 8, "4. Governing Indian Legislation", new_x="LMARGIN", new_y="NEXT")
    pdf.ln(2)
    
    laws = report.get("relevant_laws", [])
    if not laws:
        pdf.set_font("helvetica", "", 10)
        pdf.cell(0, 6, "No specific sections cited.", new_x="LMARGIN", new_y="NEXT")
    else:
        for idx, law in enumerate(laws, 1):
            pdf.set_font("helvetica", "B", 11)
            pdf.cell(0, 6, f"{idx}. {law.get('act', 'Act')} - {law.get('section', 'Section')}", new_x="LMARGIN", new_y="NEXT")
            pdf.set_font("helvetica", "", 10)
            pdf.multi_cell(0, 5, law.get("description", ""), new_x="LMARGIN", new_y="NEXT")
            pdf.ln(2)
    pdf.ln(4)
    
    # ─── SECTION 5: Auto-Drafted Complaint ───
    pdf.add_page()
    pdf.set_font("helvetica", "B", 14)
    pdf.cell(0, 8, "5. Pre-Drafted Dispute Letter", new_x="LMARGIN", new_y="NEXT")
    pdf.ln(4)
    
    pdf.set_font("courier", "", 9.5)
    pdf.set_fill_color(248, 250, 252) # Light blue-gray border card
    
    complaint_txt = report.get("complaint_template", "Template not generated.")
    # Convert newlines to fit within FPDF spacing
    pdf.multi_cell(0, 5, complaint_txt, border=1, fill=True, new_x="LMARGIN", new_y="NEXT")
    
    # Compile bytes
    pdf_bytes = io.BytesIO()
    pdf_bytes.write(pdf.output())
    pdf_bytes.seek(0)
    return pdf_bytes
