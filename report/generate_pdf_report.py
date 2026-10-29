"""
PDF Report Generator for FleetFly Fuel Intelligence Project.
Compiles the comprehensive project report into a polished, professional PDF.
"""
import os
import sys
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
)
from reportlab.pdfgen import canvas

class NumberedCanvas(canvas.Canvas):
    """Adds 'Page X of Y' and running header to each page."""
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_header_footer(num_pages)
            super().showPage()
        super().save()

    def draw_header_footer(self, page_count):
        self.saveState()
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#64748b"))

        # Running Header (pages > 1)
        if self._pageNumber > 1:
            self.drawString(54, 750, "FleetFly Fuel Intelligence — MongoDB + ML College Project Report")
            self.setStrokeColor(colors.HexColor("#e2e8f0"))
            self.setLineWidth(0.5)
            self.line(54, 744, 558, 744)

        # Running Footer
        page_str = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(558, 36, page_str)
        self.drawString(54, 36, "Confidential — Academic Submission")
        self.setStrokeColor(colors.HexColor("#e2e8f0"))
        self.setLineWidth(0.5)
        self.line(54, 48, 558, 48)
        self.restoreState()

def build_pdf_report():
    report_dir = os.path.dirname(os.path.abspath(__file__))
    pdf_path = os.path.join(report_dir, "FUEL_INTELLIGENCE_PROJECT_REPORT.pdf")

    doc = SimpleDocTemplate(
        pdf_path,
        pagesize=letter,
        leftMargin=54,
        rightMargin=54,
        topMargin=54,
        bottomMargin=54
    )

    styles = getSampleStyleSheet()
    
    # Custom Typography Palette
    title_style = ParagraphStyle(
        "CoverTitle",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=22,
        leading=26,
        textColor=colors.HexColor("#0f172a"),
        spaceAfter=6
    )
    subtitle_style = ParagraphStyle(
        "CoverSubtitle",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=12,
        leading=16,
        textColor=colors.HexColor("#2563eb"),
        spaceAfter=15
    )
    meta_style = ParagraphStyle(
        "CoverMeta",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=9,
        leading=13,
        textColor=colors.HexColor("#475569"),
        spaceAfter=15
    )
    h1_style = ParagraphStyle(
        "Heading1_Custom",
        parent=styles["Heading1"],
        fontName="Helvetica-Bold",
        fontSize=13,
        leading=17,
        textColor=colors.HexColor("#0f172a"),
        spaceBefore=14,
        spaceAfter=6,
        keepWithNext=True
    )
    h2_style = ParagraphStyle(
        "Heading2_Custom",
        parent=styles["Heading2"],
        fontName="Helvetica-Bold",
        fontSize=10.5,
        leading=14,
        textColor=colors.HexColor("#1e293b"),
        spaceBefore=10,
        spaceAfter=4,
        keepWithNext=True
    )
    body_style = ParagraphStyle(
        "Body_Custom",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=9,
        leading=13,
        textColor=colors.HexColor("#334155"),
        spaceAfter=6
    )
    bullet_style = ParagraphStyle(
        "Bullet_Custom",
        parent=body_style,
        leftIndent=14,
        bulletIndent=4,
        spaceAfter=3
    )
    code_style = ParagraphStyle(
        "Code_Custom",
        parent=styles["Code"],
        fontName="Courier",
        fontSize=7.5,
        leading=10,
        textColor=colors.HexColor("#0f172a"),
        backColor=colors.HexColor("#f8fafc"),
        borderPadding=6,
        spaceAfter=6
    )

    story = []

    # Title & Subtitle
    story.append(Spacer(1, 10))
    story.append(Paragraph("FLEETFLY: FUEL INTELLIGENCE & PREDICTIVE EFFICIENCY", title_style))
    story.append(Paragraph("A Practical Integration of MongoDB, PyMongo, and Machine Learning in Fleet Management", subtitle_style))
    story.append(Paragraph("<b>Degree Program:</b> B.Tech Computer Science & Engineering &nbsp;|&nbsp; <b>Course:</b> DBMS & ML Laboratory<br/><b>Live Base Project:</b> https://www.thefleetfly.xyz/ &nbsp;|&nbsp; <b>Academic Session:</b> 2026", meta_style))
    story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor("#2563eb"), spaceAfter=12))

    # Abstract Box
    abstract_text = (
        "<b>Abstract:</b> Fleet management applications generate substantial telemetry logs, with fuel representing up to 40% of fleet operating costs. "
        "This project develops <b>Fuel Intelligence</b>, an end-to-end predictive feature integrated into FleetFly. "
        "The system employs <b>MongoDB</b> as a polyglot document store, uses <b>PyMongo</b> for CRUD, indexing, and multi-stage aggregation pipelines, and implements supervised machine learning via <b>Linear Regression</b> (continuous MPG) and a <b>Decision Tree Classifier</b> (efficiency tiers). "
        "On the held-out test split of the UCI Auto MPG benchmark dataset, the Linear Regression model achieves an <b>R² of 0.7861</b> (MAE 2.6732 MPG), while the Decision Tree achieves an <b>Accuracy of 88.75%</b>, <b>Precision of 0.8974</b>, <b>Recall of 0.8750</b>, and an <b>F1 Score of 0.8861</b>. "
        "All code, schemas, and verification pipelines are designed for complete academic reproducibility."
    )
    abstract_table = Table([[Paragraph(abstract_text, body_style)]], colWidths=[504])
    abstract_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#f0fdf4")),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#86efac")),
        ('LEFTPADDING', (0,0), (-1,-1), 10),
        ('RIGHTPADDING', (0,0), (-1,-1), 10),
        ('TOPPADDING', (0,0), (-1,-1), 8),
        ('BOTTOMPADDING', (0,0), (-1,-1), 8),
    ]))
    story.append(abstract_table)
    story.append(Spacer(1, 10))

    # 1. Project Title & Introduction
    story.append(Paragraph("1. Project Overview & Problem Statement", h1_style))
    story.append(Paragraph(
        "Commercial fleet operations require accurate asset monitoring, maintenance coordination, and operating expense management. "
        "While FleetFly currently tracks assets and schedules maintenance, fuel logs lacked predictive insight. "
        "Fleet managers need proactive estimation of expected fuel economy derived from vehicle mechanical specifications (cylinders, displacement, horsepower, and weight) before deployment.",
        body_style
    ))
    story.append(Paragraph(
        "The objective of this project is to integrate a lightweight Python data science service (<code>ml_service/</code>) with MongoDB using <b>PyMongo</b>, train supervised machine learning models, and present interactive analytics seamlessly within the existing React + Tailwind CSS dashboard.",
        body_style
    ))

    # 2. System Architecture
    story.append(Paragraph("2. System Architecture & Polyglot Persistence", h1_style))
    story.append(Paragraph(
        "The architecture combines an existing Node.js/Express backend with a dedicated Python PyMongo ML pipeline sharing the same MongoDB database (<code>fleetdb</code>):",
        body_style
    ))

    arch_data = [
        ["Layer", "Technology", "Role & Key Responsibilities"],
        ["Client (Frontend)", "React 18, Vite, Tailwind CSS", "Fuel Intelligence dashboard, interactive sliders, live predictions, metric cards"],
        ["API Server", "Node.js, Express, Mongoose", "REST endpoints for fuels, vehicles, predictions, and summary statistics"],
        ["ML Service", "Python 3.14, PyMongo, scikit-learn", "Data cleaning, model training, evaluation metrics, PyMongo CRUD & aggregation"],
        ["Database Layer", "MongoDB Atlas (fleetdb)", "Collections: vehicles, fuellogs, prediction_logs, ml_model_metrics, sandbox"]
    ]
    t_arch = Table(arch_data, colWidths=[90, 130, 284])
    t_arch.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#1e293b")),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('FONTSIZE', (0,0), (-1,0), 8),
        ('FONTNAME', (0,1), (-1,-1), 'Helvetica'),
        ('FONTSIZE', (0,1), (-1,-1), 8),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#cbd5e1")),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor("#f8fafc")]),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
    ]))
    story.append(t_arch)
    story.append(Spacer(1, 10))

    # 3. Dataset & Preprocessing
    story.append(Paragraph("3. Benchmark Dataset & Data Preprocessing", h1_style))
    story.append(Paragraph(
        "Because the demonstration database currently contains 3 vehicles and zero historical consecutive fuel records, synthesizing fake records to train a model would violate academic integrity. "
        "In accordance with project guidelines, models are trained on the verified <b>UCI Auto MPG Benchmark Dataset</b> (398 instances).",
        body_style
    ))
    story.append(Paragraph("<b>Preprocessing Pipeline:</b>", body_style))
    story.append(Paragraph("• <b>Missing Value Imputation:</b> 6 missing horsepower values ('?') were imputed via median (93.5 HP).", bullet_style))
    story.append(Paragraph("• <b>Target Definition:</b> Continuous target is MPG. Classification target is High Efficiency (1 if MPG >= median 23.00, 0 otherwise; class distribution: 201 vs 197).", bullet_style))
    story.append(Paragraph("• <b>Stratified Train-Test Split:</b> 80% training (318 samples) and 20% held-out test (80 samples) with fixed random seed (42).", bullet_style))
    story.append(Paragraph("• <b>Feature Standardization:</b> StandardScaler fitted strictly on training data and serialized via joblib.", bullet_style))
    story.append(Spacer(1, 8))

    # 4. PyMongo Operations
    story.append(Paragraph("4. PyMongo Implementation & Representative Queries", h1_style))
    story.append(Paragraph(
        "The Python implementation in <code>ml_service/src/mongo_client.py</code> demonstrates all required database operations:",
        body_style
    ))
    story.append(Paragraph("• <b>Connection:</b> <code>MongoClient(os.getenv('MONGODB_URI'))</code> connecting to database 'fleetdb'.", bullet_style))
    story.append(Paragraph("• <b>Read:</b> Queries existing vehicles and fuel logs using projections and chronological sorting.", bullet_style))
    story.append(Paragraph("• <b>Create / Insert:</b> Persists evaluation records to <code>ml_model_metrics</code> and vehicle predictions to <code>prediction_logs</code>.", bullet_style))
    story.append(Paragraph("• <b>Filtered Query & Update:</b> Queries predictions (<code>predicted_mpg >= 25.0</code>) and updates audit notes.", bullet_style))
    story.append(Paragraph("• <b>Safe Deletion:</b> Tests delete_one() strictly inside an isolated sandbox collection (<code>ml_demo_sandbox</code>), never touching fleet data.", bullet_style))
    story.append(Paragraph("• <b>Multi-Stage Aggregation Pipeline:</b> Groups fuel logs by vehicle, calculating total liters, total cost, distance traveled, and km/L:", bullet_style))

    agg_code = (
        "pipeline = [\n"
        "    { '$match': { 'liters': { '$gt': 0 }, 'cost': { '$gt': 0 } } },\n"
        "    { '$group': { '_id': '$vehicle', 'totalLiters': { '$sum': '$liters' }, 'totalCost': { '$sum': '$cost' },\n"
        "                  'minOdo': { '$min': '$odometer' }, 'maxOdo': { '$max': '$odometer' } } },\n"
        "    { '$lookup': { 'from': 'vehicles', 'localField': '_id', 'foreignField': '_id', 'as': 'v' } },\n"
        "    { '$project': { 'plate': '$v.plateNumber', 'liters': '$totalLiters', 'cost': '$totalCost',\n"
        "                    'distance': { '$subtract': ['$maxOdo', '$minOdo'] } } }\n"
        "]"
    )
    story.append(Paragraph(agg_code.replace("\n", "<br/>").replace(" ", "&nbsp;"), code_style))

    # 5. Machine Learning Models & Actual Evaluation Results
    story.append(Paragraph("5. Machine Learning Models & Experimental Results", h1_style))
    story.append(Paragraph(
        "All metrics below represent <b>actual experimental results</b> computed on the 20% held-out test partition (80 samples) and recorded in <code>ml_service/results/metrics.json</code>.",
        body_style
    ))

    # Regression Table
    story.append(Paragraph("<b>A. Linear Regression (Continuous Fuel Economy in MPG)</b>", h2_style))
    reg_table_data = [
        ["Metric", "Test Result", "Academic Interpretation"],
        ["R² Score", "0.7861", "The model explains 78.61% of fuel economy variance"],
        ["Mean Absolute Error (MAE)", "2.6732 MPG", "Average prediction error across held-out vehicles"],
        ["Root Mean Squared Error (RMSE)", "3.5554 MPG", "Standard deviation of prediction residuals"],
        ["Model Intercept", "23.4811", "Baseline economy for an average-specification vehicle"]
    ]
    t_reg = Table(reg_table_data, colWidths=[130, 94, 280])
    t_reg.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#2563eb")),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('FONTSIZE', (0,0), (-1,0), 8),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#cbd5e1")),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor("#f8fafc")]),
        ('FONTSIZE', (0,1), (-1,-1), 8),
        ('TOPPADDING', (0,0), (-1,-1), 3),
        ('BOTTOMPADDING', (0,0), (-1,-1), 3),
    ]))
    story.append(t_reg)
    story.append(Spacer(1, 6))

    # Classification Table
    story.append(Paragraph("<b>B. Decision Tree Classifier (Efficiency Tier Categorization, max_depth=4)</b>", h2_style))
    clf_table_data = [
        ["Metric", "Test Result", "Target / Positive Class Specification"],
        ["Accuracy", "0.8875 (88.75%)", "Overall classification correctness across test set"],
        ["Precision", "0.8974 (89.74%)", "Positive Class: High Efficiency (MPG >= 23.00)"],
        ["Recall (Sensitivity)", "0.8750 (87.50%)", "Fraction of true high-efficiency vehicles identified"],
        ["F1 Score", "0.8861 (88.61%)", "Harmonic mean of precision and recall"],
        ["Confusion Matrix", "TN: 36, FP: 4 / FN: 5, TP: 35", "36 true standard, 35 true high efficiency identified"]
    ]
    t_clf = Table(clf_table_data, colWidths=[130, 94, 280])
    t_clf.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#7c3aed")),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('FONTSIZE', (0,0), (-1,0), 8),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#cbd5e1")),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor("#f8fafc")]),
        ('FONTSIZE', (0,1), (-1,-1), 8),
        ('TOPPADDING', (0,0), (-1,-1), 3),
        ('BOTTOMPADDING', (0,0), (-1,-1), 3),
    ]))
    story.append(t_clf)
    story.append(Spacer(1, 10))

    # 6. Full-Stack UI Integration
    story.append(Paragraph("6. Full-Stack UI Enhancements in FleetFly", h1_style))
    story.append(Paragraph(
        "The feature was integrated directly into existing FleetFly pages without breaking existing functionality:",
        body_style
    ))
    story.append(Paragraph("• <b>Fuel Logs Page (<code>/dashboard/fuels</code>):</b> Upgraded from a coming-soon placeholder to a full dashboard with 4 summary metric cards, an interactive ML Prediction Panel (sliders for cylinders, displacement, horsepower, weight), real-time inference, prediction history from MongoDB, demo dataset loader, and fuel log entry modal.", bullet_style))
    story.append(Paragraph("• <b>Reports Page (<code>/dashboard/reports</code>):</b> Integrated the ML Model Evaluation section displaying actual test metrics for both models, confusion matrix, and dataset attribution.", bullet_style))
    story.append(Paragraph("• <b>Maintenance Page (<code>/dashboard/maintenance</code>):</b> Added a compact navigation link pointing to Fuel Intelligence without altering maintenance schedules.", bullet_style))
    story.append(Spacer(1, 8))

    # 7. Reproducible Execution Instructions
    story.append(Paragraph("7. Reproducible Execution Instructions", h1_style))
    story.append(Paragraph(
        "To execute and verify the complete project on any standard system:",
        body_style
    ))

    run_instructions = (
        "# 1. Install dependencies\n"
        "pip install -r ml_service/requirements.txt\n"
        "npm install --prefix backend && npm install --prefix frontend\n\n"
        "# 2. Execute PyMongo operations and ML training pipeline\n"
        "python -m ml_service.src.run_all\n\n"
        "# 3. Launch FleetFly application\n"
        "npm start --prefix backend      # Starts API on Port 5001\n"
        "npm run dev --prefix frontend   # Starts Vite UI on Port 5173"
    )
    story.append(Paragraph(run_instructions.replace("\n", "<br/>").replace(" ", "&nbsp;"), code_style))

    # 8. Conclusion
    story.append(Paragraph("8. Conclusion", h1_style))
    story.append(Paragraph(
        "The FleetFly Fuel Intelligence feature successfully integrates MongoDB document-oriented operations via PyMongo with supervised machine learning. "
        "The project achieves high predictive accuracy (R² = 0.7861, F1 = 0.8861) while adhering to professional software engineering standards, polyglot database design, and reproducible academic guidelines.",
        body_style
    ))

    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"Successfully compiled PDF report to: {pdf_path}")
    return pdf_path

if __name__ == "__main__":
    build_pdf_report()

