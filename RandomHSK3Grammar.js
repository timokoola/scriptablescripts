// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-brown; icon-glyph: magic;

let gp = await randomGrammarPoint();
let widget = await createWidget(gp);
if (config.runsInWidget) {
  // The script runs inside a widget, so we pass our instance of ListWidget to be shown inside the widget on the Home Screen.
  Script.setWidget(widget);
} else {
  // The script runs inside the app, so we preview the widget.
  widget.presentMedium();
}
// Calling Script.complete() signals to Scriptable that the script have finished running.
// This can speed up the execution, in particular when running the script from Shortcuts or using Siri.
Script.complete();

async function createWidget(gp) {
  let title = gp.title;
  let widget = new ListWidget();
  let yellow = new Color("ffdf00");
  // Add background gradient
  let gradient = new LinearGradient();
  gradient.locations = [0, 1];
  gradient.colors = [new Color("df2407"), new Color("200301")];
  widget.backgroundGradient = gradient;
  // Show app icon and title
  let titleStack = widget.addStack();
  let titleElement = titleStack.addText(title);
  titleElement.textColor = Color.white();
  titleElement.font = Font.mediumSystemFont(13);
  widget.addSpacer(12);
  // Show gp
  let nameElement = widget.addText(gp.description);
  nameElement.textColor = yellow;
  nameElement.font = Font.boldSystemFont(18);
  widget.addSpacer(2);
  let descriptionElement = widget.addText(gp.example);
  descriptionElement.minimumScaleFactor = 0.5;
  descriptionElement.textColor = yellow;
  descriptionElement.font = Font.systemFont(18);
  // UI presented in Siri ans Shortcuta is non-interactive, so we only show the footer when not running the script from Siri.
  if (!config.runsWithSiri) {
    widget.addSpacer(8);
    // Add button to open documentation
    let linkSymbol = SFSymbol.named("arrow.up.forward");
    let footerStack = widget.addStack();
    let linkStack = footerStack.addStack();
    linkStack.centerAlignContent();
    linkStack.url = gp.link;
    let linkElement = linkStack.addText("Chinese Grammar Wiki");
    linkElement.font = Font.mediumSystemFont(13);
    linkElement.textColor = Color.blue();
    linkStack.addSpacer(3);
    let linkSymbolElement = linkStack.addImage(linkSymbol.image);
    linkSymbolElement.imageSize = new Size(11, 11);
    linkSymbolElement.tintColor = Color.blue();
    footerStack.addSpacer();
    // Add link to documentation
    let docsSymbol = SFSymbol.named("book");
    let docsElement = footerStack.addImage(docsSymbol.image);
    docsElement.imageSize = new Size(20, 20);
    docsElement.tintColor = yellow;
    docsElement.url = gp.link;
  }
  return widget;
}

async function randomGrammarPoint() {
  let result = await loadDocs();
  log(result);
  let num = Math.round(Math.random() * result.length);
  return result[num];
}

async function loadDocs() {
  let url =
    "https://raw.githubusercontent.com/timokoola/scriptablescripts/main/hsk3.json";
  let req = new Request(url);
  return await req.loadJSON();
}
