from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import json
import os

app = FastAPI(title="AI Material Price Predictor API", version="1.0.0")


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   
    allow_methods=["*"],
    allow_headers=["*"],
)




DATA_FILE = "materials.json"



if not os.path.exists(DATA_FILE):
    raise FileNotFoundError(
        f"❌ ERROR: '{DATA_FILE}' not found. Make sure you generated the file!"
    )

with open(DATA_FILE, "r", encoding="utf-8") as f:
    data = json.load(f)

full_data = data.get("data", [])
if not full_data:
    raise ValueError("❌ 'data' field is empty in materials.json")



class PredictionResponse(BaseModel):
    region: str
    produit: str
    variete: str
    annee: int
    prix: float

class ListResponse(BaseModel):
    items: List[str]



# Endpoints

@app.get("/", tags=["Status"])
def home():
    return {"message": "API is running", "records_loaded": len(full_data)}

@app.get("/data", tags=["Data"])
def get_all():
    return full_data


@app.get("/regions", tags=["Filters"], response_model=ListResponse)
def get_regions():
    regions = sorted({row["region"] for row in full_data})
    return {"items": regions}


@app.get("/produits", tags=["Filters"], response_model=ListResponse)
def get_produits():
    produits = sorted({row["produit"] for row in full_data})
    return {"items": produits}


@app.get("/varietes", tags=["Filters"], response_model=ListResponse)
def get_varietes(produit: str = Query(..., description="Product name")):
    varietes = {
        row["variete"] 
        for row in full_data 
        if row["produit"].lower() == produit.lower()
    }
    return {"items": sorted(varietes)}


@app.get("/predict", tags=["Prediction"], response_model=PredictionResponse)
def predict(
    region: str = Query(...),
    produit: str = Query(...),
    variete: str = Query(...),
    annee: int = Query(..., ge=2000, le=2035)
):

    # exact match
    for row in full_data:
        if (
            row["region"].lower() == region.lower()
            and row["produit"].lower() == produit.lower()
            and row["variete"].lower() == variete.lower()
            and int(row["annee"]) == int(annee)
        ):
            return row

    # return a user-friendly error
    raise HTTPException(
        status_code=404,
        detail=f"No data found for {region} — {produit} — {variete} — {annee}"
    )
