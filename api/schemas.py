from pydantic import BaseModel, Field

class BPMUpdate(BaseModel):
    bpm: float = Field(..., ge=0, description="Beats per minute value")

    class Config:
        json_schema_extra = {
            "example": {
                "bpm": 120.5
            }
        }


from pydantic import BaseModel, Field

class BPMRequest(BaseModel):
    bpm: float = Field(..., ge=20, le=200, description="Beats per minute for the generated music")