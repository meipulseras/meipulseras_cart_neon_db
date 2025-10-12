import connectionToDB from "./connection.js";

async function getRegions() {
    const result = await connectionToDB()`SELECT * FROM regions`;
    return result;
};
        
export default getRegions;