// texttools.js
// ========
module.exports = {
  process: function (sender, event) {
  	text = event.message.text
    if (text === 'Generic') {
		sendGenericMessage(sender)
		continue
	}
	sendTextMessage(sender, "Text received, echo: " + text.substring(0, 200))
  }
};