// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: cyan; icon-glyph: bus;
let busStopQuery = JSON.stringify({
  query:
    '{  home: stop(id: "HSL:1463181") { gtfsId name url code stoptimesWithoutPatterns(numberOfDepartures: 10) { scheduledDeparture realtimeDeparture departureDelay realtime realtimeState serviceDay headsign trip { routeShortName tripHeadsign directionId route { type } } }  } office: stop(id: "HSL:2321222") { gtfsId name url code stoptimesWithoutPatterns(numberOfDepartures: 10) { scheduledDeparture realtimeDeparture departureDelay realtime realtimeState serviceDay headsign trip { routeShortName tripHeadsign directionId route { type } } }  }  }',
});

let items = await getDigiTransit(busStopQuery);

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

function atHomeTime() {
  let now = new Date();
  let hours = now.getHours();
  return hours < 10 || hours >= 18;
}

// modeled after the example
async function createWidget(bikeStops) {
  let home = bikeStops.data.home;
  let office = bikeStops.data.office;

  let currentStop = atHomeTime() ? home : office;
  let linkUrl = `https://reittiopas.hsl.fi/pysakit/${currentStop.gtfsId}`;

  let title = `${currentStop.code} ${currentStop.name}`;
  let widget = new ListWidget();
  // Add background gradient
  let gradient = new LinearGradient();
  gradient.locations = [0, 1];
  gradient.colors = [new Color("224488"), new Color("020211")];
  widget.backgroundGradient = gradient;
  // Show title
  let titleStack = widget.addStack();
  let titleElement = titleStack.addText(title);
  titleElement.textColor = Color.white();
  titleElement.font = Font.title3();
  widget.addSpacer(6);

  let df = new DateFormatter();
  df.useNoDateStyle();
  df.useShortTimeStyle();

  let rdf = new RelativeDateTimeFormatter();
  rdf.useNamedDateTimeStyle();

  let now = new Date();

  for (
    let i = 0;
    i < currentStop.stoptimesWithoutPatterns.length && i < 4;
    i++
  ) {
    let item = currentStop.stoptimesWithoutPatterns[i];
    let itemDate = new Date(
      item.serviceDay * 1000 + item.realtimeDeparture * 1000
    );

    let departureStack = widget.addStack();
    departureStack.url = linkUrl;

    let routeElement = departureStack.addText(`${item.trip.routeShortName}`);
    routeElement.font = Font.systemFont(13);
    routeElement.textColor = Color.white();
    departureStack.addSpacer(3);

    let headSignElement = departureStack.addText(`${item.trip.tripHeadsign}`);
    headSignElement.font = Font.systemFont(13);
    headSignElement.textColor = Color.white();

    departureStack.addSpacer();

    let timeElement = departureStack.addText(`${rdf.string(itemDate, now)}`);
    timeElement.font = Font.systemFont(13);
    timeElement.textColor = Color.white();
  }

  // UI presented in Siri ans Shortcuta is non-interactive, so we only show the footer when not running the script from Siri.
  if (!config.runsWithSiri) {
    widget.addSpacer(8);
    // Add button to open documentation
    let linkSymbol = SFSymbol.named("arrow.up.forward");
    let footerStack = widget.addStack();
    let linkStack = footerStack.addStack();
    linkStack.centerAlignContent();
    linkStack.url = linkUrl;
    let linkElement = linkStack.addText("Read more");
    linkElement.font = Font.systemFont(13);
    linkElement.textColor = Color.white();
    linkStack.addSpacer(3);
    let linkSymbolElement = linkStack.addImage(linkSymbol.image);
    linkSymbolElement.imageSize = new Size(11, 11);
    linkSymbolElement.tintColor = Color.blue();
    footerStack.addSpacer();
    // Add link to Find bikes now
    let docsSymbol = SFSymbol.named("bus");
    let docsElement = footerStack.addImage(docsSymbol.image);
    docsElement.imageSize = new Size(20, 20);
    docsElement.tintColor = Color.white();
    docsElement.imageOpacity = 0.8;
    docsElement.url = linkUrl;
  }
  return widget;
}
