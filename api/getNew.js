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

module.exports = (req, res) => {
  res.json(getNew());
}