let items=["https://is1-ssl.mzstatic.com/image/thumb/Purple124/v4/c4/7d/f4/c47df42b-1fa3-cac0-4e12-83e622624702/source/512x512bb.png","https://is1-ssl.mzstatic.com/image/thumb/Purple124/v4/c4/7d/f4/c47df42b-1fa3-cac0-4e12-83e622624702/source/512x512bb.png"]
let l=["longer Text for testing"," Dead Cells"]
let widget= new ListWidget()

const layout = { widgetPadding: new Size(5, 0), appIconSize: new Size(64, 64), appIconPadding: new Size(31, 41), appIconCorner: 12.5, appLabelColor: new Color("000", 0.7), appLabelFont: Font.boldSystemFont(12), screenResolution: Device.screenResolution() }
widget.setPadding(layout.widgetPadding.height, layout.widgetPadding.width, layout.widgetPadding.height, layout.widgetPadding.width) 


for (let i in items) { 
let stack = widget.addStack() 
stack.backgroundColor = new Color("FFFFFF", 0.2)
stack.centerAlignContent() 
stack.layoutVertically() 
let stack2 =stack.addStack()
stack2.layoutHorizontally()
stack2.addSpacer()
let image = stack2.addImage(await new Request(items[i]).loadImage()) 
image.cornerRadius = layout.appIconCorner
image.imageSize = layout.appIconSize 
image.centerAlignImage()
stack2.addSpacer()
stack2 =stack.addStack()
stack2.layoutHorizontally()
stack2.addSpacer()
let text = stack2.addText(l[i]) 
text.font = layout.appLabelFont 
text.textColor = layout.appLabelColor 
text.centerAlignText()
stack2.addSpacer()
} 
widget.presentLarge()