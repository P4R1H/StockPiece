//i am trusting that will get a valid doc
const isWindowOpen = async (chapterDoc) => {
  return (
    !chapterDoc.isWindowClosed &&
    Date.now() < chapterDoc.windowEndDate.getTime()
  );
};

export default isWindowOpen;
