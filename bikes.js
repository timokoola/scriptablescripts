// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: green; icon-glyph: book;

// Our GraphQL Query
// Digitransit GraphQL API has a nice sandbox at
// https://api.digitransit.fi/graphiql/hsl
// and excellent documentation at
//
// The query below gets two bike stops closest to my home

let bikeQuery = JSON.stringify({
  query:
    '{ janneTie: bikeRentalStation(id:"216") { stationId name bikesAvailable spacesAvailable lat lon allowDropoff } pitsku: bikeRentalStation(id:"215") { stationId name bikesAvailable spacesAvailable lat lon allowDropoff } }',
});

let items = await getDigiTransit(bikeQuery);

// Base parts are from the Scriptable example "random Scriptable API"
let widget = await createWidget(items);
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

async function getDigiTransit(query) {
  let url = "https://api.digitransit.fi/routing/v1/routers/hsl/index/graphql";
  let r = new Request(url);
  r.method = "POST";
  r.headers = { "Content-Type": "application/json" };
  r.body = query;
  return await r.loadJSON();
}

// modeled after the example
async function createWidget(bikeStops) {
  let pitsku = bikeStops.data.pitsku;
  let janneTie = bikeStops.data.janneTie;

  let title = "Bikes";
  let widget = new ListWidget();
  // Add background gradient
  let gradient = new LinearGradient();
  gradient.locations = [0, 1];
  gradient.colors = [new Color("228844"), new Color("028822")];
  widget.backgroundGradient = gradient;
  // Show app icon and title
  let titleStack = widget.addStack();
  let titleElement = titleStack.addText(title);
  titleElement.textColor = Color.white();
  titleElement.font = Font.mediumSystemFont(13);
  widget.addSpacer(12);
  // Show Bikes
  console.log(janneTie);
  let nameElement = widget.addText(`${janneTie.name} ${janneTie.bikesAvailable}`);
  nameElement.textColor = Color.white();
  nameElement.font = Font.systemFont(18);
  widget.addSpacer(2);
  let descriptionElement = widget.addText(`${pitsku.name} ${pitsku.bikesAvailable}`);
  descriptionElement.minimumScaleFactor = 0.5;
  descriptionElement.textColor = Color.white();
  descriptionElement.font = Font.systemFont(18);
  // UI presented in Siri ans Shortcuta is non-interactive, so we only show the footer when not running the script from Siri.
  if (!config.runsWithSiri) {
    widget.addSpacer(8);
    // Add button to open documentation
    let linkSymbol = SFSymbol.named("arrow.up.forward");
    let footerStack = widget.addStack();
    let linkStack = footerStack.addStack();
    linkStack.centerAlignContent();
    linkStack.url = "https://www.findbikenow.com/#/map";
    let linkElement = linkStack.addText("Read more");
    linkElement.font = Font.mediumSystemFont(13);
    linkElement.textColor = Color.white();
    linkStack.addSpacer(3);
    let linkSymbolElement = linkStack.addImage(linkSymbol.image);
    linkSymbolElement.imageSize = new Size(11, 11);
    linkSymbolElement.tintColor = Color.blue();
    footerStack.addSpacer();
    // Add link to Find bikes now
    let docsSymbol = SFSymbol.named("bicycle.circle");
    let docsElement = footerStack.addImage(docsSymbol.image);
    docsElement.imageSize = new Size(20, 20);
    docsElement.tintColor = Color.white();
    docsElement.imageOpacity = 0.5;
    docsElement.url = "https://www.findbikenow.com/#/map";
  }
  return widget;
}
