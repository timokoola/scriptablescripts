// This widget was created by Max Zeryck @mzeryck

if (config.runsInWidget) {
  let widget = new ListWidget();
  widget.backgroundImage = files.readImage(path);

  // You can your own code here to add additional items to the "invisible" background of the widget.

  Script.setWidget(widget);
  Script.complete();

  /*
   * The code below this comment is used to set up the invisible widget.
   * ===================================================================
   */
} else {
  // Determine if user has taken the screenshot.
  var message;
  message =
    "Before you start, go to your home screen and enter wiggle mode. Scroll to the empty page on the far right and take a screenshot.";
  let exitOptions = ["Continue", "Exit to Take Screenshot"];
  let shouldExit = await generateAlert(message, exitOptions);
  if (shouldExit) return;

  // Get screenshot and determine phone size.
  let img = await Photos.fromLibrary();
  let height = img.size.height;
  let phone = phoneSizes()[height];
  if (!phone) {
    message =
      "It looks like you selected an image that isn't an iPhone screenshot, or your iPhone is not supported. Try again with a different image.";
    await generateAlert(message, ["OK"]);
    return;
  }

  // Prompt for widget size and position.
  message = "What size of widget are you creating?";
  let sizes = ["Small", "Medium", "Large"];
  let size = await generateAlert(message, sizes);
  let widgetSize = sizes[size];

  message = "What position will it be in?";
  message +=
    height == 1136
      ? " (Note that your device only supports two rows of widgets, so the middle and bottom options are the same.)"
      : "";

  // Determine image crop based on phone size.
  let crop = { w: "", h: "", x: "", y: "" };
  if (widgetSize == "Small") {
    crop.w = phone.small;
    crop.h = phone.small;
    let positions = [
      "Top left",
      "Top right",
      "Middle left",
      "Middle right",
      "Bottom left",
      "Bottom right",
    ];
    let position = await generateAlert(message, positions);

    // Convert the two words into two keys for the phone size dictionary.
    let keys = positions[position].toLowerCase().split(" ");
    crop.y = phone[keys[0]];
    crop.x = phone[keys[1]];
  } else if (widgetSize == "Medium") {
    crop.w = phone.medium;
    crop.h = phone.small;

    // Medium and large widgets have a fixed x-value.
    crop.x = phone.left;
    let positions = ["Top", "Middle", "Bottom"];
    let position = await generateAlert(message, positions);
    let key = positions[position].toLowerCase();
    crop.y = phone[key];
  } else if (widgetSize == "Large") {
    crop.w = phone.medium;
    crop.h = phone.large;
    crop.x = phone.left;
    let positions = ["Top", "Bottom"];
    let position = await generateAlert(message, positions);

    // Large widgets at the bottom have the "middle" y-value.
    crop.y = position ? phone.middle : phone.top;
  }

  // Crop image and finalize the widget.
  let imgCrop = cropImage(img, new Rect(crop.x, crop.y, crop.w, crop.h));

  message =
    "Your widget background is ready. Would you like to use it in a Scriptable widget or export the image?";
  const exportPhotoOptions = ["Export to Files", "Export to Photos"];
  const exportPhoto = await generateAlert(message, exportPhotoOptions);

  if (exportPhoto) {
    Photos.save(imgCrop);
  } else {
    await DocumentPicker.exportImage(imgCrop);
  }

  Script.complete();
}

// Generate an alert with the provided array of options.
async function generateAlert(message, options) {
  let alert = new Alert();
  alert.message = message;

  for (const option of options) {
    alert.addAction(option);
  }

  let response = await alert.presentAlert();
  return response;
}

// Crop an image into the specified rect.
function cropImage(img, rect) {
  let draw = new DrawContext();
  draw.size = new Size(rect.width, rect.height);

  draw.drawImageAtPoint(img, new Point(-rect.x, -rect.y));
  return draw.getImage();
}

// Pixel sizes and positions for widgets on all supported phones.
function phoneSizes() {
  let phones = {
    2688: {
      small: 507,
      medium: 1080,
      large: 1137,
      left: 81,
      right: 654,
      top: 228,
      middle: 858,
      bottom: 1488,
    },

    1792: {
      small: 338,
      medium: 720,
      large: 758,
      left: 54,
      right: 436,
      top: 160,
      middle: 580,
      bottom: 1000,
    },

    2436: {
      small: 465,
      medium: 987,
      large: 1035,
      left: 69,
      right: 591,
      top: 213,
      middle: 783,
      bottom: 1353,
    },

    2208: {
      small: 471,
      medium: 1044,
      large: 1071,
      left: 99,
      right: 672,
      top: 114,
      middle: 696,
      bottom: 1278,
    },

    1334: {
      small: 296,
      medium: 642,
      large: 648,
      left: 54,
      right: 400,
      top: 60,
      middle: 412,
      bottom: 764,
    },

    1136: {
      small: 282,
      medium: 584,
      large: 622,
      left: 30,
      right: 332,
      top: 59,
      middle: 399,
      bottom: 399,
    },
  };
  return phones;
}
