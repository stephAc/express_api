const express = require('express');
const fs = require('fs').promises;
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const v1 = express.Router();
const port = process.env.PORT || 3000;
const basicAuth = require('./middleware/basic-auth').basicAuth;
const MessageService = require('./services/message-service');
const messageService = new MessageService();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use('/api/v1', v1);

v1.get('/message', async (request, response) => {
  // const quotes = await fs.readFile('./data/quotes.json');
  // response.send(JSON.parse(quotes));
  const quotes = await messageService.getMessages();
  response.send(quotes);
});

v1.get('/message/:id', async (request, response) => {
  // let quotes = await fs.readFile('./data/quotes.json');
  // quotes = JSON.parse(quotes);
  // const message = quotes.find(
  //   quote => quote.id === parseInt(request.params.id),
  // );
  // !message ? response.sendStatus(404) : response.send(message);
  try {
    const message = await messageService.getMessage(request.params.id);
    !message ? response.sendStatus(404) : response.send(message);
  } catch (err) {
    response.sendStatus(400);
  }
});

v1.post('/message', basicAuth, async (request, response) => {
  const message = request.body;

  if (!MessageService.isMessageValid(request.body)) {
    return response.sendStatus(500);
  }

  const createdMessage = await messageService.createMessage(message);
  response.send(createdMessage);

  // let quotes = await fs.readFile('./data/quotes.json');
  // quotes = JSON.parse(quotes);
  // const ids = quotes.map(quote => quote.id);
  // message.id = Math.max.apply(null, ids) + 1;
  // response.send(message);
});

v1.delete('/message/:id', basicAuth, async (request, response) => {
  try {
    const deletedMessage = await messageService.deleteMessage(
      request.params.id,
    );
    response.sendStatus(deletedMessage ? 200 : 204);
  } catch (err) {
    response.sendStatus(400);
  }
});

v1.put('/message/:id', basicAuth, async (request, response) => {
  if (!MessageService.isMessageValid(request.body)) {
    return response.sendStatus(500);
  }
  try {
    const updatedMessage = await messageService.updateMessage(
      request.body,
      request.params.id,
    );
    if (!updatedMessage.isFind) {
      response.sendStatus(404);
    }
    response.sendStatus(updatedMessage.isModified ? 200 : 304);
  } catch (err) {
    response.sendStatus(400);
  }
});

app.listen(port, () => console.log(`App listning on port ${port}`));
