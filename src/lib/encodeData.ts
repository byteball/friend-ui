export const encodeData = (data: object) => {
  try {
    const sData = JSON.stringify(data);
    const encodedData = new TextEncoder().encode(sData);
    return btoa(String.fromCharCode(...encodedData));
  } catch (error) {
    console.error(error);
    throw new Error("Failed to encode data");
  }
};

