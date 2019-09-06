module.exports = (client, error) => {
  console.log(`Ошибка - ${error.message}\n В файле - ${error.fileName}\n В строке - ${error.lineNumber}`);
};