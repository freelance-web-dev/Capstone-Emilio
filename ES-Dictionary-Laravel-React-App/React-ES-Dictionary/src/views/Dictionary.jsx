import React, { useState } from "react";
import axiosClient from "../axios-client.js";

export default function Dictionary() {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchTermHeading, setSearchTermHeading] = useState("");
  const [dictionaryData, setDictionaryData] = useState(null);
  const [imageData, setImageData] = useState(null);

  const handleSearch = async () => {
    clearSearchTerm();

    try {
      const { data } = await axiosClient.post("/check", {
        word: searchTerm,
      });
      const response = { data };

      if (data.exists) {
        const {
          exists,
          word: {
            id,
            word: searchWord,
            image_url,
            part_of_speech,
            definition,
            pronunciation,
          },
        } = data;

        setDictionaryData({
          hwi: { hw: [pronunciation] },
          fl: [part_of_speech],
          shortdef: [definition],
        });

        setImageData(image_url);
        return;
      }

      // // Fetch the image data
      // await fetchImage();

      // // Fetch the dictionary data
      // await fetchDictionary();

      // await Promise.all([fetchImage(), fetchDictionary()]);

      const payload = await fetchData();

      if (payload) {
        setDictionaryData({
          hwi: { hw: [payload.pronunciation] },
          fl: [payload.part_of_speech],
          shortdef: [payload.definition],
        });
        
        setImageData(payload.image_url);
      }

      axiosClient
        .post("/store", payload)
        .then(({ word }) => {
          console.log(`You have searched the word ${word.word}!`);
        })
        .catch((err) => {
          const response = err.response;
          if (response && response.status === 422) {
            console.log(response.data.errors);
          }
        });
    } catch (error) {
      console.log("Error checking word:", error);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const clearSearchTerm = () => {
    setSearchTermHeading(searchTerm);
    setSearchTerm("");
  };

  const fetchData = async () => {
    const UnsplashKey = "Fj2N2fNmwFAPuSC_agE73Mfy0Sv9bqtXS3XhGEcCWSY";
    const UnsplashUrl = `https://api.unsplash.com/photos/random?query=${searchTerm}&client_id=${UnsplashKey}`;

    const MerriamWebKey = "98a198a3-a200-490a-ad48-98ac95b46d80";
    const MerriamWebUrl = `https://dictionaryapi.com/api/v3/references/collegiate/json/${searchTerm}?key=${MerriamWebKey}`;

    try {
      const [imageResponse, dictionaryResponse] = await Promise.all([
        fetch(UnsplashUrl),
        fetch(MerriamWebUrl),
      ]);

      const imageData = await imageResponse.json();
      const dictionaryData = await dictionaryResponse.json();

      // Filter the JSON data to include only the relevant entries
      const filteredData = dictionaryData.filter(
        (entry) => entry.shortdef && entry.shortdef.length > 0
      );

      const dictionaryDataToSet =
        filteredData.length > 0 ? filteredData[0] : null;

      // Create the payload using the response data
      const payload = createPayload(
        imageData.urls.small,
        dictionaryDataToSet
      );
      console.log(payload);

      return payload;
    } catch (error) {
      console.log("Error fetching data:", error);
      return null;
    }
  };

  const createPayload = async (imageData, dictionaryData, searchTerm) => {
    if (!dictionaryData) {
      return null; // Return null or handle the absence of data in a desired way
    }
  
    const { hwi, fl, shortdef } = dictionaryData;
  
    const pronunciation = hwi?.hw || "";
    const part_of_speech = fl || "";
    const definition = shortdef?.[0] || "";
    const image_url = imageData;
    const word = searchTerm;
  
    return {
      word,
      pronunciation,
      definition,
      part_of_speech,
      image_url,
    };
  };
  

  const renderDefinitions = () => {
    if (!dictionaryData) return null;

    const { hwi, fl, shortdef } = dictionaryData;

    return (
      <div className="mb-4">
        <div className="mb-2">
          <span className="bg-coffeeBrown text-black font-semibold py-1 px-2 rounded mr-2">
            {hwi && hwi.hw}
          </span>
          {fl && (
            <span className="bg-coffeeBrown text-black italic py-1 px-2 rounded mr-2">
              {fl}
            </span>
          )}
        </div>
        {shortdef && shortdef.length > 0 && <p>{shortdef[0]}</p>}
      </div>
    );
  };

  return (
    <div className="bg-coffee flex min-h-screen justify-center items-center">
      <div className="w-2/4 mx-auto min-w-full">
        <div className="max-w-md mx-auto mb-4 flex justify-evenly space-x-4">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Enter a word"
            className="w-3/4 px-4 py-2 font-semibold border-2 border-coffeeBrown rounded-md  focus:outline-double focus:ring-coffeeDark focus:border-coffeeDark"
            onKeyDown={handleKeyPress}
          />

          <button
            onClick={handleSearch}
            className="bg-coffeeBrown text-white text-lg font-semibold italic py-2 px-4 rounded shadow-sm shadow-coffeeDark hover:bg-coffeeDark  focus:ring-coffeeDark"
          >
            Search
          </button>
        </div>
        {dictionaryData && imageData && (
          <div className="max-w-md mx-auto bg-coffeeMate rounded-lg border-4 border-solid border-coffeeBrown shadow-coffeeDark shadow-sm p-4">
            <h1 className="text-3xl text-coffeeDark font-bold italic mb-4">
              {searchTermHeading}
            </h1>
            <div className="mb-4">
              <img
                src={imageData}
                alt={searchTerm}
                className="w-full rounded object-cover border-2 border-coffeeDark"
                style={{
                  maxHeight: "200px",
                  minHeight: "200px",
                }}
              />
            </div>
            <div
              className="flex flex-col"
              style={{ maxHeight: "140px", minHeight: "140px" }}
            >
              <div className="flex-1 overflow-y-auto">
                {renderDefinitions()}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
