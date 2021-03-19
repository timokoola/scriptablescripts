// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: cyan; icon-glyph: bus;

let defaultStop = "HSL:1020131";
let topColorStr = "489FB5";
let bottomColorStr = "16697A";
let textColorStr = "FFFFFF";

let splittedArgs =
  args.widgetParameter && args.widgetParameter.split(";").length === 4
    ? args.widgetParameter.split(";")
    : `${defaultStop};${topColorStr};${bottomColorStr};${textColorStr}`.split(
        ";"
      );

let argsStop = splittedArgs[0];
let topColor = new Color(splittedArgs[1]);
let bottomColor = new Color(splittedArgs[2]);
let textColor = new Color(splittedArgs[3]);

let userStop =
  argsStop && typeof argsStop == "string" && argsStop.startsWith("HSL:")
    ? argsStop
    : defaultStop;

let busStopQuery = JSON.stringify({
  query: `{ stop(id: "${userStop}") { gtfsId name url code stoptimesWithoutPatterns(numberOfDepartures: 15) { scheduledDeparture realtimeDeparture departureDelay realtime realtimeState serviceDay headsign trip { routeShortName tripHeadsign directionId route { type } } } } }`,
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

// modeled after the example
async function createWidget(stops) {
  let currentStop = stops.data.stop;
  // API seems to return a bad url for stop time tables
  let linkUrl = `https://reittiopas.hsl.fi/pysakit/${currentStop.gtfsId}`;

  let title = `${currentStop.code} ${currentStop.name}`;
  let widget = new ListWidget();
  // Add background gradient
  let gradient = new LinearGradient();
  gradient.locations = [0, 1];
  gradient.colors = [topColor, bottomColor];
  widget.backgroundGradient = gradient;
  // Show title
  let titleStack = widget.addStack();
  let titleElement = titleStack.addText(title);
  titleElement.textColor = textColor;
  titleElement.font = Font.title3();
  widget.addSpacer(6);

  let df = new DateFormatter();
  df.useNoDateStyle();
  df.useShortTimeStyle();

  let rows = config.widgetFamily === "large" ? 15 : 4;

  for (
    let i = 0;
    i < currentStop.stoptimesWithoutPatterns.length && i < rows;
    i++
  ) {
    let item = currentStop.stoptimesWithoutPatterns[i];
    let itemDate = new Date(
      item.serviceDay * 1000 + item.realtimeDeparture * 1000
    );

    let departureStack = widget.addStack();
    departureStack.url = linkUrl;

    let shortName = `${item.trip.routeShortName}`;
    let routeElement = departureStack.addText(shortName.padEnd(6, " "));
    routeElement.font = new Font("Menlo", 13);
    routeElement.textColor = textColor;

    let spacer = 2;

    if (config.widgetFamily !== "small") {
      departureStack.addSpacer(spacer);
      let headSignElement = departureStack.addText(`${item.trip.tripHeadsign}`);
      headSignElement.font = Font.systemFont(13);
      headSignElement.textColor = textColor;
    } else {
      departureStack.addSpacer(spacer);
      let headSignElement = departureStack.addText(
        `${item.trip.tripHeadsign.substring(0, 5)}`
      );
      headSignElement.font = Font.systemFont(13);
      headSignElement.textColor = textColor;
    }

    departureStack.addSpacer();
    let timeElement = departureStack.addText(`${df.string(itemDate)}`);
    timeElement.font = new Font("Menlo", 13);
    timeElement.textColor = textColor;
  }

  widget.addSpacer(20);

  // UI presented in Siri and Shortcuts is non-interactive, so we only show the footer when not running the script from Siri.
  if (!config.runsWithSiri) {
    widget.addSpacer(8);
    // Add button to open documentation
    let linkSymbol = SFSymbol.named("arrow.up.forward");
    let footerStack = widget.addStack();
    let linkStack = footerStack.addStack();
    linkStack.centerAlignContent();
    linkStack.url = linkUrl;
    let linkElement = linkStack.addText("See all departures");
    linkElement.font = Font.systemFont(13);
    linkElement.textColor = textColor;
    linkStack.addSpacer(3);
    let linkSymbolElement = linkStack.addImage(linkSymbol.image);
    linkSymbolElement.imageSize = new Size(11, 11);
    linkSymbolElement.tintColor = textColor;
    linkSymbolElement.imageOpacity = 0.6;
    footerStack.addSpacer();
    // Add link to Find bikes now
    let docsSymbol = SFSymbol.named("bus");
    let docsElement = footerStack.addImage(docsSymbol.image);
    docsElement.imageSize = new Size(20, 20);
    docsElement.tintColor = textColor;
    docsElement.imageOpacity = 0.8;
    docsElement.url = linkUrl;
  }
  return widget;
}
