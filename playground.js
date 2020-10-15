// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: orange; icon-glyph: frog;
let now = new Date();
let minutes = Math.floor(Math.random() * Math.floor(10000));
let randomMins = new Date(now - minutes);
let df = new DateFormatter();
df.useNoDateStyle();
df.useShortTimeStyle();
let timeString = df.string(now);

let rdf = new RelativeDateTimeFormatter();
rdf.useNamedDateTimeStyle();

Location.setAccuracyToHundredMeters();
let location = await Location.current();

let secs = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();

let title = `${timeString}`;
let row1 = `39 🚌 Kamppi 3min 8min`;
let row2 = `51 🚌 Kamppi 5min 17min`;
let link = "https://www.google.com";

// Base parts are from the Scriptable example "random Scriptable API"
let widget = await createWidget(title, row1, row2, link);
if (config.runsInWidget) {
  // The script runs inside a widget, so we pass our instance of ListWidget to be shown inside the widget on the Home Screen.
  Script.setWidget(widget);
} else {
  // The script runs inside the app, so we preview the widget.
  widget.presentSmall();
}
// Calling Script.complete() signals to Scriptable that the script have finished running.
// This can speed up the execution, in particular when running the script from Shortcuts or using Siri.
Script.complete();

async function createWidget(title, row1, row2, link) {
  let widget = new ListWidget();
  // Add background gradient
  let gradient = new LinearGradient();
  gradient.locations = [0, 1];
  gradient.colors = [new Color("224488"), new Color("020211")];
  widget.backgroundGradient = gradient;
  // Show app icon and title
  let titleStack = widget.addStack();
  let titleElement = titleStack.addText(title);
  titleElement.textColor = Color.white();
  titleElement.font = Font.mediumSystemFont(13);
  widget.addSpacer(12);
  // Show Bikes
  let nameElement = widget.addText(row1);
  nameElement.textColor = Color.white();
  nameElement.font = Font.systemFont(18);
  widget.addSpacer(2);
  let descriptionElement = widget.addText(row2);
  descriptionElement.textColor = Color.white();
  descriptionElement.font = Font.systemFont(18);
  let thirdElement = widget.addText(row1);
  thirdElement.textColor = Color.white();
  thirdElement.font = Font.systemFont(18);
  // UI presented in Siri ans Shortcuta is non-interactive, so we only show the footer when not running the script from Siri.
  if (!config.runsWithSiri) {
    widget.addSpacer(8);
    // Add button to open documentation
    let linkSymbol = SFSymbol.named("arrow.up.forward");
    let footerStack = widget.addStack();
    let linkStack = footerStack.addStack();
    linkStack.centerAlignContent();
    linkStack.url = link;
    let linkElement = linkStack.addText("Read more");
    linkElement.font = Font.mediumSystemFont(13);
    linkElement.textColor = Color.white();
    linkStack.addSpacer(3);
    let linkSymbolElement = linkStack.addImage(linkSymbol.image);
    linkSymbolElement.imageSize = new Size(11, 11);
    linkSymbolElement.tintColor = Color.blue();
    footerStack.addSpacer();
    // Add link to Find bikes now
    let docsSymbol = SFSymbol.named("clock.fill");
    let docsElement = footerStack.addImage(docsSymbol.image);
    docsElement.imageSize = new Size(20, 20);
    docsElement.tintColor = Color.white();
    docsElement.imageOpacity = 0.5;
    docsElement.url = link;
  }
  return widget;
}
