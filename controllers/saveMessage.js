function saveMessage(db, message) {
  const dateYear = message.timestamp.getFullYear().toString();
  let dateMonth = (message.timestamp.getMonth() + 1).toString();
  dateMonth = dateMonth.length === 1 ? '0' + dateMonth : dateMonth;
  let dateDay = message.timestamp.getDate().toString();
  dateDay = dateDay.length === 1 ? '0' + dateDay : dateDay;
  const dateString = dateYear + dateMonth + dateDay;

  const messageObj = {
    user: message.sendUser,
    rawMessage: message.rawMessage,
    htmlMessage: message.htmlMessage,
    timestamp: message.timestamp
  }

  db.collection('messagesDaily').update(
    { day: dateString },
    {
      //$setOnInsert: { messages: [] },
      $push: { messages: messageObj }
    },
    { upsert: true }
  )
}
module.exports = saveMessage;
