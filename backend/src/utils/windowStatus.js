//i am trusting that will get a valid doc
const isWindowOpen = (chapterDoc) => {
  console.log(
    !chapterDoc.isWindowClosed &&
      Date.now() < chapterDoc.windowEndDate.getTime()
  );
  return (
    !chapterDoc.isWindowClosed &&
    Date.now() < chapterDoc.windowEndDate.getTime()
  );
};

export default isWindowOpen;
