from pydantic import BaseModel, Field

class BPMUpdate(BaseModel):
    bpm: float = Field(..., ge=0, description="Beats per minute value")

    class Config:
        json_schema_extra = {
            "example": {
                "bpm": 120.5
            }
        }