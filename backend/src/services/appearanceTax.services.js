import cheerio from "cheerio";
import fetch from "node-fetch";
import ApiError from "../utils/ApiError.utils";

export default async function appearanceTax(latestChapterNumber) {
  const chapterUrl = `https://onepiece.fandom.com/wiki/Chapter_${latestChapterNumber}`;
  const res = await fetch(chapterUrl);
  if (!res.ok) {
    throw new ApiError(500, `Failed to fetch chapter page: ${chapterUrl}`);
  }

  const html = await res.text();
  const $ = cheerio.load(html);
  const charTable = $("table.CharTable");

  const characters = {
    "Straw Hat Pirates": [],
    Others: [],
  };

  charTable.find("dl dt a").each((i, groupEl) => {
    const groupName = $(groupEl).text().trim();
    if (groupName) {
      const charList = $(groupEl).closest("dl").next("ul");

      charList.find("li a").each((j, charEl) => {
        const charInfo = $(charEl).text().trim();
        if (charInfo) {
          if (groupName === "Straw Hat Pirates") {
            characters["Straw Hat Pirates"].push(charInfo);
          } else {
            characters["Others"].push(charInfo);
          }
        }
      });
    }
  });

  return characters;
}
