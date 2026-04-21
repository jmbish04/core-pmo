const API_URL = "https://your-worker-url.workers.dev/api"; // To be updated

function onOpen() {
  DocumentApp.getUi()
    .createMenu("Vibe Coding")
    .addItem("Open Orchestrator", "showSidebar")
    .addToUi();
}

function showSidebar() {
  const html = HtmlService.createHtmlOutputFromFile("Sidebar").setTitle("Colby PMO").setWidth(300);
  DocumentApp.getUi().showSidebar(html);
}

function getDocumentId() {
  return DocumentApp.getActiveDocument().getId();
}

function getDocumentText() {
  return DocumentApp.getActiveDocument().getBody().getText();
}

function appendAnalysisToDoc(analysisText) {
  const body = DocumentApp.getActiveDocument().getBody();
  body.appendHorizontalRule();
  body.appendParagraph("AI Analysis Report:").setHeading(DocumentApp.ParagraphHeading.HEADING1);
  body.appendParagraph(analysisText);
}
