var express = require('express')
var bodyParser = require('body-parser')
var request = require('request')
var app = express()
var token = "EAAZA1HjiMdTMBAMdFzJFZBKhhO2ALP418zH5PsnuXjWMXErn1Tfa4pMj924nwPAAPoyHugTZAI8Nm71YMsCVetDZARZCamJ3vHLLDEnfm8oeDKPHi4EglajuISdIyG4dTfrQKhdvAQvj5kByueVKq6byJKQM0DcS3PuijIZCIYAQZDZD";
var booksCatalog = require('./data/books_demo.json');

var texttools = require('./texttools');

app.set('port', (process.env.PORT || 5000))

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: false}))

// parse application/json
app.use(bodyParser.json())

// index
app.get('/', function (req, res) {
	res.send('hello world i am a secret bot')
})

// for facebook verification
app.get('/webhook/', function (req, res) {
	if (req.query['hub.verify_token'] === 'cibin_doesnt_know_how_fynny_he_is') {
		res.send(req.query['hub.challenge'])
	}
	res.send('Error, wrong token')
})

// to post data
app.post('/webhook/', function (req, res) {
	messaging_events = req.body.entry[0].messaging
	for (i = 0; i < messaging_events.length; i++) {
		event = req.body.entry[0].messaging[i]
		sender = event.sender.id
		if (event.message && event.message.text) {
			texttools.process(sender, event)
		}
		if (event.postback) {
			text = JSON.stringify(event.postback)
			sendTextMessage(sender, "Postback received: "+text.substring(0, 200), token)
			continue
		}
	}
	res.sendStatus(200)
})


// products: {id => {title, price, etc}}
function randomProducts(products, n){
	var selectedProducts = {};
	var keys = _.shuffle(Object.keys(products));
	for(i = 0; i < n && i < keys.length; i++){
		selectedProducts[keys[i]] = products[keys[i]]
	}

	return selectedProducts;
}

function searchProducts(products, tokens){
	for(i = 0; i < tokens.length; i++){
		products = searchProductsWithToken(products, tokens[i])
	}
	return products
}

function searchProductsWithToken(products, token){
	var selectedProducts = {};
	for (var key in products) {
		var product = products[key];
		if(product.title.indexOf(token) > -1) {
			selectedProducts[key] = product;
		}
	}

	return selectedProducts;
}

function sendTextMessage(sender, text) {
	messageData = {
		text:text
	}
	request({
		url: 'https://graph.facebook.com/v2.6/me/messages',
		qs: {access_token:token},
		method: 'POST',
		json: {
			recipient: {id:sender},
			message: messageData,
		}
	}, function(error, response, body) {
		if (error) {
			console.log('Error sending messages: ', error)
		} else if (response.body.error) {
			console.log('Error: ', response.body.error)
		}
	})
}

function generateProductElement(index)
{
	var product = booksCatalog[index];
	return {
					"title": product.title,
					"subtitle": product.subtitle,
					"image_url": product.img_url || "",
					"buttons": [{
						"type": "web_url",
						"url": product.web_url,
						"title": product.title || ""
					}, {
						"type": "postback",
						"title": "Postback",
						"payload": "Payload for first element in a generic bubble",
					}],
				} 
}

function sendGenericMessage(sender) {
	messageData = {
		"attachment": {
			"type": "template",
			"payload": {
				"template_type": "generic",
				"elements": [{
					"title": "First card",
					"subtitle": "Element #1 of an hscroll",
					"image_url": "http://messengerdemo.parseapp.com/img/rift.png",
					"buttons": [{
						"type": "web_url",
						"url": "https://www.messenger.com",
						"title": "web url"
					}, {
						"type": "postback",
						"title": "Postback",
						"payload": "Payload for first element in a generic bubble",
					}],
				}, {
					"title": "Second card",
					"subtitle": "Element #2 of an hscroll",
					"image_url": "http://messengerdemo.parseapp.com/img/gearvr.png",
					"buttons": [{
						"type": "postback",
						"title": "Postback",
						"payload": "Payload for second element in a generic bubble",
					}],
				}]
			}
		}
	}
	request({
		url: 'https://graph.facebook.com/v2.6/me/messages',
		qs: {access_token:token},
		method: 'POST',
		json: {
			recipient: {id:sender},
			message: messageData,
		}
	}, function(error, response, body) {
		if (error) {
			console.log('Error sending messages: ', error)
		} else if (response.body.error) {
			console.log('Error: ', response.body.error)
		}
	})
}

// spin spin sugar
app.listen(app.get('port'), function() {
	console.log('running on port', app.get('port'))
})
