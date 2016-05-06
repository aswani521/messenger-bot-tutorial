var express = require('express')
var bodyParser = require('body-parser')
var request = require('request')
var app = express()
var token = "EAAZA1HjiMdTMBAMdFzJFZBKhhO2ALP418zH5PsnuXjWMXErn1Tfa4pMj924nwPAAPoyHugTZAI8Nm71YMsCVetDZARZCamJ3vHLLDEnfm8oeDKPHi4EglajuISdIyG4dTfrQKhdvAQvj5kByueVKq6byJKQM0DcS3PuijIZCIYAQZDZD";
var booksCatalog = require('./data/books.json');
var _ = require('lodash');

var quotes = [
	"I don't think so.",
	"I'm not going to do it!",
	"I'm going home",
	"I'm deep in the stack, leave me alone",
	"Unacceptable",
	"Whaaaat?",
	"Where's the food?",
	"It's not my day",
	"Hey Charles, so you're picture is still underway.",
]

// var texttools = require('./texttools');
// var messages = require('./messages');

app.set('port', (process.env.PORT || 5000))

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({
	extended: false
}))

// parse application/json
app.use(bodyParser.json())

// index
app.get('/', function(req, res) {
	res.send('hello world i am a secret bot')
})

// for facebook verification
app.get('/webhook/', function(req, res) {
	if (req.query['hub.verify_token'] === 'cibin_doesnt_know_how_fynny_he_is') {
		res.send(req.query['hub.challenge'])
	}
	res.send('Error, wrong token')
})

// to post data
app.post('/webhook/', function(req, res) {
	messaging_events = req.body.entry[0].messaging
	for (i = 0; i < messaging_events.length; i++) {
		event = req.body.entry[0].messaging[i]
		sender = event.sender.id
		if (event.message && event.message.text) {
			text = event.message.text
			if (text === 'Who won the hackathon?') {
				sendTextMessage(sender, "Well... that's an easy one: THE ASWANI TEAM!!!")
			}
			else {
			    if (text === 'Surprise me') {
					sendGenericMessage(sender);
				}
				sendTextMessage(sender, quotes[_.random(0,quotes.length)] + " Meh: " + text.substring(0, 200))
			}
			continue
		}
		if (event.postback) {
			text = JSON.stringify(event.postback)
			sendTextMessage(sender, "Postback received: " + text.substring(0, 200), token)
			continue
		}
	}
	res.sendStatus(200)
})


// products: {id => {title, price, etc}}
function randomProducts(products, n) {
	var selectedProducts = {};
	var keys = _.shuffle(Object.keys(products));
	for (i = 0; i < n && i < keys.length; i++) {
		selectedProducts[keys[i]] = products[keys[i]]
	}

	return selectedProducts;
}

function searchProducts(products, tokens) {
	for (i = 0; i < tokens.length; i++) {
		products = searchProductsWithToken(products, tokens[i])
	}
	return products
}

function searchProductsWithToken(products, token) {
	var selectedProducts = {};
	for (var key in products) {
		var product = products[key];
		if (product.title.indexOf(token) > -1) {
			selectedProducts[key] = product;
		}
	}

	return selectedProducts;
}

function sendTextMessage(sender, text) {
	messageData = {
		text: text
	}
	request({
		url: 'https://graph.facebook.com/v2.6/me/messages',
		qs: {
			access_token: token
		},
		method: 'POST',
		json: {
			recipient: {
				id: sender
			},
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

function generateProductElement(product) {
	return {
		"title": product.title,
		"image_url": product.image_url || "",
		"buttons": [{
			"type": "web_url",
			"url": product.url,
			"title": product.title || ""
		}, {
			"type": "postback",
			"title": "Postback",
			"payload": "Payload for first element in a generic bubble",
		}],
	}
}

function sendGenericMessage(sender) {
	// var elements = [];
	// var selectedProducts = randomProducts(booksCatalog, 2);
	// var keys = Object.keys(selectedProducts)
	// for(i = 0; i < keys.length; i ++){
	// 	elements.push(generateProductElement(selectedProducts[keys[i]]));
	// }

	// var elements = [generateProductElement(
	// 	{
	// 	  "category": "Juvenile Fiction - Social Issues - Values & Virtues",
	// 	  "title": "Max's Dragon Shirt",
	// 	  "url": "http://www.penguinrandomhouse.com//books/320471/maxs-dragon-shirt-by-rosemary-wells-illustrated-by-rosemary-wells/9780140567274",
	// 	  "price": 5.99,
	// 	  "image_url": "https://images.randomhouse.com/cover/9780140567274",
	// 	  "id": 2
	// 	}),
	// 	generateProductElement({
	// 	  "category": "History - United States - General",
	// 	  "title": "10 Days That Unexpectedly Changed America",
	// 	  "url": "http://www.penguinrandomhouse.com//books/60258/10-days-that-unexpectedly-changed-america-by-steven-m-gillon/9780307339348",
	// 	  "price": 14.0,
	// 	  "image_url": "https://images.randomhouse.com/cover/9780307339348",
	// 	  "id": 3
	// 	})
	// ];
	var elements = [
	  generateProductElement(booksCatalog[_.random(0,500)]),
	  generateProductElement(booksCatalog[_.random(0,500)])
	];
	messageData = {
		"attachment": {
			"type": "template",
			"payload": {
				"template_type": "generic",
				"elements": JSON.stringify(elements)
			}
		}
	}
	request({
		url: 'https://graph.facebook.com/v2.6/me/messages',
		qs: {
			access_token: token
		},
		method: 'POST',
		json: {
			recipient: {
				id: sender
			},
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