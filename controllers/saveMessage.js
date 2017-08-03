'use strict';

function saveMessage(db, message) {
  const msgDate = new Date(message.timestamp);
  const dateYear = msgDate.getFullYear().toString();
  let dateMonth = (msgDate.getMonth() + 1).toString();
  dateMonth = dateMonth.length === 1 ? '0' + dateMonth : dateMonth;
  let dateDay = msgDate.getDate().toString();
  dateDay = dateDay.length === 1 ? '0' + dateDay : dateDay;
  const dateString = dateYear + dateMonth + dateDay;

  db.collection('messagesDaily').update(
    { day: dateString },
    {
      //$setOnInsert: { messages: [] },
      $push: { messages: message }
    },
    { upsert: true }
  )
}
module.exports = saveMessage;
