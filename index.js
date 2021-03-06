const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
const app = express();

const port = process.env.PORT || 5000;
//TODO add cashing


app.use(cors())

app.get("/", async (req, res) => {
  res.send("Hello, my gamer");
});

app.get("/best", async (req, res) => {
  res.send(await getBest());
});

app.get("/new", async (req, res) => {
  res.send(await getNew());
});


app.get("/comments/:id/:depth", async (req, res) => {
  res.send(await getComments(req.params.id, req.params.depth));
});

async function getNew(p = 50) {
  const response = await fetch("https://hacker-news.firebaseio.com/v0/newstories.json?print=pretty");
  const body = await response.json();

  const resultPromises = body.map(async id => {
    const itemResponse = await fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json?print=pretty`)
    const itemBody = await itemResponse.json();
    if (itemBody) {
      if (itemBody.score >= p) {
        //console.log('itemBody', itemBody);
        return {
          id: itemBody.id,
          by: itemBody.by,
          score: itemBody.score,
          title: itemBody.title,
          url: itemBody.url,
          time: itemBody.time,
          type: itemBody.type
        }
      }
    }

    return null;
  });

  const result = await Promise.all(resultPromises);

  return result.filter(e => e != null);
};


async function getBest() {
  const response = await fetch("https://hacker-news.firebaseio.com/v0/beststories.json?print=pretty");
  const body = await response.json();

  const resultPromises = body.map(async id => {
    const itemResponse = await fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json?print=pretty`)
    const itemBody = await itemResponse.json();
    if (itemBody.score > 100) {

      return {
        id: itemBody.id,
        by: itemBody.by,
        score: itemBody.score,
        title: itemBody.title,
        url: itemBody.url,
        time: itemBody.time,
        type: itemBody.type
      }
    }

    return null;
  });

  const result = await Promise.all(resultPromises);

  return result.filter(e => e != null);
}


async function getComments(postId, depth, index = 0) {
  const post = await (await fetch('https://hacker-news.firebaseio.com/v0/item/' + postId + '.json')).json();
  console.log(`depth: ${depth}, index ${index}`);

  let resultPromises = [];
  if (post.hasOwnProperty('kids') && (depth >= index)) {
    resultPromises = post.kids.map(async id => {
      const itemResponse = await fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`)
      const itemBody = await itemResponse.json();

      return {
        id,
        text: itemBody.text,
        kids: await getComments(id, depth, index + 1),
        time: itemBody.time,
        by: itemBody.by,
        parent: itemBody.parent
      }
    });
  }

  const result = await Promise.all(resultPromises);

  return result;
}

app.listen(port);