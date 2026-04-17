import { Permission } from "node-appwrite";
import { db, sliderTable } from "../name";
import { tablesDB } from "../server/config";

export default async function createSliderTable(){
    await tablesDB.createTable(db, sliderTable, sliderTable, [
       Permission.read("any"),
    ])
    console.log("Slider table is created");
    
    await Promise.all([
        tablesDB.createStringColumn(db, sliderTable, "sliderImage", 1000, true),
    ])
    console.log("Slider column is created");
    
}
