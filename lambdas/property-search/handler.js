const AWS = require("aws-sdk");
const {
  COUNTRY_LOOKUP,
  PROPERTY_TYPE_LOOKUP,
  LOCALE_ID,
  ERROR_MESSAGES,
} = require("../utils/constants");

const s3 = new AWS.S3();

function generateResponse(data, localeId) {
  const formatedResponse = data.map((ele) => ({
    contentType: "CustomPayload",
    content: `<div><ul style="list-style: none">
        <li><span style="font-weight:800">Title:</span> ${ele.title}</li>
        <li><span style="font-weight:800">Country:</span> ${ele.country_name}</li>
        <li><span style="font-weight:800">Email: </span> ${ele.email}</li>
        <li><span style="font-weight:800">Property type:</span> ${ele.propertyType}</li>
        <li><span style="font-weight:800">url: </span> <a href=${ele.url}>${ele.url}</a></li>
        <li><span style="font-weight:800">Size:</span> ${ele.size} SF</li>
      </ul>
      <img height=200 style="margin: 10px 5%" width="90%" src=${ele.url} />
      </div>`,
  }));
  formatedResponse.unshift({
    contentType: "PlainText",
    content:
      localeId === LOCALE_ID.HI_IN
        ? "मुझे कुछ मैच मिले हैं"
        : "I have found some matches. Here you go ...",
  });
  return formatedResponse;
}

module.exports.propertySearch = async (event) => {
  const localeId = event.bot.localeId;
  const Bucket = process.env.BUCKET_NAME;
  const fileName = process.env.FILE_NAME;

  const s3Params = {
    Bucket,
    Key: fileName + ".json",
  };

  try {
    const s3Response = await s3.getObject(s3Params).promise();

    const parseResponse = s3Response.Body.toString("utf-8");

    const responseBuildings = JSON.parse(parseResponse);

    const slots = event.sessionState.intent.slots;

    let propertyType = slots.PropertySlot.value.interpretedValue;
    let country = slots.CustomCountrySlot.value.interpretedValue;
    let minSize = slots.MinSizeSlot.value.interpretedValue;
    let maxSize = slots.MaxSizeSlot.value.interpretedValue;
    let content = "";

    if (propertyType && country && minSize && maxSize) {
      minSize = Number(slots.MinSizeSlot.value.interpretedValue);
      maxSize = Number(slots.MaxSizeSlot.value.interpretedValue);
      if (minSize > maxSize) {
        let temp = maxSize;
        maxSize = minSize;
        minSize = temp;
      }

      if (localeId === LOCALE_ID.HI_IN) {
        country = COUNTRY_LOOKUP[country];
        propertyType = PROPERTY_TYPE_LOOKUP[propertyType];
      }

      const filteredProperties = responseBuildings.filter(
        (p) =>
          p.country_name.toLowerCase() === country.toLowerCase() &&
          maxSize >= p.size &&
          minSize <= p.size &&
          p.propertyType.toLowerCase() ===
            PROPERTY_TYPE_LOOKUP[propertyType.toLowerCase()]
      );

      if (filteredProperties.length) {
        content = generateResponse(filteredProperties, localeId);
      } else {
        content = [
          {
            contentType: "PlainText",
            content:
              localeId === LOCALE_ID.HI_IN
                ? ERROR_MESSAGES.HINDI
                : ERROR_MESSAGES.ENGLISH,
          },
        ];
      }
    }

    return {
      sessionState: {
        dialogAction: {
          type: "Close",
        },
        intent: {
          name: "PropertySearchIntent",
          state: "Fulfilled ",
        },
      },
      messages: content,
    };
  } catch (error) {
    console.log(error, "error");
  }
};
