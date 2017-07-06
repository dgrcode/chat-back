const getInitialMessages = (db) => new Promise((resolve, reject) => {
  const date = new Date();
  const dateYear = date.getFullYear().toString();
  let dateMonth = (date.getMonth() + 1).toString();
  dateMonth = dateMonth.length === 1 ? '0' + dateMonth : dateMonth;
  let dateDay = date.getDate().toString();
  dateDay = dateDay.length === 1 ? '0' + dateDay : dateDay;
  const dateString = dateYear + dateMonth + dateDay;

  // TODO handle how first messages are fetched from the DB
  //db.collection('messagesDaily').findOne({ day: dateString })
  db.collection('messagesDaily').find().toArray()
  .then(docs => {
    resolve(docs.reduce((acc, val) => [...acc, ...val.messages], []));
  })
  .catch(err => reject(err));
});
module.exports = getInitialMessages;
