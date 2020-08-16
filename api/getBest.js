
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

module.exports = (req, res) => {
  res.json(getBest());
}