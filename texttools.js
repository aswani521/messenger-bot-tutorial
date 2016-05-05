// texttools.js
// ========
module.exports = {
  process: function (sender, event) {
  	text = event.message.text
    if (text === 'Generic') {
		messages.sendGenericMessage(sender);
	}
	sendTextMessage(sender, "Text received, echo: " + text.substring(0, 200))
  }
};